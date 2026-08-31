package ru.spravka.app.data

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class Store(ctx: Context) {
    private val prefs = ctx.getSharedPreferences("spravka", Context.MODE_PRIVATE)
    private val files = ctx.filesDir

    var server: String
        get() = prefs.getString("server", "http://10.0.2.2:8000")!!.trimEnd('/')
        set(v) { prefs.edit().putString("server", v.trimEnd('/')).apply() }

    var token: String
        get() = prefs.getString("token", "")!!
        set(v) { prefs.edit().putString("token", v).apply() }

    var username: String
        get() = prefs.getString("username", "")!!
        set(v) { prefs.edit().putString("username", v).apply() }

    fun isOnline(ctx: Context): Boolean {
        val cm = ctx.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val net = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(net) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun cacheBootstrap(json: String) {
        File(files, "bootstrap.json").writeText(json)
    }

    fun bootstrap(): JSONObject? {
        val f = File(files, "bootstrap.json")
        if (!f.exists()) return null
        return JSONObject(f.readText())
    }

    fun pendingFile() = File(files, "pending.json")

    fun pending(): JSONArray {
        val f = pendingFile()
        if (!f.exists()) return JSONArray()
        return JSONArray(f.readText())
    }

    fun savePending(arr: JSONArray) {
        pendingFile().writeText(arr.toString())
    }

    fun addPending(report: JSONObject) {
        val arr = pending()
        arr.put(report)
        savePending(arr)
    }
}

class Api(private val store: Store) {
    fun request(method: String, path: String, body: JSONObject? = null, auth: Boolean = true): JSONObject {
        val conn = (URL("${store.server}$path").openConnection() as HttpURLConnection)
        conn.requestMethod = method
        conn.connectTimeout = 15000
        conn.readTimeout = 30000
        conn.setRequestProperty("Content-Type", "application/json")
        if (auth && store.token.isNotBlank()) {
            conn.setRequestProperty("Authorization", "Bearer ${store.token}")
        }
        if (body != null) {
            conn.doOutput = true
            conn.outputStream.use { it.write(body.toString().toByteArray()) }
        }
        val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
        val text = stream?.bufferedReader()?.readText() ?: "{}"
        if (conn.responseCode !in 200..299) {
            val detail = try { JSONObject(text).optString("detail", text) } catch (_: Exception) { text }
            throw RuntimeException(detail)
        }
        return if (text.startsWith("[")) JSONObject().put("items", JSONArray(text)) else JSONObject(text)
    }

    fun login(user: String, pass: String): JSONObject {
        val res = request("POST", "/api/auth/login", JSONObject().put("username", user).put("password", pass), false)
        store.token = res.getString("access_token")
        store.username = user
        return res
    }

    fun bootstrap(): JSONObject {
        val res = request("GET", "/api/bootstrap")
        store.cacheBootstrap(res.toString())
        return res
    }

    fun sync(reports: JSONArray): JSONObject {
        return request("POST", "/api/sync", JSONObject().put("reports", reports))
    }

    fun reports(): JSONArray {
        val res = request("GET", "/api/reports")
        return res.getJSONArray("items")
    }

    fun download(reportId: Int, kind: String, dest: File) {
        val conn = (URL("${store.server}/api/reports/$reportId/document.$kind").openConnection() as HttpURLConnection)
        conn.requestMethod = "GET"
        conn.setRequestProperty("Authorization", "Bearer ${store.token}")
        if (conn.responseCode !in 200..299) throw RuntimeException("Не удалось скачать документ")
        BufferedInputStream(conn.inputStream).use { input ->
            FileOutputStream(dest).use { output -> input.copyTo(output) }
        }
    }
}

fun newClientUuid() = UUID.randomUUID().toString()
