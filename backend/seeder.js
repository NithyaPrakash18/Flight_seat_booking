const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Load env vars
dotenv.config();

// Load Models
const Flight = require("./models/Flight");
const Route = require("./models/Route");
const SeatLayout = require("./models/SeatLayout");
const User = require("./models/User");
const Booking = require("./models/Booking");
const Review = require("./models/Review");
const { getSeatLayoutTemplate } = require("./config/seatLayoutTemplates");

// Connect DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected...");
        importData();
    })
    .catch(err => {
        console.error("Connection Error:", err);
        process.exit(1);
    });

// Sample Data
// Indian International Airports (also used for Domestic)
const indianAirports = [
    "New Delhi (DEL)", "Mumbai (BOM)", "Bengaluru (BLR)", "Chennai (MAA)", "Hyderabad (HYD)",
    "Kochi (COK)", "Kolkata (CCU)", "Ahmedabad (AMD)", "Pune (PNQ)", "Goa (GOI)",
    "Jaipur (JAI)", "Lucknow (LKO)", "Thiruvananthapuram (TRV)", "Varanasi (VNS)", "Indore (IDR)",
    "Bhopal (BHO)", "Chandigarh (IXC)", "Srinagar (SXR)", "Amritsar (ATQ)", "Patna (PAT)",
    "Ranchi (IXR)", "Guwahati (GAU)", "Visakhapatnam (VTZ)", "Coimbatore (CJB)", "Madurai (IXM)"
];

// International Destinations
const internationalAirports = [
    "Dubai (DXB)", "London (LHR)", "Singapore (SIN)", "New York (JFK)", "Paris (CDG)",
    "Frankfurt (FRA)", "Tokyo (HND)", "Sydney (SYD)", "Bangkok (BKK)", "Doha (DOH)",
    "Amsterdam (AMS)", "Rome (FCO)", "Zurich (ZRH)", "Madrid (MAD)", "Barcelona (BCN)",
    "Hong Kong (HKG)", "Kuala Lumpur (KUL)", "Seoul (ICN)", "Beijing (PEK)", "Shanghai (PVG)",
    "Osaka (KIX)", "Phuket (HKT)", "Abu Dhabi (AUH)", "Muscat (MCT)", "Istanbul (IST)",
    "Los Angeles (LAX)", "Toronto (YYZ)", "San Francisco (SFO)", "Melbourne (MEL)", "Auckland (AKL)"
];

const internationalAirlines = [
    { name: "Air India", rating: 4.0, reviewCount: 520 },
    { name: "Emirates", rating: 4.8, reviewCount: 1200 },
    { name: "British Airways", rating: 4.4, reviewCount: 600 },
    { name: "Singapore Airlines", rating: 4.9, reviewCount: 900 },
    { name: "Lufthansa", rating: 4.3, reviewCount: 450 },
    { name: "Qatar Airways", rating: 4.7, reviewCount: 800 }
];

const domesticAirlines = [
    { name: "IndiGo", rating: 4.2, reviewCount: 850 },
    { name: "Vistara", rating: 4.6, reviewCount: 400 },
    { name: "SpiceJet", rating: 3.8, reviewCount: 300 },
    { name: "AirAsia India", rating: 4.1, reviewCount: 250 },
    { name: "Akasa Air", rating: 4.3, reviewCount: 150 }
];

const aircraftTypes = ["Boeing 777", "Airbus A350", "Boeing 787 Dreamliner", "Airbus A380", "Boeing 737 MAX", "Airbus A320", "Airbus A321neo"];
const amenitiesList = ["WiFi", "In-flight Meal", "Extra Legroom", "USB Port", "Entertainment System", "Reclining Seats", "Lounge Access"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, size) => arr.slice(0, size);

