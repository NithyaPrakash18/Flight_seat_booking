const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");
const SeatLayout = require("./models/SeatLayout");

dotenv.config();

const createAllSeats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const flights = await Flight.find({ isActive: true });
        console.log(`Found ${flights.length} flights`);

        let created = 0;
        for (const flight of flights) {
            const existing = await SeatLayout.findOne({ flight: flight._id });
            if (existing) continue;

            const seats = [];
            const totalSeats = Math.min(flight.totalSeats, 30);
            
            for (let i = 1; i <= totalSeats; i++) {
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
                totalSeats: totalSeats,
                seats: seats
            });

            await seatLayout.save();
            created++;

            if (created % 100 === 0) {
                console.log(`Created ${created} seat layouts...`);
            }
        }

        console.log(`Created ${created} seat layouts total!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAllSeats();