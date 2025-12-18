const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Route = require("./models/Route");
const Flight = require("./models/Flight");

dotenv.config();

const addMultipleFlights = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Get all routes
        const routes = await Route.find();
        console.log(`Found ${routes.length} routes`);

        for (const route of routes) {
            // Check existing flights for this route
            const existingFlights = await Flight.find({ route: route._id });
            console.log(`Route ${route.source} -> ${route.destination}: ${existingFlights.length} flights`);

            // Add flights if less than 2
            const flightsToAdd = Math.max(0, 3 - existingFlights.length);
            
            for (let i = 0; i < flightsToAdd; i++) {
                const flightNumber = `FL${Math.random().toString().substr(2, 4)}`;
                const airlines = ['SpiceJet', 'IndiGo', 'Air India', 'Vistara', 'GoAir'];
                const airline = airlines[Math.floor(Math.random() * airlines.length)];
                
                // Generate different departure times
                const baseHour = 6 + (i * 4); // 6AM, 10AM, 2PM
                const departureTime = `${baseHour.toString().padStart(2, '0')}:00`;
                const arrivalHour = baseHour + Math.floor(route.duration / 60);
                const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:00`;

                const newFlight = new Flight({
                    flightNumber,
                    airline,
                    route: route._id,
                    departureTime,
                    arrivalTime,
                    price: route.price + (i * 200), // Vary prices
                    availableSeats: 45,
                    totalSeats: 45,
                    status: 'active'
                });

                await newFlight.save();
                console.log(`Added flight ${flightNumber} for ${route.source} -> ${route.destination}`);
            }
        }

        console.log("✅ Multiple flights added successfully!");
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

addMultipleFlights();