package ru.spravka.app.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import ru.spravka.app.R
import ru.spravka.app.data.Api
import ru.spravka.app.data.Store
import kotlin.concurrent.thread

class HomeActivity : AppCompatActivity() {
    private lateinit var store: Store
    private lateinit var api: Api
    private lateinit var status: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)
        store = Store(this)
        api = Api(store)
        status = findViewById(R.id.status)
        refreshStatus()

        findViewById<Button>(R.id.newReport).setOnClickListener {
            startActivity(Intent(this, FormActivity::class.java))
        }
        findViewById<Button>(R.id.sync).setOnClickListener { syncNow() }
        findViewById<Button>(R.id.reports).setOnClickListener {
            startActivity(Intent(this, ReportsActivity::class.java))
        }
        findViewById<Button>(R.id.logout).setOnClickListener {
            store.token = ""
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        refreshStatus()
    }

    private fun refreshStatus() {
        val pending = store.pending().length()
        val online = if (store.isOnline(this)) "есть интернет" else "нет сети, работа офлайн"
        val cached = store.bootstrap() != null
        status.text = "Ожидают выгрузки: $pending\nСеть: $online\nАнкета ${if (cached) "загружена" else "ещё не получена"}"
    }

    private fun syncNow() {
        if (!store.isOnline(this)) {
            status.text = "Нет интернета — справки останутся на устройстве до появления связи."
            return
        }
        val pending = store.pending()
        if (pending.length() == 0) {
            status.text = "Нет локальных справок для выгрузки."
            thread {
                try { api.bootstrap(); runOnUiThread { refreshStatus() } } catch (_: Exception) {}
            }
            return
        }
        status.text = "Выгрузка на сервер..."
        thread {
            try {
                val reports = JSONArray()
                for (i in 0 until pending.length()) {
                    val item = pending.getJSONObject(i)
                    if (!item.optBoolean("synced", false)) reports.put(item)
                }
                val res = api.sync(reports)
                val saved = res.getJSONArray("saved")
                val uuids = mutableSetOf<String>()
                for (i in 0 until saved.length()) {
                    uuids.add(saved.getJSONObject(i).optString("client_uuid"))
                }
                val rest = JSONArray()
                for (i in 0 until pending.length()) {
                    val item = pending.getJSONObject(i)
                    if (item.optString("client_uuid") !in uuids) rest.put(item)
                }
                store.savePending(rest)
                api.bootstrap()
                runOnUiThread { status.text = "Выгружено справок: ${res.optInt("count")}. Можно скачать документ." }
            } catch (e: Exception) {
                runOnUiThread { status.text = e.message ?: "Ошибка выгрузки" }
            }
        }
    }
}
