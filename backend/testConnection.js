const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Test MongoDB Connection
const testConnection = async () => {
  try {
    console.log("🔍 Testing MongoDB connection...");
    console.log(
      `📍 Connecting to: ${process.env.MONGODB_URI?.replace(
        /\/\/.*@/,
        "//***@"
      )}`
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("\n✅ MongoDB Connected Successfully!");
    console.log(`📊 Database Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(
      `🔌 Connection State: ${
        conn.connection.readyState === 1 ? "Connected" : "Not Connected"
      }`
    );

    // Get list of collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`\n📋 Collections in database (${collections.length} total):`);
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });

    // Get document counts
    console.log("\n📊 Document counts:");
    for (const col of collections) {
      const count = await mongoose.connection.db
        .collection(col.name)
        .countDocuments();
      console.log(`   ${col.name}: ${count} documents`);
    }

    await mongoose.connection.close();
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ MongoDB Connection Failed!");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

testConnection();
