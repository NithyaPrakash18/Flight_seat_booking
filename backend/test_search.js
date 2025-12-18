const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Route = require("./models/Route");
const Flight = require("./models/Flight");

dotenv.config();

const testSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Test exact search
        const routes = await Route.find({
            source: "New Delhi (DEL)",
            destination: "Mumbai (BOM)",
            isActive: true,
        }).populate('flight');

        console.log(`Found ${routes.length} routes`);
        if (routes.length > 0) {
            console.log("Sample route:", {
                source: routes[0].source,
                destination: routes[0].destination,
                flight: routes[0].flight?.name,
                price: routes[0].price
            });
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSearch();