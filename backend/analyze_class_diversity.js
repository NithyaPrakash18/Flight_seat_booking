const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Analyzing route class diversity across database...\n');

        // Sample 100 random source-destination pairs and check their class diversity
        const routes = await mongoose.connection.collection('routes').aggregate([
            {
                $lookup: {
                    from: 'flights',
                    localField: 'flight',
                    foreignField: '_id',
                    as: 'flightData'
                }
            },
            { $unwind: '$flightData' },
            {
                $group: {
                    _id: { source: '$source', dest: '$destination' },
                    classes: { $addToSet: '$flightData.class' },
                    count: { $sum: 1 }
                }
            },
            { $sample: { size: 100 } }
        ]).toArray();

        console.log('Sample: 100 random source→destination pairs\n');

        const stats = {
            all3: 0,  // Has 3+ classes (GOOD)
            only2: 0, // Has only 2 classes (PROBLEM)
            only1: 0  // Has only 1 class (BIG PROBLEM)
        };

        routes.forEach(r => {
            const numClasses = r.classes.length;
            if (numClasses >= 3) stats.all3++;
            else if (numClasses === 2) stats.only2++;
            else stats.only1++;
        });

        console.log('=== CLASS DIVERSITY STATISTICS ===');
        console.log(`✓ Routes with 3+ classes: ${stats.all3} (${(stats.all3 / routes.length * 100).toFixed(1)}%) - GOOD`);
        console.log(`✗ Routes with only 2 classes: ${stats.only2} (${(stats.only2 / routes.length * 100).toFixed(1)}%) - NEEDS FIX`);
        console.log(`✗ Routes with only 1 class: ${stats.only1} (${(stats.only1 / routes.length * 100).toFixed(1)}%) - NEEDS FIX`);

        if (stats.only2 > 0 || stats.only1 > 0) {
            console.log('\n=== PROBLEMATIC ROUTES (Limited Class Options) ===');
            const problematic = routes.filter(r => r.classes.length < 3).slice(0, 10);
            problematic.forEach(r => {
                console.log(`  ${r._id.source} → ${r._id.dest}`);
                console.log(`    Classes: ${r.classes.join(', ')} (${r.classes.length} classes)`);
                console.log(`    Total routes: ${r.count}`);
            });

            console.log('\n✗ PROBLEM DETECTED: Many routes still lack class diversity!');
        } else {
            console.log('\n✓ SUCCESS: All sampled routes have good class diversity!');
        }

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
