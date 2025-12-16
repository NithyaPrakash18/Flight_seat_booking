const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function quickTest() {
  try {
    console.log("Testing connection to:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n✅ SUCCESS! Connected to MongoDB");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("\nCollections found:", collections.length);
    collections.forEach((col) => console.log("  -", col.name));

    await mongoose.connection.close();
    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection FAILED:", error.message);
    process.exit(1);
  }
}

quickTest();
