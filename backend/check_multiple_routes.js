const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Checking class diversity across multiple routes...\n');

        const testRoutes = [
            { from: /Mumbai/i, to: /Delhi/i, name: 'Mumbai → Delhi (Domestic)' },
            { from: /Abu Dhabi/i, to: /Ahmedabad/i, name: 'Abu Dhabi → Ahmedabad (Intl→India)' },
            { from: /Chennai/i, to: /Dubai/i, name: 'Chennai → Dubai (India→Intl)' },
            { from: /London/i, to: /Mumbai/i, name: 'London → Mumbai (Intl→India)' },
            { from: /Bangalore/i, to: /Singapore/i, name: 'Bengaluru → Singapore (India→Intl)' }
        ];

        for (const testRoute of testRoutes) {
            const routes = await mongoose.connection.collection('routes').find({
                source: testRoute.from,
                destination: testRoute.to
            }).limit(50).toArray();

            console.log(`\n${testRoute.name}:`);
            console.log(`  Total routes: ${routes.length}`);

            if (routes.length > 0) {
                const flightIds = routes.map(r => r.flight);
                const flights = await mongoose.connection.collection('flights').find({
                    _id: { $in: flightIds }
                }).toArray();

                const flightMap = {};
                flights.forEach(f => flightMap[f._id.toString()] = f);

                const classCounts = {};
                routes.forEach(r => {
                    const flight = flightMap[r.flight.toString()];
                    const cls = flight?.class || 'Unknown';
                    classCounts[cls] = (classCounts[cls] || 0) + 1;
                });

                console.log('  Classes available:');
                ['Economy', 'Premium Economy', 'Business', 'First Class'].forEach(cls => {
                    const count = classCounts[cls] || 0;
                    const status = count > 0 ? '✓' : '✗ MISSING';
                    console.log(`    ${cls}: ${count} routes ${status}`);
                });
            } else {
                console.log('  ✗ NO ROUTES FOUND!');
            }
        }

        console.log('\n\n=== OVERALL SUMMARY ===');
        const totalRoutes = await mongoose.connection.collection('routes').countDocuments();
        console.log(`Total routes in database: ${totalRoutes}`);

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
