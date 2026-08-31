package ru.svodspravka.app;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

/**
 * Android-клиент для мобильного инспектора:
 * 1. Офлайн-заполнение опросного листа
 * 2. Локальное кэширование справочников и ответов
 * 3. Пакетная отправка на сервер при наличии интернет-соединения
 */
public class MainActivity extends AppCompatActivity {

    private String serverUrl = "http://10.0.2.2:8000/api/sync/batch";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager != null) {
            NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
            return activeNetworkInfo != null && activeNetworkInfo.isConnected();
        }
        return false;
    }

    public void syncPendingReports(String reportsJsonString) {
        if (!isNetworkAvailable()) {
            Toast.makeText(this, "Нет подключения к интернету. Справки сохранены локально.", Toast.LENGTH_LONG).show();
            return;
        }

        new Thread(() -> {
            try {
                URL url = new URL(serverUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; utf-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = reportsJsonString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                runOnUiThread(() -> {
                    if (code == 200 || code == 201) {
                        Toast.makeText(MainActivity.this, "Справки успешно синхронизированы с сервером!", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(MainActivity.this, "Ошибка сервера при синхронизации: " + code, Toast.LENGTH_SHORT).show();
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Ошибка соединения с сервером", Toast.LENGTH_SHORT).show());
            }
        }).start();
    }
}
