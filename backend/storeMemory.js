const crypto = require('crypto');

// In-memory "database". Resets whenever the server restarts.
const reports = [];

async function addReport(data) {
  const report = {
    id: crypto.randomUUID(),
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
  reports.push(report);
  return report;
}

async function getReports(status) {
  let result = [...reports];
  if (status) {
    result = result.filter((r) => r.status === status);
  }
  // newest first
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function updateStatus(id, status) {
  const report = reports.find((r) => r.id === id);
  if (!report) return null;
  report.status = status;
  return report;
}

module.exports = { addReport, getReports, updateStatus };