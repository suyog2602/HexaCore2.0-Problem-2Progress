$api = "http://localhost:3000"

$reports = @(
  # --- Pothole cluster (reports 2 and 3 should be flagged as duplicates of 1) ---
  @{ title="Big pothole near the bus stop"; description="Deep pothole on the main road, two-wheelers are skidding every day."; category="Pothole / Damaged Road"; address="Main Road, near City Bus Stop"; latitude=18.5204; longitude=73.8567 },
  @{ title="Deep hole in the road by the bus stop"; description="Large hole in the tarmac close to the bus stop, very dangerous at night."; category="Pothole / Damaged Road"; address="Bus Stop Chowk"; latitude=18.5207; longitude=73.8569 },
  @{ title="Dangerous road crater near bus stop"; description="A big crater has formed on the road next to the bus stop and is getting worse."; category="Pothole / Damaged Road"; address="Main Road"; latitude=18.5202; longitude=73.8565 },

  # --- Garbage cluster (report 5 should be flagged as a duplicate of 4) ---
  @{ title="Garbage piled up behind the market"; description="Waste has not been collected for a week and the smell is unbearable."; category="Garbage"; address="Market Road, behind vegetable market"; latitude=18.5136; longitude=73.8553 },
  @{ title="Overflowing bins not cleared"; description="Dustbins near the market are overflowing and garbage is spilling onto the road."; category="Garbage"; address="Market Road"; latitude=18.5139; longitude=73.8557 },

  # --- Streetlights: two different areas, far apart (should NOT be flagged) ---
  @{ title="Streetlight not working in Lane 4"; description="The whole lane is dark after sunset, unsafe for women and children."; category="Broken Streetlight"; address="Lane 4, Sector 12"; latitude=18.5310; longitude=73.8446 },
  @{ title="Street lamps off on the whole road"; description="None of the street lamps have worked for ten days, the road is pitch dark."; category="Broken Streetlight"; address="University Road"; latitude=18.5590; longitude=73.7868 },

  # --- Other categories ---
  @{ title="Water pipe burst flooding the road"; description="A main pipeline has burst and clean water has been flowing onto the street since morning."; category="Water Leakage"; address="Station Road"; latitude=18.5018; longitude=73.8636 },
  @{ title="Sewage overflowing onto the street"; description="The drain is blocked and dirty water is flowing into the shops and houses."; category="Drainage / Sewage"; address="Nala Road, East Colony"; latitude=18.5362; longitude=73.8947 },
  @{ title="Broken footpath and collapsed railing"; description="Footpath tiles are broken and the safety railing has collapsed near the school gate."; category="Damaged Public Infrastructure"; address="School Gate Road"; latitude=18.5089; longitude=73.8077 },
  @{ title="Pothole after the flyover"; description="Pothole just after the flyover exit is causing traffic jams every evening."; category="Pothole / Damaged Road"; address="Flyover Exit, South Highway"; latitude=18.4575; longitude=73.8508 },
  @{ title="Stray dogs near the primary school"; description="A pack of stray dogs is scaring children on their way to school."; category="Other"; address="Primary School Lane"; latitude=18.5450; longitude=73.8300 }
)

$created = @()
foreach ($r in $reports) {
  $res = Invoke-RestMethod -Uri "$api/reports" -Method Post -ContentType "application/json" -Body ($r | ConvertTo-Json)
  $created += $res
  $flag = if ($res.possibleDuplicateOf) { "  <-- AI flagged duplicate ($($res.duplicateSimilarity))" } else { "" }
  Write-Host ("Created: " + $res.title + $flag)
}

# Set statuses AFTER everything is created (resolved reports are skipped by duplicate detection).
function Set-Status($index, $status) {
  Invoke-RestMethod -Uri "$api/reports/$($created[$index].id)/status" -Method Patch -ContentType "application/json" -Body (@{ status = $status } | ConvertTo-Json) | Out-Null
  Write-Host ("Status -> " + $status + ": " + $created[$index].title)
}

Set-Status 3 "In Progress"    # garbage behind the market
Set-Status 5 "Resolved"       # streetlight Lane 4
Set-Status 7 "In Progress"    # water pipe burst
Set-Status 10 "Resolved"      # pothole after flyover

Write-Host "`nDone. Refresh the dashboard."