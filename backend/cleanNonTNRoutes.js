const mongoose = require("mongoose");
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
  "Namakkal",
  "Hosur",
];

async function cleanNonTNRoutes() {
  try {
    console.log("\n🧹 Cleaning Non-Tamil Nadu Routes...\n");

    // Get all routes
    const allRoutes = await Route.find({});
    console.log(`Total routes in database: ${allRoutes.length}`);

    // Find non-TN routes (routes where source OR destination is not in TN cities)
    const nonTNRoutes = allRoutes.filter((route) => {
      const sourceTN = tnCities.some(
        (city) => city.toLowerCase() === route.source.toLowerCase()
      );
      const destTN = tnCities.some(
        (city) => city.toLowerCase() === route.destination.toLowerCase()
      );
      return !sourceTN || !destTN;
    });

    console.log(`Non-TN routes to be deleted: ${nonTNRoutes.length}\n`);

    if (nonTNRoutes.length === 0) {
      console.log("✅ No non-TN routes found. Database already clean!");
      process.exit(0);
    }

    // Show what will be deleted
    console.log("🗑️  Routes to be deleted:");
    const deletionSummary = {};
    nonTNRoutes.forEach((route) => {
      const key = `${route.source} → ${route.destination}`;
      deletionSummary[key] = (deletionSummary[key] || 0) + 1;
    });

    Object.entries(deletionSummary).forEach(([route, count]) => {
      console.log(`   ${route}: ${count} route(s)`);
    });

    // Delete non-TN routes
    const result = await Route.deleteMany({
      _id: { $in: nonTNRoutes.map((r) => r._id) },
    });

    console.log(`\n✅ Deleted ${result.deletedCount} non-TN routes\n`);

    // Show remaining routes summary
    const remainingRoutes = await Route.find({});
    console.log(`📊 Remaining routes: ${remainingRoutes.length}`);

    const tnSummary = {};
    remainingRoutes.forEach((route) => {
      const key = `${route.source} → ${route.destination}`;
      tnSummary[key] = (tnSummary[key] || 0) + 1;
    });

    console.log("\n🚌 Tamil Nadu Routes Summary:");
    Object.entries(tnSummary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([route, count]) => {
        console.log(`   ${route}: ${count} route(s)`);
      });

    console.log("\n✨ Cleanup complete! Only Tamil Nadu routes remain.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run
cleanNonTNRoutes();
