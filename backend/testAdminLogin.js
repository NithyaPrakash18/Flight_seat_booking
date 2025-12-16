const axios = require("axios");

async function testAdminLogin() {
  try {
    console.log("Testing Admin Login...\n");

    const response = await axios.post(
      "http://localhost:5000/api/auth/admin-login",
      {
        email: "admin@travelbooking.com",
        password: "Admin@123",
      }
    );

    console.log("✅ Login Successful!");
    console.log("\nResponse:");
    console.log("Status:", response.status);
    console.log("Message:", response.data.message);
    console.log("\nUser Details:");
    console.log("Name:", response.data.data.user.name);
    console.log("Email:", response.data.data.user.email);
    console.log("Role:", response.data.data.user.role);
    console.log("\nToken:", response.data.data.token.substring(0, 50) + "...");
  } catch (error) {
    console.error("❌ Login Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error(
        "Error:",
        error.response.data.message || error.response.data
      );
    } else {
      console.error("Error:", error.message);
    }
  }
}

testAdminLogin();
