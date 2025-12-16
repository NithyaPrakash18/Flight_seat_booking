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

// Popular Indian cities for routes
const cities = [
  "Chennai",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Coimbatore",
  "Madurai",
  "Kochi",
  "Thiruvananthapuram",
  "Vizag",
  "Vijayawada",
  "Mysore",
  "Mangalore",
  "Indore",
  "Nagpur",
  "Surat",
];

// Bus operators
const operators = [
  "VRL Travels",
  "SRS Travels",
  "Orange Travels",
  "RedBus Express",
  "KPN Travels",
  "Parveen Travels",
  "Jabbar Travels",
  "National Travels",
  "Kallada Travels",
  "SRM Travels",
  "Kaveri Travels",
  "Sharma Travels",
  "Royal Travels",
  "Eagle Travels",
  "Intercity Express",
];

const busTypes = ["AC", "Non-AC", "Sleeper", "Semi-Sleeper", "Volvo", "Luxury"];
const seatTypes = ["Seater", "Semi-Sleeper", "Sleeper"];

const amenitiesList = [
  "WiFi",
  "Charging Point",
  "Water Bottle",
  "Blanket",
  "TV",
  "Reading Light",
  "Emergency Exit",
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper function to generate random time
function randomTime() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.random() < 0.5 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

// Helper function to calculate arrival time
function calculateArrival(departureTime, durationHours) {
  const [depHour, depMin] = departureTime.split(":").map(Number);
  let arrHour = (depHour + durationHours) % 24;
  return `${arrHour.toString().padStart(2, "0")}:${depMin
    .toString()
    .padStart(2, "0")}`;
}

// Helper function to get seat layout based on seat type
function getSeatCount(seatType) {
  switch (seatType) {
    case "Seater":
      return 40;
    case "Semi-Sleeper":
      return 35;
    case "Sleeper":
      return 30;
    default:
      return 40;
  }
}

// Generate seat layout
function generateSeatLayout(busId, seatType, totalSeats) {
  const seats = [];
  let layout = "2x2"; // default

  if (seatType === "Seater") {
    // 40 seats: 2x2 configuration with 10 rows
    layout = "2x2";
    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 4; col++) {
        seats.push({
          seatNumber: `${row}${String.fromCharCode(64 + col)}`,
          row: row,
          column: col,
          deck: "lower",
          type: "seater",
          position: col === 1 || col === 4 ? "window" : "aisle",
        });
      }
    }
  } else if (seatType === "Semi-Sleeper") {
    // 35 seats: 20 lower (seater) + 15 upper (sleeper)
    layout = "2x2";

    // Lower deck: 2x2 configuration, 5 rows = 20 seats
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 4; col++) {
        seats.push({
          seatNumber: `L${row}${String.fromCharCode(64 + col)}`,
          row: row,
          column: col,
          deck: "lower",
          type: "seater",
          position: col === 1 || col === 4 ? "window" : "aisle",
        });
      }
    }

    // Upper deck: single column configuration, 15 berths
    for (let i = 1; i <= 15; i++) {
      seats.push({
        seatNumber: `U${i}`,
        row: i,
        column: 1,
        deck: "upper",
        type: "sleeper",
        position: "window",
      });
    }
  } else if (seatType === "Sleeper") {
    // 30 berths: 2x1 configuration, 15 rows
    layout = "2x1";
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
  }

  return {
    bus: busId,
    layout: layout,
    totalSeats: totalSeats,
    seats: seats,
  };
}

// Generate sample buses
async function generateBuses() {
  console.log("🚌 Generating 50 sample buses...");
  const buses = [];

  for (let i = 1; i <= 50; i++) {
    const seatType = seatTypes[Math.floor(Math.random() * seatTypes.length)];
    const totalSeats = getSeatCount(seatType);
    const selectedAmenities = amenitiesList
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 2);

    buses.push({
      name: `${operators[i % operators.length]} ${
        busTypes[Math.floor(Math.random() * busTypes.length)]
      }`,
      busNumber: `TN${(28 + (i % 10)).toString().padStart(2, "0")}AW${i
        .toString()
        .padStart(4, "0")}`,
      busType: busTypes[Math.floor(Math.random() * busTypes.length)],
      seatType: seatType,
      totalSeats: totalSeats,
      amenities: selectedAmenities,
      operator: operators[i % operators.length],
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      isActive: true,
    });
  }

  const createdBuses = await Bus.insertMany(buses);
  console.log(`✅ Created ${createdBuses.length} buses`);
  return createdBuses;
}

