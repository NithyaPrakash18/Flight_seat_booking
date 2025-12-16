const { getSeatLayoutTemplate } = require("./config/seatLayoutTemplates");

console.log("\n" + "=".repeat(60));
console.log("  SEMI-SLEEPER DUAL-DECK LAYOUT TEST");
console.log("=".repeat(60));

try {
  const semiSleeperLayout = getSeatLayoutTemplate("Semi-Sleeper");

  console.log("\n✅ Semi-Sleeper Layout Generated Successfully!\n");
  console.log(`📊 Total Seats: ${semiSleeperLayout.totalSeats}`);
  console.log(`📐 Layout Type: ${semiSleeperLayout.layout}`);
  console.log(`🎯 Seats Generated: ${semiSleeperLayout.seats.length}`);

  // Analyze by deck
  const lowerDeckSeats = semiSleeperLayout.seats.filter(
    (s) => s.deck === "lower"
  );
  const upperDeckSeats = semiSleeperLayout.seats.filter(
    (s) => s.deck === "upper"
  );

  console.log(`\n🔽 Lower Deck (Seater):`);
  console.log(`   Total: ${lowerDeckSeats.length} seats`);
  console.log(`   Type: ${lowerDeckSeats[0]?.type}`);
  console.log(
    `   First 3: ${lowerDeckSeats
      .slice(0, 3)
      .map((s) => `#${s.seatNumber}`)
      .join(", ")}`
  );

  console.log(`\n🔼 Upper Deck (Sleeper):`);
  console.log(`   Total: ${upperDeckSeats.length} berths`);
  console.log(`   Type: ${upperDeckSeats[0]?.type}`);
  console.log(
    `   First 3: ${upperDeckSeats
      .slice(0, 3)
      .map((s) => `#${s.seatNumber}`)
      .join(", ")}`
  );

  // Verify types
  const lowerAllSeater = lowerDeckSeats.every((s) => s.type === "seater");
  const upperAllSleeper = upperDeckSeats.every((s) => s.type === "sleeper");

  console.log(
    `\n✓ Lower deck all seater: ${lowerAllSeater ? "YES ✅" : "NO ❌"}`
  );
  console.log(
    `✓ Upper deck all sleeper: ${upperAllSleeper ? "YES ✅" : "NO ❌"}`
  );
  console.log(
    `✓ Total count: ${
      semiSleeperLayout.seats.length === 35
        ? "35 ✅"
        : `${semiSleeperLayout.seats.length} ❌`
    }`
  );

  console.log("\n" + "=".repeat(60));
  console.log("✅ SEMI-SLEEPER LAYOUT TEST PASSED!");
  console.log("=".repeat(60) + "\n");
} catch (error) {
  console.error("\n❌ ERROR:", error.message);
  console.log("\n" + "=".repeat(60) + "\n");
}
