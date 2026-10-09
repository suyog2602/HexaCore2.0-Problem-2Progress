package com.example.problem_2progress;   // <-- replace with your real package

public class ReportRequest {
    private String title;
    private String description;
    private String category;
    private String address;
    private Double latitude;    // Double (not double) so it can be null
    private Double longitude;

    public ReportRequest(String title, String description, String category,
                         String address, Double latitude, Double longitude) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}