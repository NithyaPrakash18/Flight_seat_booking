const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);

        const users = await User.find().select("-password");
        console.log("All Users:", JSON.stringify(users, null, 2));

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkUsers();
