const express = require("express");
const router = express.Router();
const {
    searchFlights,
    getFlightDetails,
    getSeatLayout,
    getFeaturedFlights,
    getLocations,
} = require("../controllers/flightController");

// Routes
router.get("/", getFeaturedFlights);
router.get("/locations", getLocations);
router.get("/search", searchFlights);
router.get("/:id", getFlightDetails);
router.get("/:flightId/seats", getSeatLayout);

module.exports = router;
