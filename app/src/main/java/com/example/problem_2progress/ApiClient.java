package com.example.problem_2progress;   // <-- replace with your real package

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    // MUST end with a slash. Pick ONE of these:
    //   Emulator:   "http://10.0.2.2:3000/"
    //   Real phone: "http://YOUR_PC_IP:3000/"  (see "Real phone setup" below)
    private static final String BASE_URL = "http://10.250.161.216:3000/";

    private static ApiService service;

    public static ApiService getService() {
        if (service == null) {
            service = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                    .create(ApiService.class);
        }
        return service;
    }
}