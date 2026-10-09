package com.example.problem_2progress;   // <-- replace with your real package

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MyReportsActivity extends AppCompatActivity {

    private RecyclerView recyclerReports;
    private TextView tvEmpty;
    private ReportAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_reports);

        recyclerReports = findViewById(R.id.recyclerReports);
        tvEmpty = findViewById(R.id.tvEmpty);

        recyclerReports.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ReportAdapter(new ArrayList<>());
        recyclerReports.setAdapter(adapter);

        // TEMPORARY: fake data. Phase 3 replaces this with a Retrofit call.
        showReports(getFakeReports());
    }

    private void showReports(List<Report> list) {
        adapter.setReports(list);
        tvEmpty.setVisibility(list.isEmpty() ? View.VISIBLE : View.GONE);
    }

    private List<Report> getFakeReports() {
        List<Report> list = new ArrayList<>();
        list.add(new Report("1", "Deep pothole on main road",
                "Large pothole near the bus stop causing traffic and bike accidents.",
                "Pothole / Damaged Road", "Near City Bus Stop, Pimpri", "Pending", "09 Oct 2026"));
        list.add(new Report("2", "Garbage not collected",
                "Garbage pile has been overflowing for 5 days behind the market.",
                "Garbage", "Market Road, Pimpri", "In Progress", "07 Oct 2026"));
        list.add(new Report("3", "Streetlight not working",
                "The whole lane is dark at night, unsafe for pedestrians.",
                "Broken Streetlight", "Lane 4, Sector 12", "Resolved", "03 Oct 2026"));
        list.add(new Report("4", "Water pipe leakage",
                "Pipe burst and water is flowing onto the road since morning.",
                "Water Leakage", "Station Road", "Pending", "02 Oct 2026"));
        return list;
    }
}