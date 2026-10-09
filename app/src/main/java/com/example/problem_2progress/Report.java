package com.example.problem_2progress;   // <-- replace with your real package

public class Report {
    private String id;
    private String title;
    private String description;
    private String category;
    private String address;
    private String status;      // "Pending", "In Progress" or "Resolved"
    private String createdAt;

    public Report(String id, String title, String description, String category,
                  String address, String status, String createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.address = address;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getAddress() { return address; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }
}