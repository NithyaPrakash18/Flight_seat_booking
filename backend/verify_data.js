const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Route = require("./models/Route");
const Flight = require("./models/Flight");

dotenv.config();

const verifyRoutes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const count = await Route.countDocuments();
        console.log(`Total Routes: ${count}`);

        const sample = await Route.findOne().populate('flight');
        console.log("Sample Route:", JSON.stringify(sample, null, 2));

        const sources = await Route.distinct("source");
        console.log("Distinct Sources:", sources);

        const destinations = await Route.distinct("destination");
        console.log("Distinct Destinations:", destinations);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyRoutes();
