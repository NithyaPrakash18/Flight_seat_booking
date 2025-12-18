const express = require("express");
const router = express.Router();
const {
  addFlight,
  updateFlight,
  deleteFlight,
  getAllFlights,
  addRoute,
  updateRoute,
  deleteRoute,
  getAllRoutes,
  createSeatLayout,
  updateSeatLayout,
  getAllBookings,
  getStats,
  getAllUsers,
  updateUserStatus,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Flight routes
router.route("/flights").get(getAllFlights).post(addFlight);

router.route("/flights/:id").put(updateFlight).delete(deleteFlight);

// Route routes
router.route("/routes").get(getAllRoutes).post(addRoute);

router.route("/routes/:id").put(updateRoute).delete(deleteRoute);

// Seat layout routes
router.post("/seat-layouts", createSeatLayout);
router.put("/seat-layouts/:flightId", updateSeatLayout);

// Booking routes
router.get("/bookings", getAllBookings);

// Statistics
router.get("/stats", getStats);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserStatus);

module.exports = router;
