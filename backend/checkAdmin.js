const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

async function checkAdminUser() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected to database:", mongoose.connection.name);

    // Check if users collection exists
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const userCollectionExists = collections.some(
      (col) => col.name === "users"
    );

    if (!userCollectionExists) {
      console.log("\n❌ 'users' collection does not exist!");
      console.log("Creating admin user...");

      // Create admin user
      const User = require("./models/User");
      const admin = await User.create({
        name: "Admin User",
        email: "admin@travelbooking.com",
        password: "Admin@123",
        phone: "9999999999",
        role: "admin",
        isActive: true,
      });

      console.log("✅ Admin user created successfully!");
      console.log("Email:", admin.email);
      console.log("Role:", admin.role);
    } else {
      // Check for admin user
      const User = require("./models/User");
      const admin = await User.findOne({
        email: "admin@travelbooking.com",
      }).select("+password");

      if (!admin) {
        console.log("\n❌ Admin user NOT found in database!");
        console.log("Creating admin user...");

        const newAdmin = await User.create({
          name: "Admin User",
          email: "admin@travelbooking.com",
          password: "Admin@123",
          phone: "9999999999",
          role: "admin",
          isActive: true,
        });

        console.log("✅ Admin user created successfully!");
        console.log("Email:", newAdmin.email);
        console.log("Role:", newAdmin.role);
      } else {
        console.log("\n✅ Admin user found!");
        console.log("Name:", admin.name);
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("Active:", admin.isActive);

        // Test password
        const testPassword = "Admin@123";
        const isMatch = await bcrypt.compare(testPassword, admin.password);

        console.log("\nPassword Test:");
        console.log("Testing password:", testPassword);
        console.log("Password match:", isMatch ? "✅ YES" : "❌ NO");

        if (!isMatch) {
          console.log("\n⚠️  Password doesn't match! Updating password...");
          admin.password = "Admin@123";
          await admin.save();
          console.log("✅ Password updated successfully!");
        }
      }
    }

    await mongoose.connection.close();
    console.log("\n✅ Check completed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

checkAdminUser();
