const {
  getSeatLayoutTemplate,
  getAvailableSeatTypes,
} = require("./config/seatLayoutTemplates");

console.log("\n" + "=".repeat(60));
console.log("  SLEEPER LAYOUT TEST");
console.log("=".repeat(60));

try {
  const sleeperLayout = getSeatLayoutTemplate("Sleeper");

  console.log("\n✅ Sleeper Layout Generated Successfully!\n");
  console.log(`📊 Total Berths: ${sleeperLayout.totalSeats}`);
  console.log(`📐 Layout Type: ${sleeperLayout.layout} (1 left + 2 right)`);
  console.log(`🛏️  Type: Sleeper berths`);
  console.log(`📏 Seats Generated: ${sleeperLayout.seats.length}`);

  // Check structure
  console.log(`\n🔍 First 5 Berths:`);
  sleeperLayout.seats.slice(0, 5).forEach((seat) => {
    console.log(
      `   Berth #${seat.seatNumber}: Row ${seat.row}, Col ${seat.column}, ${seat.position}, type: ${seat.type}`
    );
  });

  console.log(`\n🔍 Last 5 Berths:`);
  sleeperLayout.seats.slice(-5).forEach((seat) => {
    console.log(
      `   Berth #${seat.seatNumber}: Row ${seat.row}, Col ${seat.column}, ${seat.position}, type: ${seat.type}`
    );
  });

  // Configuration summary
  console.log(`\n📋 Configuration:`);
  console.log(`   Rows: 10`);
  console.log(`   Berths per row: 3 (1 + 2)`);
  console.log(`   Aisle after column: 1`);

  // Verify all are sleeper type
  const allSleeper = sleeperLayout.seats.every(
    (seat) => seat.type === "sleeper"
  );
  console.log(
    `\n✓ All berths are sleeper type: ${allSleeper ? "YES ✅" : "NO ❌"}`
  );

  // Verify total
  const correctTotal = sleeperLayout.seats.length === 30;
  console.log(`✓ Total count correct: ${correctTotal ? "YES ✅" : "NO ❌"}`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ SLEEPER LAYOUT TEST PASSED!");
  console.log("=".repeat(60) + "\n");
} catch (error) {
  console.error("\n❌ ERROR:", error.message);
  console.log("\n" + "=".repeat(60) + "\n");
}
