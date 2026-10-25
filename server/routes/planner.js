const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');

// Reference center: Panadura Town Center
const PANADURA_CENTER = {
  lat: 6.6991191,
  lng: 79.9304626,
  name: "Panadura Town Center (Start Point)"
};

// Haversine formula to compute distance in km between two lat/lng pairs
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// POST /api/planner/suggest-order
// Accepts array of attraction IDs, returns calculated optimized order & timing breakdown
router.post('/suggest-order', async (req, res) => {
  try {
    const { attractionIds } = req.body;

    if (!Array.isArray(attractionIds) || attractionIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one attraction for your day plan.' });
    }

    const allAttractions = await Attraction.find({});
    const selected = allAttractions.filter(item =>
      attractionIds.includes(item._id?.toString())
    );

    if (selected.length === 0) {
      return res.status(404).json({ error: 'Selected attractions could not be found.' });
    }

    // Nearest-neighbor algorithm starting from Panadura Town Center
    let unvisited = [...selected];
    let currentPoint = { lat: PANADURA_CENTER.lat, lng: PANADURA_CENTER.lng };
    let orderedPlan = [];
    let totalTravelKm = 0;
    let totalTravelMinutes = 0;
    let totalVisitMinutes = 0;

    let startTimeMinutes = 8 * 60 + 30; // Start at 08:30 AM

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = haversineKm(
          currentPoint.lat,
          currentPoint.lng,
          unvisited[i].latitude,
          unvisited[i].longitude
        );
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = i;
        }
      }

      const nextSpot = unvisited.splice(nearestIdx, 1)[0];
      const legTravelKm = minDistance;
      // Estimated travel speed ~ 25 km/h in local traffic (approx 2.4 min per km + 5 min buffer)
      const legTravelMin = Math.round(legTravelKm * 2.4 + (legTravelKm > 0 ? 5 : 0));
      const visitMin = nextSpot.visitDurationMinutes || 60;

      totalTravelKm += legTravelKm;
      totalTravelMinutes += legTravelMin;
      totalVisitMinutes += visitMin;

      // Calculate arrival & departure times
      const arrivalMin = startTimeMinutes + totalTravelMinutes + (totalVisitMinutes - visitMin);
      const departureMin = arrivalMin + visitMin;

      const formatTime = (totalMins) => {
        const hrs = Math.floor(totalMins / 60) % 24;
        const mins = Math.floor(totalMins % 60);
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
        const displayMins = mins < 10 ? `0${mins}` : mins;
        return `${displayHrs}:${displayMins} ${ampm}`;
      };

      orderedPlan.push({
        stopNumber: orderedPlan.length + 1,
        attraction: nextSpot,
        travelFromPreviousKm: legTravelKm,
        travelFromPreviousMin: legTravelMin,
        estimatedArrival: formatTime(arrivalMin),
        estimatedDeparture: formatTime(departureMin),
        visitDurationMinutes: visitMin
      });

      currentPoint = { lat: nextSpot.latitude, lng: nextSpot.longitude };
    }

    const totalDurationMinutes = totalTravelMinutes + totalVisitMinutes;

    res.json({
      success: true,
      summary: {
        totalAttractions: orderedPlan.length,
        totalTravelKm: Math.round(totalTravelKm * 10) / 10,
        totalTravelMinutes,
        totalVisitMinutes,
        totalDurationMinutes,
        formattedTotalDuration: `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`
      },
      orderedPlan
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate visiting order' });
  }
});

module.exports = router;
