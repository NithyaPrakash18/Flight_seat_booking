const Flight = require("../models/Flight");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const SeatLayout = require("../models/SeatLayout");
const { AppError } = require("../middleware/errorHandler");

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Public
exports.searchFlights = async (req, res, next) => {
    try {
        const { source, destination, date, class: flightClass } = req.query;

        if (!source || !destination || !date) {
            return next(
                new AppError("Please provide source, destination, and date", 400)
            );
        }

        console.log(`Searching: ${source} -> ${destination} on ${date}`);

        // Very flexible search - try multiple patterns
        let routes = await Route.find({
            $or: [
                {
                    source: { $regex: source, $options: 'i' },
                    destination: { $regex: destination, $options: 'i' }
                },
                {
                    source: { $regex: source.split(' ')[0], $options: 'i' },
                    destination: { $regex: destination.split(' ')[0], $options: 'i' }
                },
                {
                    source: { $regex: source.replace(/[()]/g, ''), $options: 'i' },
                    destination: { $regex: destination.replace(/[()]/g, ''), $options: 'i' }
                }
            ],
            isActive: true,
        }).populate('flight');

        console.log(`Found ${routes.length} routes`);

        // Filter by class if specified
        if (flightClass && flightClass !== 'undefined') {
            routes = routes.filter(route => route.flight && route.flight.class === flightClass);
        }

        // Get day of week
        const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
        
        // Filter by day availability
        routes = routes.filter(route => {
            if (!route.days || route.days.length === 0) return true;
            return route.days.includes(dayName);
        });

        // Format response
        const results = routes.map(route => ({
            _id: route._id,
            flight: {
                _id: route.flight._id,
                flightNumber: route.flight.flightNumber,
                airline: route.flight.airline,
                name: route.flight.name,
                class: route.flight.class,
                rating: route.flight.rating
            },
            source: route.source,
            destination: route.destination,
            departureTime: route.departureTime,
            arrivalTime: route.arrivalTime,
            duration: route.duration,
            price: route.price,
            availableSeats: route.flight.totalSeats - 10, // Assume some are booked
            totalSeats: route.flight.totalSeats,
        }));

        console.log(`Returning ${results.length} flights`);

        res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured flights for home page
// @route   GET /api/flights
// @access  Public
exports.getFeaturedFlights = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        const flights = await Flight.find({ isActive: true })
            .sort({ rating: -1, createdAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            count: flights.length,
            data: flights,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get flight details
// @route   GET /api/flights/:id
// @access  Public
exports.getFlightDetails = async (req, res, next) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return next(new AppError("Flight not found", 404));
        }

        // Get associated routes
        const routes = await Route.find({ flight: flight._id, isActive: true });

        res.status(200).json({
            success: true,
            data: {
                flight,
                routes,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get seat layout and availability
// @route   GET /api/flights/:flightId/seats
// @access  Public
exports.getSeatLayout = async (req, res, next) => {
    try {
        const { flightId } = req.params;
        const { routeId, date } = req.query;

        if (!routeId || !date) {
            return next(new AppError("Please provide routeId and date", 400));
        }

        // Get seat layout
        const seatLayout = await SeatLayout.findOne({ flight: flightId }).populate("flight");

        if (!seatLayout) {
            return next(new AppError("Seat layout not found for this flight", 404));
        }

        // Get booked seats for this route and date
        // Note: Booking model "bus" field was renamed to "flight", so we query "flight"
        const bookings = await Booking.find({
            flight: flightId,
            route: routeId,
            journeyDate: {
                $gte: new Date(date).setHours(0, 0, 0, 0),
                $lte: new Date(date).setHours(23, 59, 59, 999),
            },
            bookingStatus: "confirmed",
        });

        // Get all booked seat numbers
        const bookedSeatNumbers = [];
        bookings.forEach((booking) => {
            booking.seats.forEach((seat) => {
                bookedSeatNumbers.push(seat.seatNumber);
            });
        });

        // Mark seats as booked or available
        const seatsWithAvailability = seatLayout.seats.map((seat) => ({
            ...seat.toObject(),
            isBooked: bookedSeatNumbers.includes(seat.seatNumber),
        }));

        res.status(200).json({
            success: true,
            data: {
                layout: seatLayout.layout,
                totalSeats: seatLayout.totalSeats,
                seats: seatsWithAvailability,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all unique locations (sources and destinations)
// @route   GET /api/flights/locations
// @access  Public
exports.getLocations = async (req, res, next) => {
    try {
        const sources = await Route.distinct("source", { isActive: true });
        const destinations = await Route.distinct("destination", { isActive: true });

        // Combine and deduplicate
        const locations = [...new Set([...sources, ...destinations])].sort();

        res.status(200).json({
            success: true,
            count: locations.length,
            data: locations,
        });
    } catch (error) {
        next(error);
    }
};
