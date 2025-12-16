const mongoose = require("mongoose");
const Bus = require("./models/Bus");
const Route = require("./models/Route");
const SeatLayout = require("./models/SeatLayout");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Sleeper seat layout generator
function generateSleeperSeatLayout(busId) {
  const seats = [];
  // 30 berths: 2x1 configuration, 15 rows
  for (let row = 1; row <= 15; row++) {
    // Lower berth
    seats.push({
      seatNumber: `${row}L`,
      row: row,
      column: 1,
      deck: "lower",
      type: "sleeper",
      position: "window",
    });
    // Upper berth
    seats.push({
      seatNumber: `${row}U`,
      row: row,
      column: 2,
      deck: "upper",
      type: "sleeper",
      position: "window",
    });
  }

  return {
    bus: busId,
    layout: "2x1",
    totalSeats: 30,
    seats: seats,
  };
}

async function createNamakkalHosurRoute() {
  try {
    console.log("\n🚌 Creating Namakkal → Hosur Sleeper Route...\n");

    // Clear existing Namakkal-Hosur routes
    const existingRoutes = await Route.find({
      source: /Namakkal/i,
      destination: /Hosur/i,
    });

    if (existingRoutes.length > 0) {
      console.log(
        `Found ${existingRoutes.length} existing Namakkal-Hosur routes, removing them...`
      );
      await Route.deleteMany({
        source: /Namakkal/i,
        destination: /Hosur/i,
      });
    }

    // Create 2 new sleeper buses
    const sleeperBuses = [];

    const bus1 = await Bus.create({
      name: "VRL Travels Sleeper Express",
      busNumber: "TN37SL0001",
      busType: "Sleeper",
      seatType: "Sleeper",
      totalSeats: 30,
      amenities: [
        "WiFi",
        "Charging Point",
        "Water Bottle",
        "Blanket",
        "Reading Light",
      ],
      operator: "VRL Travels",
      rating: 4.5,
      reviewCount: 180,
      isActive: true,
    });
    sleeperBuses.push(bus1);

    const bus2 = await Bus.create({
      name: "SRS Travels Sleeper Deluxe",
      busNumber: "TN38SL0002",
      busType: "Sleeper",
      seatType: "Sleeper",
      totalSeats: 30,
      amenities: ["WiFi", "Charging Point", "Blanket", "TV", "Emergency Exit"],
      operator: "SRS Travels",
      rating: 4.3,
      reviewCount: 156,
      isActive: true,
    });
    sleeperBuses.push(bus2);

    console.log(`✅ Created 2 sleeper buses`);

    // Create seat layouts for both buses
    const layouts = [];
    for (const bus of sleeperBuses) {
      const layout = generateSleeperSeatLayout(bus._id);
      layouts.push(layout);
    }

    await SeatLayout.insertMany(layouts);
    console.log(`✅ Created seat layouts for both buses`);

    // Create routes for both buses
    const routes = [];

    // Route 1: Night service (22:00 - 05:00)
    routes.push({
      bus: sleeperBuses[0]._id,
      source: "Namakkal",
      destination: "Hosur",
      departureTime: "22:00",
      arrivalTime: "05:00",
      duration: "7 hours",
      distance: 500,
      price: 1000,
      days: days, // All days
      boardingPoints: [
        { location: "Namakkal Bus Stand", time: "22:00" },
        { location: "Namakkal Railway Station", time: "22:15" },
      ],
      droppingPoints: [
        { location: "Hosur Railway Station", time: "04:45" },
        { location: "Hosur Bus Stand", time: "05:00" },
      ],
      offers: "Book 2 seats, Get 10% OFF",
      discount: 10,
      isActive: true,
    });

    // Route 2: Evening service (18:00 - 01:00)
    routes.push({
      bus: sleeperBuses[1]._id,
      source: "Namakkal",
      destination: "Hosur",
      departureTime: "18:00",
      arrivalTime: "01:00",
      duration: "7 hours",
      distance: 500,
      price: 950,
      days: days, // All days
      boardingPoints: [
        { location: "Namakkal Bus Stand", time: "18:00" },
        { location: "Namakkal Railway Station", time: "18:15" },
      ],
      droppingPoints: [
        { location: "Hosur Railway Station", time: "00:45" },
        { location: "Hosur Bus Stand", time: "01:00" },
      ],
      offers: "Early bird discount",
      discount: 5,
      isActive: true,
    });

    const createdRoutes = await Route.insertMany(routes);
    console.log(`✅ Created ${createdRoutes.length} routes\n`);

    // Display summary
    console.log("📊 Namakkal → Hosur Route Summary:\n");
    for (let i = 0; i < createdRoutes.length; i++) {
      const route = createdRoutes[i];
      const bus = sleeperBuses[i];
      console.log(`Route ${i + 1}:`);
      console.log(`   Bus: ${bus.name} (${bus.busNumber})`);
      console.log(
        `   Type: ${bus.busType} - ${bus.seatType} (${bus.totalSeats} seats)`
      );
      console.log(
        `   Departure: ${route.departureTime} → Arrival: ${route.arrivalTime}`
      );
      console.log(`   Price: ₹${route.price}`);
      console.log(`   Operating Days: All week (7 days)`);
      console.log(`   Offers: ${route.offers || "None"}`);
      console.log("");
    }

    console.log("✨ Namakkal → Hosur sleeper route setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating route:", error);
    process.exit(1);
  }
}

// Run
createNamakkalHosurRoute();
