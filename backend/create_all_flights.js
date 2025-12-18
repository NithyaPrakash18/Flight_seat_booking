const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const Route = require("./models/Route");

dotenv.config();

const createAllFlights = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Get all routes that don't have flights
        const routes = await Route.find({ flight: { $exists: false } });
        console.log(`Found ${routes.length} routes without flights`);

        const airlines = ["IndiGo", "Vistara", "Air India", "SpiceJet", "Akasa Air"];
        const classes = ["Economy", "Premium Economy", "Business", "First Class"];
        
        let created = 0;
        
        for (const route of routes) {
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const flightClass = classes[Math.floor(Math.random() * classes.length)];
            
            const flight = new Flight({
                name: `${airline} Flight`,
                flightNumber: `${airline.substring(0,2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
                airline: airline,
                aircraftType: "Boeing 737",
                class: flightClass,
                totalSeats: 180,
                amenities: ["WiFi", "In-flight Meal", "Extra Legroom"],
                rating: 4.0 + Math.random(),
                reviewCount: Math.floor(Math.random() * 200) + 50,
                isActive: true
            });

            await flight.save();
            
            route.flight = flight._id;
            await route.save();
            
            created++;
            if (created % 100 === 0) {
                console.log(`Created ${created} flights...`);
            }
        }

        console.log(`Created ${created} flights for all routes!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAllFlights();