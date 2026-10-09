package com.example.problem_2progress;   // <-- replace with your real package

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.gms.tasks.CancellationTokenSource;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

public class ReportActivity extends AppCompatActivity {

    private static final String TAG = "ReportActivity";

    private static final String[] CATEGORIES = {
            "Pothole / Damaged Road",
            "Garbage",
            "Broken Streetlight",
            "Water Leakage",
            "Drainage / Sewage",
            "Damaged Public Infrastructure",
            "Other"
    };

    private TextInputEditText etTitle, etDescription, etAddress;
    private Spinner spinnerCategory;
    private ImageView ivPhoto;
    private TextView tvLocationStatus;
    private MaterialButton btnPickPhoto, btnDetectLocation, btnSubmit;
    private ProgressBar progressBar;

    private FusedLocationProviderClient fusedClient;
    private Uri selectedImageUri = null;
    private Double latitude = null;
    private Double longitude = null;

    // Opens the system Photo Picker (no storage permission needed).
    private final ActivityResultLauncher<PickVisualMediaRequest> photoPicker =
            registerForActivityResult(new ActivityResultContracts.PickVisualMedia(), uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    ivPhoto.setImageURI(uri);
                }
            });

    // Asks the user for location permission, then reports the result.
    private final ActivityResultLauncher<String[]> locationPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                boolean fine = Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_FINE_LOCATION));
                boolean coarse = Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_COARSE_LOCATION));
                if (fine || coarse) {
                    fetchLocation();
                } else {
                    tvLocationStatus.setText("Location permission denied. Please type a landmark or address below.");
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report);

        etTitle = findViewById(R.id.etTitle);
        etDescription = findViewById(R.id.etDescription);
        etAddress = findViewById(R.id.etAddress);
        spinnerCategory = findViewById(R.id.spinnerCategory);
        ivPhoto = findViewById(R.id.ivPhoto);
        tvLocationStatus = findViewById(R.id.tvLocationStatus);
        btnPickPhoto = findViewById(R.id.btnPickPhoto);
        btnDetectLocation = findViewById(R.id.btnDetectLocation);
        btnSubmit = findViewById(R.id.btnSubmit);
        progressBar = findViewById(R.id.progressBar);

        fusedClient = LocationServices.getFusedLocationProviderClient(this);

        spinnerCategory.setAdapter(new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_dropdown_item, CATEGORIES));

        btnPickPhoto.setOnClickListener(v -> photoPicker.launch(
                new PickVisualMediaRequest.Builder()
                        .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
                        .build()));

        btnDetectLocation.setOnClickListener(v -> requestLocation());
        btnSubmit.setOnClickListener(v -> submitReport());
    }

    private void requestLocation() {
        boolean hasPermission = ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                || ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

        if (hasPermission) {
            fetchLocation();
        } else {
            locationPermissionLauncher.launch(new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION});
        }
    }

    @SuppressLint("MissingPermission") // we check the permission in requestLocation()
    private void fetchLocation() {
        tvLocationStatus.setText("Detecting location...");
        btnDetectLocation.setEnabled(false);

        fusedClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY,
                        new CancellationTokenSource().getToken())
                .addOnSuccessListener(location -> {
                    btnDetectLocation.setEnabled(true);
                    if (location != null) {
                        latitude = location.getLatitude();
                        longitude = location.getLongitude();
                        tvLocationStatus.setText(String.format(
                                "Location detected: %.5f, %.5f", latitude, longitude));
                    } else {
                        tvLocationStatus.setText("Couldn't get a GPS fix. Turn on GPS or type a landmark below.");
                    }
                })
                .addOnFailureListener(e -> {
                    btnDetectLocation.setEnabled(true);
                    Log.e(TAG, "Location error", e);
                    tvLocationStatus.setText("Location failed. Please type a landmark or address below.");
                });
    }

    private void submitReport() {
        String title = text(etTitle);
        String description = text(etDescription);
        String address = text(etAddress);
        String category = (String) spinnerCategory.getSelectedItem();

        // Validation
        etTitle.setError(null);
        etDescription.setError(null);
        etAddress.setError(null);

        if (title.isEmpty()) {
            etTitle.setError("Please enter a title");
            return;
        }
        if (description.isEmpty()) {
            etDescription.setError("Please describe the problem");
            return;
        }
        if (latitude == null && address.isEmpty()) {
            etAddress.setError("Detect your location or type a landmark");
            return;
        }

        Log.d(TAG, "Would send -> title=" + title + ", category=" + category
                + ", lat=" + latitude + ", lng=" + longitude
                + ", address=" + address + ", image=" + selectedImageUri);

        // Loading state
        progressBar.setVisibility(View.VISIBLE);
        btnSubmit.setEnabled(false);

        // TEMPORARY: fake network delay. Replaced by Retrofit in Phase 3.
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            progressBar.setVisibility(View.GONE);
            btnSubmit.setEnabled(true);
            Toast.makeText(this, "Report submitted successfully!", Toast.LENGTH_LONG).show();
            finish();
        }, 1500);
    }

    private String text(TextInputEditText field) {
        return field.getText() == null ? "" : field.getText().toString().trim();
    }
}