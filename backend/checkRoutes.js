const mongoose = require("mongoose");
const Route = require("./models/Route");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB\n");

    // Check Chennai to Bangalore routes
    const routes = await Route.find({
      source: new RegExp("Chennai", "i"),
      destination: new RegExp("Bangalore", "i"),
      isActive: true,
    }).populate("bus");

    console.log(`Found ${routes.length} routes from Chennai to Bangalore:\n`);

    routes.forEach((route, idx) => {
      console.log(`${idx + 1}. ${route.bus.name} - ${route.bus.busNumber}`);
      console.log(
        `   Departure: ${route.departureTime}, Arrival: ${route.arrivalTime}`
      );
      console.log(`   Price: ₹${route.price}, Distance: ${route.distance}km`);
      console.log(`   Days: ${route.days.join(", ")}`);
      console.log("");
    });

    // Check what day of week is Dec 16, 2025
    const journeyDate = new Date("2025-12-16");
    const dayName = journeyDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    console.log(`December 16, 2025 is a ${dayName}\n`);

    // Check routes that operate on that day
    const routesForDay = routes.filter((r) => r.days.includes(dayName));
    console.log(`Routes operating on ${dayName}: ${routesForDay.length}`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
