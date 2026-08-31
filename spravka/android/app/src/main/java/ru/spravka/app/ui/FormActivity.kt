package ru.spravka.app.ui

import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject
import ru.spravka.app.R
import ru.spravka.app.data.Api
import ru.spravka.app.data.Store
import ru.spravka.app.data.newClientUuid
import java.time.LocalDate
import kotlin.concurrent.thread

class FormActivity : AppCompatActivity() {
    private lateinit var store: Store
    private lateinit var api: Api
    private val fields = mutableMapOf<Int, () -> String>()
    private var institutions = JSONArray()
    private var questions = JSONArray()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_form)
        store = Store(this)
        api = Api(store)
        val data = store.bootstrap()
        if (data == null) {
            Toast.makeText(this, "Нет кэша анкеты. Войдите при наличии сети.", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        institutions = data.getJSONArray("institutions")
        questions = data.getJSONArray("questions")
        val categories = data.getJSONArray("categories")
        val names = mutableListOf<String>()
        for (i in 0 until institutions.length()) names.add(institutions.getJSONObject(i).getString("name"))
        val spinner = findViewById<Spinner>(R.id.institution)
        spinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, names)
        findViewById<EditText>(R.id.reportDate).setText(LocalDate.now().toString())

        val box = findViewById<LinearLayout>(R.id.questions)
        val catMap = mutableMapOf<Int, String>()
        for (i in 0 until categories.length()) {
            val c = categories.getJSONObject(i)
            catMap[c.getInt("id")] = c.getString("name")
        }
        var lastCat = -1
        for (i in 0 until questions.length()) {
            val q = questions.getJSONObject(i)
            val catId = q.getInt("category_id")
            if (catId != lastCat) {
                lastCat = catId
                val h = TextView(this)
                h.text = catMap[catId] ?: ""
                h.textSize = 18f
                h.setPadding(0, 24, 0, 8)
                h.setTextColor(0xFF1B365D.toInt())
                box.addView(h)
            }
            box.addView(buildField(q))
        }

        findViewById<Button>(R.id.saveLocal).setOnClickListener { save(false) }
        findViewById<Button>(R.id.saveSync).setOnClickListener { save(true) }
    }

    private fun buildField(q: JSONObject): View {
        val wrap = LinearLayout(this)
        wrap.orientation = LinearLayout.VERTICAL
        wrap.setPadding(0, 8, 0, 12)
        val label = TextView(this)
        val required = q.optBoolean("required")
        label.text = q.getString("text") + if (required) " *" else ""
        wrap.addView(label)
        val id = q.getInt("id")
        when (q.optString("answer_type")) {
            "textarea" -> {
                val e = EditText(this)
                e.minLines = 3
                wrap.addView(e)
                fields[id] = { e.text.toString() }
            }
            "number" -> {
                val e = EditText(this)
                e.inputType = android.text.InputType.TYPE_CLASS_NUMBER
                wrap.addView(e)
                fields[id] = { e.text.toString() }
            }
            "date" -> {
                val e = EditText(this)
                e.setText(LocalDate.now().toString())
                wrap.addView(e)
                fields[id] = { e.text.toString() }
            }
            "select" -> {
                val opts = q.optString("options").split("\n").map { it.trim() }.filter { it.isNotEmpty() }
                val sp = Spinner(this)
                sp.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, opts)
                wrap.addView(sp)
                fields[id] = { if (opts.isEmpty()) "" else opts[sp.selectedItemPosition] }
            }
            "yesno" -> {
                val g = RadioGroup(this)
                g.orientation = LinearLayout.HORIZONTAL
                val yes = RadioButton(this); yes.text = "Да"; yes.id = View.generateViewId()
                val no = RadioButton(this); no.text = "Нет"; no.id = View.generateViewId()
                g.addView(yes); g.addView(no)
                wrap.addView(g)
                fields[id] = {
                    when (g.checkedRadioButtonId) {
                        yes.id -> "Да"
                        no.id -> "Нет"
                        else -> ""
                    }
                }
            }
            else -> {
                val e = EditText(this)
                wrap.addView(e)
                fields[id] = { e.text.toString() }
            }
        }
        return wrap
    }

    private fun save(upload: Boolean) {
        val spinner = findViewById<Spinner>(R.id.institution)
        if (institutions.length() == 0) {
            Toast.makeText(this, "Нет учреждений", Toast.LENGTH_LONG).show()
            return
        }
        val inst = institutions.getJSONObject(spinner.selectedItemPosition)
        val answers = JSONArray()
        for (i in 0 until questions.length()) {
            val q = questions.getJSONObject(i)
            val qid = q.getInt("id")
            answers.put(JSONObject().put("question_id", qid).put("value", fields[qid]?.invoke() ?: ""))
        }
        val report = JSONObject()
            .put("client_uuid", newClientUuid())
            .put("institution_id", inst.getInt("id"))
            .put("report_date", findViewById<EditText>(R.id.reportDate).text.toString())
            .put("status", "submitted")
            .put("answers", answers)
        store.addPending(report)
        if (!upload || !store.isOnline(this)) {
            Toast.makeText(this, "Сохранено на устройстве. Выгрузка при появлении интернета.", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        thread {
            try {
                api.sync(JSONArray().put(report))
                val rest = JSONArray()
                val pending = store.pending()
                for (i in 0 until pending.length()) {
                    val item = pending.getJSONObject(i)
                    if (item.getString("client_uuid") != report.getString("client_uuid")) rest.put(item)
                }
                store.savePending(rest)
                runOnUiThread {
                    Toast.makeText(this, "Справка выгружена на сервер", Toast.LENGTH_LONG).show()
                    finish()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Сохранено локально: ${e.message}", Toast.LENGTH_LONG).show()
                    finish()
                }
            }
        }
    }
}