const importData = async () => {
    try {
        // Drop collections to remove old indexes
        try { await mongoose.connection.collection('flights').drop(); } catch (e) { }
        try { await mongoose.connection.collection('routes').drop(); } catch (e) { }
        try { await mongoose.connection.collection('seatlayouts').drop(); } catch (e) { }
        try { await mongoose.connection.collection('users').drop(); } catch (e) { }
        try { await mongoose.connection.collection('bookings').drop(); } catch (e) { }
        try { await mongoose.connection.collection('reviews').drop(); } catch (e) { }
        // Explicitly drop buses collection if it exists
        try { await mongoose.connection.collection('buses').drop(); console.log("Buses collection dropped (if existed)..."); } catch (e) { }

        console.log("Collections Dropped & Data Destroyed...");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        await User.create([
            { name: "Admin", email: "admin@example.com", password: hashedPassword, phone: "9999999999", role: "admin" },
            { name: "User", email: "user@example.com", password: hashedPassword, phone: "8888888888", role: "user" }
        ]);

        console.log("Users Created...");

        const flights = [];
        const flightClasses = ["Economy", "Premium Economy", "Business", "First Class"];
        const createdFlights = [];

        // 1. Generate International Flights (50)
        for (let i = 0; i < 50; i++) {
            const airline = getRandom(internationalAirlines);
            const type = getRandom(aircraftTypes);
            const flightClass = getRandom(flightClasses);

            const layoutTemplate = getSeatLayoutTemplate(flightClass);

            const flight = await Flight.create({
                name: `${airline.name} Intl`,
                flightNumber: `${airline.name.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
                aircraftType: type,
                class: flightClass,
                airline: airline.name,
                totalSeats: layoutTemplate.totalSeats,
                amenities: getRandomSubset(amenitiesList, 5),
                rating: airline.rating,
                reviewCount: airline.reviewCount,
                isActive: true
            });
            createdFlights.push(flight);

            await SeatLayout.create({
                flight: flight._id,
                layout: layoutTemplate.layout,
                totalSeats: layoutTemplate.totalSeats,
                seats: layoutTemplate.seats
            });
        }

        // 2. Generate Domestic Flights (50)
        for (let i = 0; i < 50; i++) {
            const airline = getRandom(domesticAirlines);
            // Domestic usually smaller planes, but keeping mix
            const type = getRandom(["Airbus A320", "Boeing 737 MAX", "Airbus A321neo"]);
            const flightClass = getRandom(["Economy", "Premium Economy", "Business"]); // Rarely First in domestic

            const layoutTemplate = getSeatLayoutTemplate(flightClass);

            const flight = await Flight.create({
                name: `${airline.name} Domestic`,
                flightNumber: `${airline.name.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
                aircraftType: type,
                class: flightClass,
                airline: airline.name,
                totalSeats: layoutTemplate.totalSeats,
                amenities: getRandomSubset(amenitiesList, 3),
                rating: airline.rating,
                reviewCount: airline.reviewCount,
                isActive: true
            });
            createdFlights.push(flight);

            await SeatLayout.create({
                flight: flight._id,
                layout: layoutTemplate.layout,
                totalSeats: layoutTemplate.totalSeats,
                seats: layoutTemplate.seats
            });
        }

        console.log(`${createdFlights.length} Flights Created (Intl + Domestic)...`);

        const routes = [];

        // Helper to get random time
        const getRandomTime = () => {
            const hour = Math.floor(Math.random() * 24);
            const minute = Math.random() > 0.5 ? "00" : "30";
            return `${hour.toString().padStart(2, '0')}:${minute}`;
        };

        // Helper to calculate arrival time (rough approximation)
        const getArrivalTime = (depTime, durationMinutes) => {
            const [h, m] = depTime.split(":").map(Number);
            const totalMinutes = h * 60 + m + durationMinutes;
            const newH = Math.floor(totalMinutes / 60) % 24;
            const newM = totalMinutes % 60;
            return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
        };

        // 3. Generate Complete Route Matrix
        console.log("Generating Route Matrix...");

        // Separate flights
        const domFlights = createdFlights.filter(f => f.name.includes("Domestic") || f.name.includes("Shuttle"));
        const intlFlights = createdFlights.filter(f => f.name.includes("Intl") || f.name.includes("Special"));

        if (domFlights.length === 0 || intlFlights.length === 0) {
            console.warn("Warning: Not enough flights generated to cover all routes consistently.");
        }

        // Helper to shuffle array
        const shuffle = (array) => {
            let currentIndex = array.length, randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }
            return array;
        };

        // A. Domestic Matrix (All India <-> All India)
        for (const source of indianAirports) {
            for (const destination of indianAirports) {
                if (source === destination) continue;

                // Create 3 Guaranteed Flights per route (Morning, Afternoon, Evening)
                const timesOfDay = ["06:00", "12:00", "18:00"];

                // GUARANTEE class diversity: each route gets Economy, Premium Economy, Business
                const classRotation = ["Economy", "Premium Economy", "Business"];
                const shuffledFlights = shuffle([...domFlights]);
                const findFlightByClass = (cls) => shuffledFlights.find(f => f.class === cls) || shuffledFlights[0];

                for (let i = 0; i < timesOfDay.length; i++) {
                    const time = timesOfDay[i];
                    const targetClass = classRotation[i];
                    const flight = findFlightByClass(targetClass);

                    const basePrice = 3000 + Math.floor(Math.random() * 3000);
                    const multiplier = flight.class === "Business" ? 3 : (flight.class === "Premium Economy" ? 1.5 : 1);

                    // Add random minutes variance
                    const [h, m] = time.split(':');
                    const variedTime = `${h}:${(parseInt(m) + Math.floor(Math.random() * 30)).toString().padStart(2, '0')}`;

                    const durationMins = 60 + Math.floor(Math.random() * 180); // 1-4 hours

                    routes.push({
                        flight: flight._id,
                        source: source,
                        destination: destination,
                        departureTime: variedTime,
                        arrivalTime: getArrivalTime(variedTime, durationMins),
                        duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
                        distance: 500 + Math.floor(Math.random() * 1500),
                        price: Math.floor(basePrice * multiplier),
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        isActive: true
                    });
                }
            }
        }

        // B. International Matrix (All India <-> All International)
        for (const source of indianAirports) {
            for (const destination of internationalAirports) {
                // GUARANTEE class diversity: each route gets Economy, Premium Economy, Business
                const timesOfDay = ["08:00", "14:00", "20:00"];
                const classRotation = ["Economy", "Premium Economy", "Business"];
                const shuffledFlights = shuffle([...intlFlights]);
                const findFlightByClass = (cls) => shuffledFlights.find(f => f.class === cls) || shuffledFlights[0];

                for (let i = 0; i < timesOfDay.length; i++) {
                    const time = timesOfDay[i];
                    const targetClass = classRotation[i];
                    const flight = findFlightByClass(targetClass);

                    const basePrice = 15000 + Math.floor(Math.random() * 15000);
                    const multiplier = flight.class === "First Class" ? 5 : (flight.class === "Business" ? 3 : (flight.class === "Premium Economy" ? 1.5 : 1));

                    // Add random minutes variance
                    const [h, m] = time.split(':');
                    const variedTime = `${h}:${(parseInt(m) + Math.floor(Math.random() * 30)).toString().padStart(2, '0')}`;

                    const durationMins = 240 + Math.floor(Math.random() * 600); // 4-14 hours

                    // Outbound (India -> Abroad)
                    routes.push({
                        flight: flight._id,
                        source: source,
                        destination: destination,
                        departureTime: variedTime,
                        arrivalTime: getArrivalTime(variedTime, durationMins),
                        duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
                        distance: 3000 + Math.floor(Math.random() * 5000),
                        price: Math.floor(basePrice * multiplier),
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        isActive: true
                    });

                    // Inbound (Abroad -> India)
                    // varied return time
                    const returnHour = (parseInt(h) + 12) % 24;
                    const returnTime = `${returnHour.toString().padStart(2, '0')}:30`;

                    routes.push({
                        flight: flight._id,
                        source: destination,
                        destination: source,
                        departureTime: returnTime,
                        arrivalTime: getArrivalTime(returnTime, durationMins),
                        duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
                        distance: 3000 + Math.floor(Math.random() * 5000),
                        price: Math.floor(basePrice * multiplier),
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        isActive: true
                    });
                }
            }
        }

        await Route.insertMany(routes);
        console.log(`${routes.length} Routes Created...`);
        console.log("Data Imported Successfully!");
        process.exit();
    } catch (error) {
        console.error("Import Error:", error);
        process.exit(1);
    }
};
