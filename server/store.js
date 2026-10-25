const initialAttractions = require('./data/attractionsSeed');
const bcrypt = require('bcryptjs');

// In-Memory Fallback State (initialized with SRS 10 attractions and default admin)
let inMemoryAttractions = [...initialAttractions];

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword";

let inMemoryAdmins = [
  {
    id: "admin-1",
    username: adminUsername,
    passwordHash: bcrypt.hashSync(adminPassword, 10)
  }
];

let isMongoConnected = false;

function setMongoConnected(status) {
  isMongoConnected = status;
}

function getAttractions() {
  return inMemoryAttractions;
}

function getAttractionById(id) {
  return inMemoryAttractions.find(a => a.id === id || a._id?.toString() === id);
}

function addAttraction(data) {
  const newAttraction = {
    id: `attraction-${Date.now()}`,
    ...data,
    distanceKm: Number(data.distanceKm) || 5.0,
    latitude: Number(data.latitude) || 6.6991,
    longitude: Number(data.longitude) || 79.9304,
    visitDurationMinutes: Number(data.visitDurationMinutes) || 60,
    facilities: Array.isArray(data.facilities) ? data.facilities : (data.facilities ? data.facilities.split(',').map(s => s.trim()) : []),
    images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"])
  };
  inMemoryAttractions.unshift(newAttraction);
  return newAttraction;
}

function updateAttraction(id, data) {
  const index = inMemoryAttractions.findIndex(a => a.id === id || a._id?.toString() === id);
  if (index === -1) return null;

  const updated = {
    ...inMemoryAttractions[index],
    ...data,
    distanceKm: data.distanceKm !== undefined ? Number(data.distanceKm) : inMemoryAttractions[index].distanceKm,
    latitude: data.latitude !== undefined ? Number(data.latitude) : inMemoryAttractions[index].latitude,
    longitude: data.longitude !== undefined ? Number(data.longitude) : inMemoryAttractions[index].longitude,
    visitDurationMinutes: data.visitDurationMinutes !== undefined ? Number(data.visitDurationMinutes) : inMemoryAttractions[index].visitDurationMinutes,
    facilities: Array.isArray(data.facilities) ? data.facilities : (typeof data.facilities === 'string' ? data.facilities.split(',').map(s => s.trim()) : inMemoryAttractions[index].facilities),
    images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : inMemoryAttractions[index].images)
  };

  inMemoryAttractions[index] = updated;
  return updated;
}

function deleteAttraction(id) {
  const index = inMemoryAttractions.findIndex(a => a.id === id || a._id?.toString() === id);
  if (index === -1) return false;
  inMemoryAttractions.splice(index, 1);
  return true;
}

function findAdminByUsername(username) {
  return inMemoryAdmins.find(a => a.username.toLowerCase() === username.toLowerCase());
}

module.exports = {
  setMongoConnected,
  getAttractions,
  getAttractionById,
  addAttraction,
  updateAttraction,
  deleteAttraction,
  findAdminByUsername
};
