const mongoose = require('mongoose');
const Flight = require('./models/Flight');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to DB\n');

        // Get sample flights
        const flights = await Flight.find().limit(15).select('name class airline');
        console.log('Sample flights:');
        flights.forEach(f => {
            console.log(`  ${f.name.padEnd(30)} - Class: ${f.class.padEnd(20)} - Airline: ${f.airline}`);
        });

        // Get class distribution
        const classCounts = await Flight.aggregate([
            { $group: { _id: '$class', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('\nClass distribution:');
        classCounts.forEach(c => {
            console.log(`  ${c._id}: ${c.count} flights`);
        });

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
