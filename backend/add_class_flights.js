const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const Route = require("./models/Route");

dotenv.config();

const addClassFlights = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Get existing routes
        const routes = await Route.find().limit(50);
        console.log(`Found ${routes.length} routes`);

        const airlines = ["IndiGo", "Vistara", "Air India", "SpiceJet", "Akasa Air"];
        const classes = ["Premium Economy", "Business", "First Class"];

        for (const route of routes) {
            for (const flightClass of classes) {
                const airline = airlines[Math.floor(Math.random() * airlines.length)];
                
                const flight = new Flight({
                    name: `${airline} ${flightClass}`,
                    flightNumber: `${airline.substring(0,2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
                    airline: airline,
                    aircraftType: flightClass === "First Class" ? "Airbus A350" : "Boeing 737",
                    class: flightClass,
                    totalSeats: flightClass === "First Class" ? 20 : flightClass === "Business" ? 40 : 80,
                    amenities: flightClass === "First Class" ? ["WiFi", "In-flight Meal", "Lounge Access"] : 
                              flightClass === "Business" ? ["WiFi", "In-flight Meal", "Lounge Access"] :
                              ["Extra Legroom", "Priority Boarding", "In-flight Meal"],
                    rating: 4.0 + Math.random(),
                    reviewCount: Math.floor(Math.random() * 200) + 50,
                    isActive: true
                });

                await flight.save();

                // Update route with new flight
                route.flight = flight._id;
                route.price = flightClass === "First Class" ? route.price * 8 : 
                             flightClass === "Business" ? route.price * 4 : 
                             route.price * 2;
                await route.save();
            }
        }

        console.log("Added flights for all classes!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addClassFlights();