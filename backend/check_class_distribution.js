const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Checking class distribution...\n');

        // Check Abu Dhabi to Ahmedabad specifically
        const routes = await mongoose.connection.collection('routes').find({
            source: /Abu Dhabi/i,
            destination: /Ahmedabad/i
        }).limit(20).toArray();

        console.log(`Found ${routes.length} routes from Abu Dhabi to Ahmedabad\n`);

        if (routes.length > 0) {
            const flightIds = routes.map(r => r.flight);
            const flights = await mongoose.connection.collection('flights').find({
                _id: { $in: flightIds }
            }).toArray();

            const flightMap = {};
            flights.forEach(f => {
                flightMap[f._id.toString()] = f;
            });

            console.log('Sample routes with classes:');
            routes.slice(0, 10).forEach(r => {
                const flight = flightMap[r.flight.toString()];
                console.log(`  ${r.departureTime} - Class: ${flight?.class || 'Unknown'} - Price: ₹${r.price}`);
            });

            // Count classes
            const classCounts = {};
            routes.forEach(r => {
                const flight = flightMap[r.flight.toString()];
                const cls = flight?.class || 'Unknown';
                classCounts[cls] = (classCounts[cls] || 0) + 1;
            });

            console.log('\nClass distribution for Abu Dhabi → Ahmedabad:');
            Object.entries(classCounts).forEach(([cls, count]) => {
                console.log(`  ${cls}: ${count} routes`);
            });
        }

        // Check overall class distribution
        console.log('\n\nOverall class distribution in database:');
        const allFlights = await mongoose.connection.collection('flights').find({}).toArray();
        const overallClasses = {};
        allFlights.forEach(f => {
            overallClasses[f.class] = (overallClasses[f.class] || 0) + 1;
        });
        Object.entries(overallClasses).forEach(([cls, count]) => {
            console.log(`  ${cls}: ${count} flights (${((count / allFlights.length) * 100).toFixed(1)}%)`);
        });

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
