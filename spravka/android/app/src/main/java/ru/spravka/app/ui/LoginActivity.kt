package ru.spravka.app.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import ru.spravka.app.R
import ru.spravka.app.data.Api
import ru.spravka.app.data.Store
import kotlin.concurrent.thread

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        val store = Store(this)
        val api = Api(store)
        val server = findViewById<EditText>(R.id.server)
        val user = findViewById<EditText>(R.id.username)
        val pass = findViewById<EditText>(R.id.password)
        val error = findViewById<TextView>(R.id.error)
        server.setText(store.server)
        user.setText(if (store.username.isBlank()) "operator" else store.username)
        pass.setText("operator123")

        findViewById<Button>(R.id.login).setOnClickListener {
            error.text = ""
            store.server = server.text.toString()
            thread {
                try {
                    api.login(user.text.toString(), pass.text.toString())
                    api.bootstrap()
                    runOnUiThread {
                        startActivity(Intent(this, HomeActivity::class.java))
                        finish()
                    }
                } catch (e: Exception) {
                    runOnUiThread { error.text = e.message ?: "Ошибка входа" }
                }
            }
        }
    }
}
