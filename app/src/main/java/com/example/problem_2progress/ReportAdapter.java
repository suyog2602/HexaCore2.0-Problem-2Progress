package com.example.problem_2progress;   // <-- replace with your real package

import android.graphics.drawable.GradientDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class ReportAdapter extends RecyclerView.Adapter<ReportAdapter.ReportViewHolder> {

    private List<Report> reports;

    public ReportAdapter(List<Report> reports) {
        this.reports = reports;
    }

    // We'll call this in Phase 3 when real data arrives from the server.
    public void setReports(List<Report> newReports) {
        this.reports = newReports;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ReportViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_report, parent, false);
        return new ReportViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ReportViewHolder holder, int position) {
        Report r = reports.get(position);

        holder.tvTitle.setText(r.getTitle());
        holder.tvCategory.setText(r.getCategory());
        holder.tvDescription.setText(r.getDescription());
        holder.tvAddress.setText("Location: " + r.getAddress());
        holder.tvDate.setText("Reported: " + r.getCreatedAt());
        holder.tvStatus.setText(r.getStatus());

        // Rounded badge whose color depends on the status.
        GradientDrawable badge = new GradientDrawable();
        badge.setCornerRadius(40f);
        badge.setColor(ContextCompat.getColor(holder.itemView.getContext(), statusColor(r.getStatus())));
        holder.tvStatus.setBackground(badge);
    }

    @Override
    public int getItemCount() {
        return reports == null ? 0 : reports.size();
    }

    private int statusColor(String status) {
        if ("Resolved".equals(status)) return R.color.cp_status_resolved;
        if ("In Progress".equals(status)) return R.color.cp_status_progress;
        return R.color.cp_status_pending;
    }

    static class ReportViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvStatus, tvCategory, tvDescription, tvAddress, tvDate;

        ReportViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvDescription = itemView.findViewById(R.id.tvDescription);
            tvAddress = itemView.findViewById(R.id.tvAddress);
            tvDate = itemView.findViewById(R.id.tvDate);
        }
    }
}