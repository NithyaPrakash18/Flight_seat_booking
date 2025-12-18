const Flight = require("../models/Flight");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const User = require("../models/User");
const SeatLayout = require("../models/SeatLayout");
const { AppError } = require("../middleware/errorHandler");
const { getSeatLayoutTemplate } = require("../config/seatLayoutTemplates");

// ==================== FLIGHT MANAGEMENT ====================

// @desc    Add new flight
// @route   POST /api/admin/flights
// @access  Private/Admin
exports.addFlight = async (req, res, next) => {
  try {
    const { class: flightClass, ...flightData } = req.body;

    // Get seat layout template for the selected class
    let layoutTemplate;
    try {
      layoutTemplate = getSeatLayoutTemplate(flightClass);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }

    // Auto-set totalSeats from template
    flightData.totalSeats = layoutTemplate.totalSeats;
    flightData.class = flightClass;

    // Create the flight
    const flight = await Flight.create(flightData);

    // Auto-generate seat layout from template
    await SeatLayout.create({
      flight: flight._id,
      layout: layoutTemplate.layout,
      totalSeats: layoutTemplate.totalSeats,
      seats: layoutTemplate.seats,
    });

    res.status(201).json({
      success: true,
      message: `Flight added successfully with ${flightClass} seat layout (${layoutTemplate.totalSeats} seats)`,
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update flight
// @route   PUT /api/admin/flights/:id
// @access  Private/Admin
exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!flight) {
      return next(new AppError("Flight not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete flight
// @route   DELETE /api/admin/flights/:id
// @access  Private/Admin
exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return next(new AppError("Flight not found", 404));
    }

    // Check if flight has active bookings
    const activeBookings = await Booking.find({
      flight: req.params.id,
      journeyDate: { $gte: new Date() },
      bookingStatus: "confirmed",
    });

    if (activeBookings.length > 0) {
      return next(new AppError("Cannot delete flight with active bookings", 400));
    }

    await flight.deleteOne();

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flights
// @route   GET /api/admin/flights
// @access  Private/Admin
exports.getAllFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ROUTE MANAGEMENT ====================

// @desc    Add new route
// @route   POST /api/admin/routes
// @access  Private/Admin
exports.addRoute = async (req, res, next) => {
  try {
    // Verify flight exists
    // req.body should have 'flight' ID
    const flight = await Flight.findById(req.body.flight);
    if (!flight) {
      return next(new AppError("Flight not found", 404));
    }

    const route = await Route.create(req.body);
    await route.populate("flight");

    res.status(201).json({
      success: true,
      message: "Route added successfully",
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update route
// @route   PUT /api/admin/routes/:id
// @access  Private/Admin
exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("flight");

    if (!route) {
      return next(new AppError("Route not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete route
// @route   DELETE /api/admin/routes/:id
// @access  Private/Admin
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return next(new AppError("Route not found", 404));
    }

    // Check for active bookings
    const activeBookings = await Booking.find({
      route: req.params.id,
      journeyDate: { $gte: new Date() },
      bookingStatus: "confirmed",
    });

    if (activeBookings.length > 0) {
      return next(
        new AppError("Cannot delete route with active bookings", 400)
      );
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all routes
// @route   GET /api/admin/routes
// @access  Private/Admin
exports.getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find().populate("flight").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SEAT LAYOUT MANAGEMENT ====================

// @desc    Create seat layout for flight
// @route   POST /api/admin/seat-layouts
// @access  Private/Admin
exports.createSeatLayout = async (req, res, next) => {
  try {
    const { flightId, layout, seats } = req.body;

    // Verify flight exists
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return next(new AppError("Flight not found", 404));
    }

    // Check if layout already exists
    const existingLayout = await SeatLayout.findOne({ flight: flightId });
    if (existingLayout) {
      return next(new AppError("Seat layout already exists for this flight", 400));
    }

    const seatLayout = await SeatLayout.create({
      flight: flightId,
      layout,
      totalSeats: flight.totalSeats,
      seats,
    });

    res.status(201).json({
      success: true,
      message: "Seat layout created successfully",
      data: seatLayout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update seat layout
// @route   PUT /api/admin/seat-layouts/:flightId
// @access  Private/Admin
exports.updateSeatLayout = async (req, res, next) => {
  try {
    const seatLayout = await SeatLayout.findOneAndUpdate(
      { flight: req.params.flightId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!seatLayout) {
      return next(new AppError("Seat layout not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Seat layout updated successfully",
      data: seatLayout,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== BOOKING MANAGEMENT ====================

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, date, flightId } = req.query;

    // Build query
    let query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (date) {
      query.journeyDate = {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      };
    }

    if (flightId) {
      query.flight = flightId;
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("flight")
      .populate("route")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({
      bookingStatus: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      bookingStatus: "cancelled",
    });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalFlights = await Flight.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });

    res.status(200).json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
        },
        revenue: totalRevenue[0]?.total || 0,
        flights: totalFlights,
        routes: totalRoutes,
        users: totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
