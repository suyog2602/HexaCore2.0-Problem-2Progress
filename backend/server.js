const express = require('express');
const cors = require('cors');
const store = require('./store');

const app = express();
const PORT = process.env.PORT || 3000;

// These must match the Android spinner and the Report status values exactly.
const CATEGORIES = [
  'Pothole / Damaged Road',
  'Garbage',
  'Broken Streetlight',
  'Water Leakage',
  'Drainage / Sewage',
  'Damaged Public Infrastructure',
  'Other',
];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

app.use(cors());
app.use(express.json());

// Returns a list of problems; an empty list means the data is valid.
function validateReport(body) {
  const errors = [];

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('title is required');
  }
  if (!body.description || typeof body.description !== 'string' || !body.description.trim()) {
    errors.push('description is required');
  }
  if (!CATEGORIES.includes(body.category)) {
    errors.push('category must be one of: ' + CATEGORIES.join(', '));
  }

  const hasCoords = body.latitude !== undefined && body.latitude !== null
    && body.longitude !== undefined && body.longitude !== null;
  const hasAddress = typeof body.address === 'string' && body.address.trim() !== '';

  if (hasCoords) {
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.push('latitude must be between -90 and 90');
    if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.push('longitude must be between -180 and 180');
  }
  if (!hasCoords && !hasAddress) {
    errors.push('provide either latitude/longitude or an address');
  }

  return errors;
}
// Root: friendly message so opening the base URL doesn't show a 404.
app.get('/', (req, res) => {
  res.json({ name: 'CivicPulse API', endpoints: ['/health', '/reports'] });
});

// Health check: quick way to confirm the server is up.
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---------- AI duplicate detection ----------
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DUPLICATE_THRESHOLD = Number(process.env.DUPLICATE_THRESHOLD) || 0.6;
const DUPLICATE_RADIUS_KM = 1;

// Haversine formula: distance in km between two GPS points.
function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Returns { id, similarity } of the closest likely duplicate, or null.
// Any failure returns null so a report can still be saved.
async function findDuplicate(newReport) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const existing = await store.getReports();
    const candidates = existing
      .filter((r) => r.status !== 'Resolved')
      .filter((r) => {
        if (newReport.latitude == null || r.latitude == null) return true;
        return distanceKm(newReport.latitude, newReport.longitude, r.latitude, r.longitude)
          <= DUPLICATE_RADIUS_KM;
      })
      .slice(0, 100)
      .map((r) => ({ id: r.id, text: `${r.title}. ${r.description}` }));

    if (candidates.length === 0) return null;

    const response = await fetch(`${AI_URL}/duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${newReport.title}. ${newReport.description}`,
        candidates,
        threshold: DUPLICATE_THRESHOLD,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = await response.json();
    return data.duplicates && data.duplicates.length > 0 ? data.duplicates[0] : null;
  } catch (err) {
    console.warn('AI duplicate check skipped:', err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Create a report.
app.post('/reports', async (req, res) => {
  const body = req.body || {};
  const errors = validateReport(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const data = {
    title: body.title.trim(),
    description: body.description.trim(),
    category: body.category,
    address: typeof body.address === 'string' ? body.address.trim() : '',
    latitude: body.latitude !== undefined && body.latitude !== null ? Number(body.latitude) : null,
    longitude: body.longitude !== undefined && body.longitude !== null ? Number(body.longitude) : null,
    imageUrl: body.imageUrl,
  };

  const duplicate = await findDuplicate(data);
  if (duplicate) {
    data.possibleDuplicateOf = duplicate.id;
    data.duplicateSimilarity = duplicate.similarity;
  }

  const report = await store.addReport(data);
  res.status(201).json(report);
});


// Fetch all reports (optional filter: /reports?status=Pending).
app.get('/reports', async (req, res) => {
  const { status } = req.query;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be one of: ' + STATUSES.join(', ') });
  }
  res.json(await store.getReports(status));
});

// Update a report's status (the admin dashboard will use this).
app.patch('/reports/:id/status', async (req, res) => {
  const status = (req.body || {}).status;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be one of: ' + STATUSES.join(', ') });
  }
  const updated = await store.updateStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(updated);
});

// Unknown route.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (bad JSON, unexpected crashes).
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// 0.0.0.0 lets your phone/emulator reach the server, not just localhost.
app.listen(PORT, '0.0.0.0', () => {
  console.log('CivicPulse API running on http://localhost:' + PORT);
});