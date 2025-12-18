const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide flight name/number"],
    trim: true,
  },
  flightNumber: {
    type: String,
    required: [true, "Please provide flight number"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  airline: {
    type: String,
    required: [true, "Please provide airline name"],
    trim: true,
  },
  aircraftType: {
    type: String,
    enum: ["Airbus A320", "Boeing 737", "Boeing 747", "Airbus A380", "Embraer E190", "Boeing 777", "Airbus A350", "Boeing 787 Dreamliner", "Boeing 737 MAX", "Airbus A321neo"],
    required: [true, "Please specify aircraft type"],
  },
  class: {
    type: String,
    enum: ["Economy", "Premium Economy", "Business", "First Class"],
    required: [true, "Please specify class"],
  },
  totalSeats: {
    type: Number,
    required: [true, "Please specify total seats"],
    min: 1,
    max: 850,
  },
  amenities: [
    {
      type: String,
      enum: [
        "WiFi",
        "In-flight Meal",
        "Extra Legroom",
        "USB Port",
        "Entertainment System",
        "Reclining Seats",
        "Priority Boarding",
        "Lounge Access",
      ],
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
flightSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Flight", flightSchema);