// Generate seat layouts for buses
async function generateSeatLayouts(buses) {
  console.log("💺 Generating seat layouts...");
  const layouts = [];

  for (const bus of buses) {
    const layout = generateSeatLayout(bus._id, bus.seatType, bus.totalSeats);
    layouts.push(layout);
  }

  const createdLayouts = await SeatLayout.insertMany(layouts);
  console.log(`✅ Created ${createdLayouts.length} seat layouts`);
  return createdLayouts;
}

// Generate sample routes
async function generateRoutes(buses) {
  console.log("🛣️  Generating 50 sample routes...");
  const routes = [];
  const usedPairs = new Set();

  let routeCount = 0;
  let attempts = 0;
  const maxAttempts = 200;

  while (routeCount < 50 && attempts < maxAttempts) {
    attempts++;

    const sourceIdx = Math.floor(Math.random() * cities.length);
    let destIdx = Math.floor(Math.random() * cities.length);

    // Ensure source and destination are different
    while (destIdx === sourceIdx) {
      destIdx = Math.floor(Math.random() * cities.length);
    }

    const source = cities[sourceIdx];
    const destination = cities[destIdx];
    const pairKey = `${source}-${destination}`;

    // Skip if this route pair already exists
    if (usedPairs.has(pairKey)) {
      continue;
    }

    usedPairs.add(pairKey);

    const bus = buses[routeCount % buses.length];
    const departureTime = randomTime();
    const durationHours = Math.floor(Math.random() * 10) + 4; // 4-13 hours
    const arrivalTime = calculateArrival(departureTime, durationHours);
    const distance = Math.floor(Math.random() * 800) + 100; // 100-900 km
    const basePrice = distance * (1.5 + Math.random() * 2); // ₹1.5-3.5 per km

    // Random operating days (at least 3 days)
    const numDays = Math.floor(Math.random() * 5) + 3;
    const operatingDays = days
      .sort(() => 0.5 - Math.random())
      .slice(0, numDays);

    // Boarding and dropping points
    const boardingPoints = [
      { location: `${source} Bus Stand`, time: departureTime },
      {
        location: `${source} Railway Station`,
        time: calculateArrival(departureTime, 0.5),
      },
    ];

    const droppingPoints = [
      {
        location: `${destination} Railway Station`,
        time: calculateArrival(arrivalTime, -0.5),
      },
      { location: `${destination} Bus Stand`, time: arrivalTime },
    ];

    routes.push({
      bus: bus._id,
      source: source,
      destination: destination,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: `${durationHours} hours`,
      distance: distance,
      price: Math.round(basePrice),
      days: operatingDays,
      boardingPoints: boardingPoints,
      droppingPoints: droppingPoints,
      offers: Math.random() > 0.7 ? "10% OFF on first booking" : undefined,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
      isActive: true,
    });

    routeCount++;
  }

  const createdRoutes = await Route.insertMany(routes);
  console.log(`✅ Created ${createdRoutes.length} routes`);
  return createdRoutes;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log("\n🌱 Starting database seeding...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await SeatLayout.deleteMany({});
    console.log("✅ Cleared existing data\n");

    // Generate new data
    const buses = await generateBuses();
    await generateSeatLayouts(buses);
    await generateRoutes(buses);

    console.log("\n✨ Database seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   • Buses: ${await Bus.countDocuments()}`);
    console.log(`   • Routes: ${await Route.countDocuments()}`);
    console.log(`   • Seat Layouts: ${await SeatLayout.countDocuments()}`);

    // Show some sample routes
    console.log("\n🔍 Sample routes created:");
    const sampleRoutes = await Route.find().limit(5).populate("bus");
    sampleRoutes.forEach((route, idx) => {
      console.log(
        `   ${idx + 1}. ${route.source} → ${route.destination} (${
          route.bus.name
        }) - ₹${route.price}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
