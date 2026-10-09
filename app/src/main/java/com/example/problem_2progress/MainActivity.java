package com.example.problem_2progress;   // <-- replace with your real package

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        MaterialButton btnReport = findViewById(R.id.btnReport);
        MaterialButton btnMyReports = findViewById(R.id.btnMyReports);

        btnReport.setOnClickListener(v ->
                startActivity(new Intent(this, ReportActivity.class)));

        btnMyReports.setOnClickListener(v ->
                Toast.makeText(this, "Report list coming soon", Toast.LENGTH_SHORT).show());
    }
}