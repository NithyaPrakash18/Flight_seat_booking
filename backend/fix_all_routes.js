const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const Route = require("./models/Route");

dotenv.config();

const fixAllRoutes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Get ALL routes
        const allRoutes = await Route.find();
        console.log(`Total routes: ${allRoutes.length}`);

        // Get unique source-destination pairs
        const pairs = new Set();
        allRoutes.forEach(route => {
            pairs.add(`${route.source}|${route.destination}`);
        });

        console.log(`Unique city pairs: ${pairs.size}`);

        const airlines = ["IndiGo", "Vistara", "Air India", "SpiceJet", "Akasa Air"];
        const classes = ["Economy", "Premium Economy", "Business", "First Class"];
        
        let created = 0;

        // For each unique pair, create 4 routes (one for each class)
        for (const pair of pairs) {
            const [source, destination] = pair.split('|');
            
            // Get a sample route for this pair to copy timing/distance
            const sampleRoute = allRoutes.find(r => r.source === source && r.destination === destination);
            
            for (const flightClass of classes) {
                const airline = airlines[Math.floor(Math.random() * airlines.length)];
                
                // Create unique flight
                const flight = new Flight({
                    name: `${airline} ${flightClass}`,
                    flightNumber: `${airline.substring(0,2).toUpperCase()}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
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

                // Create route
                const basePrice = sampleRoute.price || 5000;
                const newRoute = new Route({
                    flight: flight._id,
                    source: source,
                    destination: destination,
                    departureTime: sampleRoute.departureTime || "10:00",
                    arrivalTime: sampleRoute.arrivalTime || "12:00",
                    duration: sampleRoute.duration || "2h 0m",
                    distance: sampleRoute.distance || 500,
                    price: flightClass === "First Class" ? basePrice * 8 : 
                           flightClass === "Business" ? basePrice * 4 : 
                           flightClass === "Premium Economy" ? basePrice * 2 : 
                           basePrice,
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    isActive: true,
                    boardingPoints: [],
                    droppingPoints: []
                });

                await newRoute.save();
                created++;
                
                if (created % 50 === 0) {
                    console.log(`Created ${created} routes...`);
                }
            }
        }

        console.log(`Created ${created} routes total!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAllRoutes();