const fs = require('fs');
const path = require('path');

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.warn('WARNING: serviceAccountKey.json not found. Using in-memory storage (data resets on restart).');
  module.exports = require('./storeMemory');
} else {
   const { initializeApp, cert } = require('firebase-admin/app');
   const { getFirestore } = require('firebase-admin/firestore');

   initializeApp({
     credential: cert(require(keyPath)),
   });

   const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  const reports = db.collection('reports');

  console.log('Storage: Cloud Firestore');

  async function addReport(data) {
    const ref = reports.doc(); // Firestore generates a unique id
    const report = {
      id: ref.id,
      title: data.title,
      description: data.description,
      category: data.category,
      address: data.address || '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      imageUrl: data.imageUrl || null,
      possibleDuplicateOf: data.possibleDuplicateOf || null,
      duplicateSimilarity: data.duplicateSimilarity ?? null,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    await ref.set(report);
    return report;
  }

  async function getReports(status) {
    const snapshot = await reports.get();
    let result = snapshot.docs.map((doc) => doc.data());
    if (status) {
      result = result.filter((r) => r.status === status);
    }
    // newest first
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function updateStatus(id, status) {
    const ref = reports.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update({ status });
    return { ...doc.data(), status };
  }

  module.exports = { addReport, getReports, updateStatus };
}