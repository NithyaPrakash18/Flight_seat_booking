const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const SeatLayout = require("./models/SeatLayout");

dotenv.config();

const createSeatLayouts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const flights = await Flight.find({ isActive: true });
        console.log(`Found ${flights.length} flights`);

        let created = 0;

        for (const flight of flights) {
            // Check if seat layout already exists
            const existing = await SeatLayout.findOne({ flight: flight._id });
            if (existing) continue;

            // Create seats based on flight class
            const seats = [];
            const totalSeats = flight.totalSeats;
            const seatsPerRow = flight.class === "First Class" ? 2 : flight.class === "Business" ? 4 : 6;
            const rows = Math.ceil(totalSeats / seatsPerRow);

            for (let row = 1; row <= rows; row++) {
                for (let col = 1; col <= seatsPerRow; col++) {
                    if (seats.length >= totalSeats) break;
                    
                    const seatNumber = `${row}${String.fromCharCode(64 + col)}`;
                    seats.push({
                        seatNumber: seatNumber,
                        seatType: flight.class === "First Class" ? "premium" : 
                                 flight.class === "Business" ? "premium" : "regular",
                        isAvailable: true,
                        price: flight.class === "First Class" ? 50000 : 
                               flight.class === "Business" ? 25000 : 
                               flight.class === "Premium Economy" ? 15000 : 8000
                    });
                }
                if (seats.length >= totalSeats) break;
            }

            const seatLayout = new SeatLayout({
                flight: flight._id,
                layout: `${rows}x${seatsPerRow}`,
                totalSeats: seats.length,
                seats: seats
            });

            await seatLayout.save();
            created++;

            if (created % 100 === 0) {
                console.log(`Created ${created} seat layouts...`);
            }
        }

        console.log(`Created ${created} seat layouts!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createSeatLayouts();