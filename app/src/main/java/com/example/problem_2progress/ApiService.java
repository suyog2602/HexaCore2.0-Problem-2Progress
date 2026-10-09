package com.example.problem_2progress;   // <-- replace with your real package

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface ApiService {

    @POST("reports")
    Call<Report> createReport(@Body ReportRequest request);

    @GET("reports")
    Call<List<Report>> getReports();
}