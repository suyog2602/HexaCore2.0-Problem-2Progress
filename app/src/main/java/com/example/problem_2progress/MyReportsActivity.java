package com.example.problem_2progress;   // <-- replace with your real package

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyReportsActivity extends AppCompatActivity {

    private static final String TAG = "MyReportsActivity";

    private RecyclerView recyclerReports;
    private TextView tvEmpty;
    private ProgressBar progressBar;
    private ReportAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_reports);

        recyclerReports = findViewById(R.id.recyclerReports);
        tvEmpty = findViewById(R.id.tvEmpty);
        progressBar = findViewById(R.id.progressBar);

        recyclerReports.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ReportAdapter(new ArrayList<>());
        recyclerReports.setAdapter(adapter);
    }

    // Reload every time the screen becomes visible, so a new report shows up.
    @Override
    protected void onResume() {
        super.onResume();
        loadReports();
    }

    private void loadReports() {
        progressBar.setVisibility(View.VISIBLE);
        tvEmpty.setVisibility(View.GONE);

        ApiClient.getService().getReports().enqueue(new Callback<List<Report>>() {
            @Override
            public void onResponse(Call<List<Report>> call, Response<List<Report>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    adapter.setReports(response.body());
                    if (response.body().isEmpty()) {
                        showMessage("You haven't reported anything yet.");
                    }
                } else {
                    showMessage("Server error (code " + response.code() + ")");
                }
            }

            @Override
            public void onFailure(Call<List<Report>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Log.e(TAG, "Load failed", t);
                adapter.setReports(new ArrayList<>());
                showMessage("Couldn't reach the server. Check it is running and the address in ApiClient.");
            }
        });
    }

    private void showMessage(String message) {
        tvEmpty.setText(message);
        tvEmpty.setVisibility(View.VISIBLE);
    }
}