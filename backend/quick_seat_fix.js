const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const SeatLayout = require("./models/SeatLayout");

dotenv.config();

const quickSeatFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const flights = await Flight.find({ isActive: true }).limit(50);
        console.log(`Creating seat layouts for ${flights.length} flights`);

        for (const flight of flights) {
            const existing = await SeatLayout.findOne({ flight: flight._id });
            if (existing) continue;

            const seats = [];
            for (let i = 1; i <= 30; i++) {
                seats.push({
                    seatNumber: `${i}A`,
                    row: i,
                    column: 1,
                    type: "economy",
                    position: "window"
                });
            }

            const seatLayout = new SeatLayout({
                flight: flight._id,
                layout: "3x3",
                totalSeats: 30,
                seats: seats
            });

            await seatLayout.save();
        }

        console.log("Created seat layouts!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

quickSeatFix();