const mongoose = require('mongoose');
const Route = require('./models/Route');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to DB\n');

        // Check routes from Abu Dhabi to Ahmedabad
        const routes = await Route.find({
            source: /Abu Dhabi/i,
            destination: /Ahmedabad/i
        }).populate('flight');

        console.log(`Found ${routes.length} routes from Abu Dhabi to Ahmedabad\n`);

        if (routes.length > 0) {
            console.log('Route details:');
            routes.forEach(route => {
                console.log(`  Source: ${route.source}`);
                console.log(`  Destination: ${route.destination}`);
                console.log(`  Flight: ${route.flight?.name}`);
                console.log(`  Class: ${route.flight?.class}`);
                console.log(`  Price: ₹${route.price}`);
                console.log(`  Departure: ${route.departureTime}`);
                console.log('  ---');
            });

            // Group by class
            const classCounts = {};
            routes.forEach(r => {
                const cls = r.flight?.class || 'Unknown';
                classCounts[cls] = (classCounts[cls] || 0) + 1;
            });
            console.log('\nClasses available:');
            Object.entries(classCounts).forEach(([cls, count]) => {
                console.log(`  ${cls}: ${count} flights`);
            });
        } else {
            console.log('No routes found! Checking reverse direction...\n');

            const reverseRoutes = await Route.find({
                source: /Ahmedabad/i,
                destination: /Abu Dhabi/i
            }).populate('flight').limit(5);

            console.log(`Found ${reverseRoutes.length} routes from Ahmedabad to Abu Dhabi`);
            if (reverseRoutes.length > 0) {
                console.log('Sample classes available:');
                reverseRoutes.forEach(r => {
                    console.log(`  ${r.flight?.class || 'Unknown'}`);
                });
            }
        }

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
