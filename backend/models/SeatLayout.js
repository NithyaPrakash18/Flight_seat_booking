const mongoose = require("mongoose");

const seatLayoutSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
    unique: true,
  },
  layout: {
    type: String,
    enum: ["1x1", "2x2", "3x3", "2x3", "2x4x2", "3x3x3", "3x4x3"],
    required: [true, "Please specify seat layout"],
    default: "3x3",
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  seats: [
    {
      seatNumber: {
        type: String,
        required: true,
      },
      row: {
        type: Number,
        required: true,
      },
      column: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ["economy", "premium-economy", "business", "first"],
        default: "economy",
      },
      position: {
        type: String,
        enum: ["window", "aisle", "middle", "center"],
        default: "middle",
      },
      deck: {
        type: String,
        enum: ["main", "upper"],
        default: "main",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate total seats match seats array
seatLayoutSchema.pre("save", function (next) {
  if (this.seats.length !== this.totalSeats) {
    next(new Error("Total seats must match the number of seats in layout"));
  }
  next();
});

module.exports = mongoose.model("SeatLayout", seatLayoutSchema);
