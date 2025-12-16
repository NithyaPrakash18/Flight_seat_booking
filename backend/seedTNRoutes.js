const mongoose = require("mongoose");
const Bus = require("./models/Bus");
const Route = require("./models/Route");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Tamil Nadu cities
const tnCities = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Salem",
  "Trichy",
  "Erode",
  "Tirunelveli",
  "Vellore",
  "Thoothukudi",
  "Dindigul",
  "Thanjavur",
  "Kanchipuram",
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

// Distance matrix (approximate km between TN cities)
const distances = {
  "Chennai-Coimbatore": 502,
  "Chennai-Madurai": 462,
  "Chennai-Salem": 342,
  "Chennai-Trichy": 322,
  "Chennai-Vellore": 138,
  "Coimbatore-Madurai": 214,
  "Coimbatore-Trichy": 174,
  "Coimbatore-Erode": 88,
  "Madurai-Trichy": 140,
  "Madurai-Tirunelveli": 152,
  "Madurai-Dindigul": 65,
  "Salem-Trichy": 174,
  "Salem-Erode": 65,
};

function getDistance(source, destination) {
  const key1 = `${source}-${destination}`;
  const key2 = `${destination}-${source}`;
  return (
    distances[key1] || distances[key2] || Math.floor(Math.random() * 300) + 100
  );
}

function randomTime() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.random() < 0.5 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

function calculateArrival(departureTime, durationHours) {
  const [depHour, depMin] = departureTime.split(":").map(Number);
  let arrHour = (depHour + durationHours) % 24;
  return `${arrHour.toString().padStart(2, "0")}:${depMin
    .toString()
    .padStart(2, "0")}`;
}

async function addTNRoutes() {
  try {
    console.log("\n🚌 Adding Tamil Nadu Routes...\n");

    // Get all active buses
    const buses = await Bus.find({ isActive: true });

    if (buses.length === 0) {
      console.log("❌ No buses found. Please run seedDatabase.js first!");
      process.exit(1);
    }

    console.log(`Found ${buses.length} buses in database`);

    const routes = [];
    let busIndex = 0;

    // Create routes between major TN city pairs
    const routePairs = [
      ["Chennai", "Coimbatore"],
      ["Chennai", "Madurai"],
      ["Chennai", "Salem"],
      ["Chennai", "Trichy"],
      ["Chennai", "Vellore"],
      ["Coimbatore", "Madurai"],
      ["Coimbatore", "Trichy"],
      ["Coimbatore", "Erode"],
      ["Madurai", "Trichy"],
      ["Madurai", "Tirunelveli"],
      ["Madurai", "Dindigul"],
      ["Salem", "Trichy"],
      ["Salem", "Erode"],
      ["Trichy", "Thanjavur"],
      ["Chennai", "Kanchipuram"],
      ["Madurai", "Thoothukudi"],
    ];

    for (const [source, destination] of routePairs) {
      // Add 2-3 routes per city pair (different timings)
      const numRoutes = Math.floor(Math.random() * 2) + 2;

      for (let i = 0; i < numRoutes; i++) {
        const bus = buses[busIndex % buses.length];
        busIndex++;

        const distance = getDistance(source, destination);
        const durationHours = Math.ceil(distance / 60); // ~60 km/hr average
        const departureTime = randomTime();
        const arrivalTime = calculateArrival(departureTime, durationHours);
        const basePrice = distance * (1.8 + Math.random() * 1.2); // ₹1.8-3.0 per km

        // Most routes operate all days
        const numDays =
          Math.random() > 0.3 ? 7 : Math.floor(Math.random() * 4) + 3;
        const operatingDays = days.slice(0, numDays);

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
          boardingPoints: [
            { location: `${source} Bus Stand`, time: departureTime },
            {
              location: `${source} Railway Station`,
              time: calculateArrival(departureTime, 0.25),
            },
          ],
          droppingPoints: [
            {
              location: `${destination} Railway Station`,
              time: calculateArrival(arrivalTime, -0.25),
            },
            { location: `${destination} Bus Stand`, time: arrivalTime },
          ],
          offers: Math.random() > 0.7 ? "10% OFF on TN routes" : undefined,
          discount:
            Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 5 : 0,
          isActive: true,
        });
      }
    }

    const createdRoutes = await Route.insertMany(routes);
    console.log(`✅ Created ${createdRoutes.length} Tamil Nadu routes\n`);

    // Show summary by city pair
    console.log("📊 Routes Summary:");
    const summary = {};
    for (const route of createdRoutes) {
      const key = `${route.source} → ${route.destination}`;
      summary[key] = (summary[key] || 0) + 1;
    }

    Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([route, count]) => {
        console.log(`   ${route}: ${count} routes`);
      });

    console.log("\n✨ Tamil Nadu routes added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error adding routes:", error);
    process.exit(1);
  }
}

// Run
addTNRoutes();
