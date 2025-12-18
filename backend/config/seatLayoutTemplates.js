/**
 * Predefined Seat Layout Templates for Flights
 * These templates define fixed seat configurations for different flight classes
 */

const SEAT_LAYOUT_TEMPLATES = {
  Economy: {
    totalSeats: 120,
    layout: "3x3",
    configuration: {
      rows: 20,
      seatsPerRow: 6,
      aisleAfter: 3, // Aisle after 3rd seat (ABC DEF)
    },
    generateSeats: function () {
      const seats = [];
      const colMap = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F" };

      for (let row = 1; row <= this.configuration.rows; row++) {
        for (let col = 1; col <= this.configuration.seatsPerRow; col++) {
          let position = "middle";

          // Determine position (window/aisle)
          if (col === 1 || col === 6) {
            position = "window";
          } else if (col === 3 || col === 4) {
            position = "aisle";
          }

          seats.push({
            seatNumber: `${row}${colMap[col]}`,
            row: row,
            column: col,
            type: "economy",
            position: position,
            deck: "main",
          });
        }
      }

      return seats;
    },
  },
  "Premium Economy": {
    totalSeats: 60,
    layout: "3x3",
    configuration: {
      rows: 10,
      seatsPerRow: 6,
      aisleAfter: 3,
    },
    generateSeats: function () {
      const seats = [];
      const colMap = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F" };

      for (let row = 1; row <= this.configuration.rows; row++) {
        for (let col = 1; col <= this.configuration.seatsPerRow; col++) {
          let position = "middle";
          if (col === 1 || col === 6) position = "window";
          else if (col === 3 || col === 4) position = "aisle";

          seats.push({
            seatNumber: `${row}${colMap[col]}`,
            row: row,
            column: col,
            type: "premium-economy",
            position: position,
            deck: "main",
          });
        }
      }
      return seats;
    },

  },

  Business: {
    totalSeats: 40,
    layout: "2x2",
    configuration: {
      rows: 10,
      seatsPerRow: 4,
      aisleAfter: 2, // Aisle after 2nd seat (AC DF)
    },
    generateSeats: function () {
      const seats = [];
      const colMap = { 1: "A", 2: "C", 3: "D", 4: "F" }; // Skip B and E for wider seats

      for (let row = 1; row <= this.configuration.rows; row++) {
        for (let col = 1; col <= this.configuration.seatsPerRow; col++) {
          let position = "middle";

          // Determine position (window/aisle)
          if (col === 1 || col === 4) {
            position = "window";
          } else if (col === 2 || col === 3) {
            position = "aisle";
          }

          seats.push({
            seatNumber: `${row}${colMap[col]}`,
            row: row,
            column: col,
            type: "business",
            position: position,
            deck: "main",
          });
        }
      }

      return seats;
    },
  },

  "First Class": {
    totalSeats: 12,
    layout: "1x1", // Or 1-1 suites
    configuration: {
      rows: 4,
      seatsPerRow: 3, // 1-1-1 (A F K)
      aisleAfter: 1,
    },
    generateSeats: function () {
      // Custom generator for 1-1, let's say 1-2-1 logic or just simple 1-1-1
      const seats = [];
      const colMap = { 1: 'A', 2: 'F', 3: 'K' };

      for (let row = 1; row <= this.configuration.rows; row++) {
        for (let col = 1; col <= this.configuration.seatsPerRow; col++) {
          seats.push({
            seatNumber: `${row}${colMap[col]}`,
            row: row,
            column: col,
            type: "first",
            position: col === 2 ? "center" : "window",
            deck: "main"
          });
        }
      }
      return seats;
    },
  },
};

/**
 * Get seat layout template for a specific flight class
 * @param {string} flightClass - Class of flight (Economy, Business, First Class)
 * @returns {object} Layout template with generated seats
 */
function getSeatLayoutTemplate(flightClass) {
  const template = SEAT_LAYOUT_TEMPLATES[flightClass];

  if (!template) {
    // Fallback or error
    if (flightClass === "Economy") return SEAT_LAYOUT_TEMPLATES["Economy"];
    throw new Error(`Invalid flight class: ${flightClass}`);
  }

  return {
    totalSeats: template.totalSeats,
    layout: template.layout,
    seats: template.generateSeats(),
  };
}

/**
 * Get available seat types (classes)
 * @returns {Array} Array of available class names
 */
function getAvailableSeatTypes() {
  return Object.keys(SEAT_LAYOUT_TEMPLATES);
}

module.exports = {
  SEAT_LAYOUT_TEMPLATES,
  getSeatLayoutTemplate,
  getAvailableSeatTypes,
};
