const {
  getSeatLayoutTemplate,
  getAvailableSeatTypes,
} = require("./config/seatLayoutTemplates");

console.log("Testing Seat Layout Templates\n");
console.log("=".repeat(50));

// Test 1: Get available seat types
console.log("\n1. Available Seat Types:");
const availableTypes = getAvailableSeatTypes();
console.log("  ", availableTypes);

// Test 2: Generate Seater layout
console.log("\n2. Generating Seater Layout:");
try {
  const seaterLayout = getSeatLayoutTemplate("Seater");
  console.log(`   Total Seats: ${seaterLayout.totalSeats}`);
  console.log(`   Layout Type: ${seaterLayout.layout}`);
  console.log(`   Seats Generated: ${seaterLayout.seats.length}`);
  console.log(
    `   First 5 Seats:`,
    seaterLayout.seats
      .slice(0, 5)
      .map((s) => `#${s.seatNumber}`)
      .join(", ")
  );
  console.log(
    `   Last 5 Seats:`,
    seaterLayout.seats
      .slice(-5)
      .map((s) => `#${s.seatNumber}`)
      .join(", ")
  );
  console.log("   ✅ Seater layout generated successfully!");
} catch (error) {
  console.error("   ❌ Error:", error.message);
}

// Test 3: Try Semi-Sleeper (should fail)
console.log("\n3. Testing Semi-Sleeper (expect error):");
try {
  getSeatLayoutTemplate("Semi-Sleeper");
  console.log("   ❌ Unexpected success!");
} catch (error) {
  console.log("   ✅ Expected error:", error.message);
}

// Test 4: Verify seat structure
console.log("\n4. Verifying Seat Structure:");
try {
  const layout = getSeatLayoutTemplate("Seater");
  const sampleSeat = layout.seats[0];
  console.log("   Sample seat (Seat #1):", JSON.stringify(sampleSeat, null, 2));

  const requiredFields = [
    "seatNumber",
    "row",
    "column",
    "type",
    "position",
    "deck",
  ];
  const hasAllFields = requiredFields.every((field) => field in sampleSeat);
  console.log(
    `   Has all required fields: ${hasAllFields ? "✅ YES" : "❌ NO"}`
  );

  // Check seat numbering is sequential
  const isSequential = layout.seats.every(
    (seat, index) => seat.seatNumber === (index + 1).toString()
  );
  console.log(
    `   Seat numbering sequential: ${isSequential ? "✅ YES" : "❌ NO"}`
  );
} catch (error) {
  console.error("   ❌ Error:", error.message);
}

console.log("\n" + "=".repeat(50));
console.log("✅ Test completed!\n");
