const mongoose = require("mongoose");
const Route = require("./models/Route");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const routes = await Route.find({
    source: /Namakkal/i,
    destination: /Hosur/i,
  }).populate("bus");

  console.log(`\nFound ${routes.length} Namakkal-Hosur routes:\n`);

  routes.forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.bus.name} - ${r.bus.seatType} (${r.bus.totalSeats} seats)`
    );
    console.log(`   ${r.departureTime} → ${r.arrivalTime}, Price: ₹${r.price}`);
    console.log(
      `   Operating: ${r.days.length} days/week: ${r.days.join(", ")}`
    );
    console.log("");
  });

  process.exit(0);
});
