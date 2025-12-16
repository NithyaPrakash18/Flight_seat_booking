const express = require("express");
const router = express.Router();
const {
  searchBuses,
  getBusDetails,
  getSeatLayout,
  getFeaturedBuses,
} = require("../controllers/busController");

// Routes
router.get("/", getFeaturedBuses);
router.get("/search", searchBuses);
router.get("/:id", getBusDetails);
router.get("/:busId/seats", getSeatLayout);

module.exports = router;
