package ru.spravka.app.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import org.json.JSONObject
import ru.spravka.app.R
import ru.spravka.app.data.Api
import ru.spravka.app.data.Store
import java.io.File
import kotlin.concurrent.thread

class ReportsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reports)
        val store = Store(this)
        val api = Api(store)
        val box = findViewById<LinearLayout>(R.id.list)
        val hint = findViewById<TextView>(R.id.hint)
        if (!store.isOnline(this)) {
            hint.text = "Нет сети. Подключитесь к интернету, чтобы скачать итоговый документ с сервера."
            return
        }
        hint.text = "Загрузка справок..."
        thread {
            try {
                val items = api.reports()
                runOnUiThread {
                    hint.text = "Нажмите справку, чтобы скачать PDF."
                    box.removeAllViews()
                    for (i in 0 until items.length()) {
                        val r = items.getJSONObject(i)
                        val row = TextView(this)
                        row.text = "${r.getString("report_date")}  ${r.optString("institution_name")}  ${r.optString("status")}"
                        row.textSize = 16f
                        row.setPadding(16, 24, 16, 24)
                        row.setOnClickListener { download(api, r) }
                        box.addView(row)
                    }
                    if (items.length() == 0) hint.text = "На сервере пока нет справок."
                }
            } catch (e: Exception) {
                runOnUiThread { hint.text = e.message }
            }
        }
    }

    private fun download(api: Api, report: JSONObject) {
        val id = report.getInt("id")
        val dest = File(getExternalFilesDir(null), "spravka_$id.pdf")
        Toast.makeText(this, "Скачивание...", Toast.LENGTH_SHORT).show()
        thread {
            try {
                api.download(id, "pdf", dest)
                runOnUiThread {
                    val uri: Uri = FileProvider.getUriForFile(this, "$packageName.files", dest)
                    val intent = Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/pdf").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    startActivity(Intent.createChooser(intent, "Открыть справку"))
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, e.message, Toast.LENGTH_LONG).show() }
            }
        }
    }
}
