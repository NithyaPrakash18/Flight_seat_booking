/**
 * Predefined Seat Layout Templates
 * These templates define fixed seat configurations for different bus types
 */

const SEAT_LAYOUT_TEMPLATES = {
  Seater: {
    totalSeats: 40,
    layout: "2x2",
    configuration: {
      rows: 10,
      seatsPerRow: 4,
      aisleAfter: 2, // Aisle after 2nd seat in each row
    },
    generateSeats: function () {
      const seats = [];
      let seatNumber = 1;

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
            seatNumber: seatNumber.toString(),
            row: row,
            column: col,
            type: "seater",
            position: position,
            deck: "lower",
          });

          seatNumber++;
        }
      }

      return seats;
    },
  },

  "Semi-Sleeper": {
    totalSeats: 35,
    layout: "2x2+1x2", // Lower+Upper deck layouts
    configuration: {
      lowerDeck: {
        rows: 5,
        seatsPerRow: 4, // 2-2 configuration
        aisleAfter: 2,
      },
      upperDeck: {
        rows: 5,
        seatsPerRow: 3, // 1-2 configuration
        aisleAfter: 1,
      },
    },
    generateSeats: function () {
      const seats = [];
      let seatNumber = 1;

      // Generate lower deck seats (seater - seats 1-20)
      for (let row = 1; row <= this.configuration.lowerDeck.rows; row++) {
        for (
          let col = 1;
          col <= this.configuration.lowerDeck.seatsPerRow;
          col++
        ) {
          let position = "middle";

          if (col === 1 || col === 4) {
            position = "window";
          } else if (col === 2 || col === 3) {
            position = "aisle";
          }

          seats.push({
            seatNumber: seatNumber.toString(),
            row: row,
            column: col,
            type: "seater",
            position: position,
            deck: "lower",
          });

          seatNumber++;
        }
      }

      // Generate upper deck sleeper berths (seats 21-35)
      for (let row = 1; row <= this.configuration.upperDeck.rows; row++) {
        for (
          let col = 1;
          col <= this.configuration.upperDeck.seatsPerRow;
          col++
        ) {
          let position = "middle";

          if (col === 1) {
            position = "window"; // Left single berth
          } else if (col === 2 || col === 3) {
            position = col === 2 ? "aisle" : "window";
          }

          seats.push({
            seatNumber: seatNumber.toString(),
            row: row,
            column: col,
            type: "sleeper",
            position: position,
            deck: "upper",
          });

          seatNumber++;
        }
      }

      return seats;
    },
  },

  Sleeper: {
    totalSeats: 30,
    layout: "1x2",
    configuration: {
      rows: 10,
      seatsPerRow: 3,
      aisleAfter: 1, // Aisle after 1st berth (left side)
    },
    generateSeats: function () {
      const seats = [];
      let seatNumber = 1;

      for (let row = 1; row <= this.configuration.rows; row++) {
        for (let col = 1; col <= this.configuration.seatsPerRow; col++) {
          let position = "middle";

          // Determine position
          if (col === 1) {
            position = "window"; // Left single berth
          } else if (col === 2 || col === 3) {
            position = col === 2 ? "aisle" : "window"; // Right side berths
          }

          seats.push({
            seatNumber: seatNumber.toString(),
            row: row,
            column: col,
            type: "sleeper", // Changed to sleeper type
            position: position,
            deck: "lower",
          });

          seatNumber++;
        }
      }

      return seats;
    },
  },
};

/**
 * Get seat layout template for a specific seat type
 * @param {string} seatType - Type of seat (Seater, Semi-Sleeper, Sleeper)
 * @returns {object} Layout template with generated seats
 */
function getSeatLayoutTemplate(seatType) {
  const template = SEAT_LAYOUT_TEMPLATES[seatType];

  if (!template) {
    throw new Error(`Invalid seat type: ${seatType}`);
  }

  if (template.totalSeats === 0) {
    throw new Error(`Seat layout for ${seatType} is not yet configured`);
  }

  return {
    totalSeats: template.totalSeats,
    layout: template.layout,
    seats: template.generateSeats(),
  };
}

/**
 * Get available seat types
 * @returns {Array} Array of available seat type names
 */
function getAvailableSeatTypes() {
  return Object.keys(SEAT_LAYOUT_TEMPLATES).filter(
    (type) => SEAT_LAYOUT_TEMPLATES[type].totalSeats > 0
  );
}

module.exports = {
  SEAT_LAYOUT_TEMPLATES,
  getSeatLayoutTemplate,
  getAvailableSeatTypes,
};
