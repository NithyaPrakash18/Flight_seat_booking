const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const Route = require("./models/Route");

dotenv.config();

const createMultiClassRoutes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Get unique source-destination pairs
        const routes = await Route.find().limit(100);
        const uniquePairs = new Map();
        
        routes.forEach(route => {
            const key = `${route.source}-${route.destination}`;
            if (!uniquePairs.has(key)) {
                uniquePairs.set(key, route);
            }
        });

        console.log(`Found ${uniquePairs.size} unique route pairs`);

        const airlines = ["IndiGo", "Vistara", "Air India", "SpiceJet", "Akasa Air"];
        const classes = ["Economy", "Premium Economy", "Business", "First Class"];
        
        let created = 0;

        for (const [key, baseRoute] of uniquePairs) {
            for (const flightClass of classes) {
                const airline = airlines[Math.floor(Math.random() * airlines.length)];
                
                // Create flight for this class
                const flight = new Flight({
                    name: `${airline} ${flightClass}`,
                    flightNumber: `${airline.substring(0,2).toUpperCase()}${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`,
                    airline: airline,
                    aircraftType: "Boeing 737",
                    class: flightClass,
                    totalSeats: flightClass === "First Class" ? 20 : flightClass === "Business" ? 40 : 180,
                    amenities: ["WiFi", "In-flight Meal", "Extra Legroom"],
                    rating: 4.0 + Math.random(),
                    reviewCount: Math.floor(Math.random() * 200) + 50,
                    isActive: true
                });

                await flight.save();

                // Create route for this class
                const newRoute = new Route({
                    flight: flight._id,
                    source: baseRoute.source,
                    destination: baseRoute.destination,
                    departureTime: baseRoute.departureTime,
                    arrivalTime: baseRoute.arrivalTime,
                    duration: baseRoute.duration,
                    distance: baseRoute.distance,
                    price: flightClass === "First Class" ? baseRoute.price * 8 : 
                           flightClass === "Business" ? baseRoute.price * 4 : 
                           flightClass === "Premium Economy" ? baseRoute.price * 2 : 
                           baseRoute.price,
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    isActive: true,
                    boardingPoints: baseRoute.boardingPoints || [],
                    droppingPoints: baseRoute.droppingPoints || []
                });

                await newRoute.save();
                created++;
            }
        }

        console.log(`Created ${created} routes with all classes!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createMultiClassRoutes();