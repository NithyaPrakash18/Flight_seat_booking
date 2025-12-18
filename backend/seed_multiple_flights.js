const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Route = require("./models/Route");
const Flight = require("./models/Flight");

dotenv.config();

const seedMultipleFlights = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Get ALL existing routes from database
        const existingRoutes = await Route.find({ isActive: true });
        console.log(`Found ${existingRoutes.length} existing routes`);

        for (const route of existingRoutes) {
            const routeData = route;
            // Route already exists, just add flights

            // Check existing flights
            const existingFlights = await Flight.find({ route: route._id });
            console.log(`Route ${route.source} -> ${route.destination}: ${existingFlights.length} existing flights`);

            // Add 3 flights if none exist
            if (existingFlights.length === 0) {
                const airlines = ['SpiceJet', 'IndiGo', 'Air India'];
                const times = [
                    { dep: "06:00", arr: "08:00" },
                    { dep: "12:00", arr: "14:00" }, 
                    { dep: "18:00", arr: "20:00" }
                ];

                for (let i = 0; i < 3; i++) {
                    const flight = new Flight({
                        flightNumber: `FL${Math.random().toString().substr(2, 4)}`,
                        airline: airlines[i],
                        route: route._id,
                        departureTime: times[i].dep,
                        arrivalTime: times[i].arr,
                        price: route.price + (i * 300),
                        availableSeats: 45,
                        totalSeats: 45,
                        status: 'active'
                    });
                    
                    await flight.save();
                    console.log(`Added flight ${flight.flightNumber} (${flight.airline}) for ${route.source} -> ${route.destination}`);
                }
            }
        }

        console.log("✅ Multiple flights seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

seedMultipleFlights();