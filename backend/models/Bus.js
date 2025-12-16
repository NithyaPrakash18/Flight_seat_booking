const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide bus name"],
    trim: true,
  },
  busNumber: {
    type: String,
    required: [true, "Please provide bus number"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  busType: {
    type: String,
    enum: ["AC", "Non-AC", "Sleeper", "Semi-Sleeper", "Volvo", "Luxury"],
    required: [true, "Please specify bus type"],
  },
  seatType: {
    type: String,
    enum: ["Seater", "Semi-Sleeper", "Sleeper"],
    required: [true, "Please specify seat type"],
  },
  totalSeats: {
    type: Number,
    required: [true, "Please specify total seats"],
    min: 1,
    max: 60,
  },
  amenities: [
    {
      type: String,
      enum: [
        "WiFi",
        "Charging Point",
        "Water Bottle",
        "Blanket",
        "TV",
        "Reading Light",
        "Emergency Exit",
      ],
    },
  ],
  operator: {
    type: String,
    required: [true, "Please provide operator name"],
  },
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
busSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Bus", busSchema);
