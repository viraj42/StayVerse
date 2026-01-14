const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      city: { type: String, index: true },
      state: { type: String, index: true },
      country: { type: String, index: true },
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRooms: {
  type: Number,
  required: true,
  default: 1
},

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      enum: ["stay", "experience"],
      default: "stay",
    },

    propertyType: {
      type: String,
      required: true,
      index: true,
    },

    facilities: {
      type: [String],
      default: [],
    },

    highlights: {
      type: [String],
      default: [],
    },

    isHotDeal: {
      type: Boolean,
      default: false,
      index: true,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 90,
    },

    dealExpiry: {
      type: Date,
    },

    viewsCount: {
      type: Number,
      default:0
    },

    bookingCount: {
      type: Number,
      default:0
    },

    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      index: true,
    },
    addonPrices: {
      breakfast: { type: Number, default: 0 },
      lunch: { type: Number, default: 0 },
      dinner: { type: Number, default: 0 }
    },
    maxGuestsPerRoom: {
  type: Number,
  default: 2
},

  },
  { timestamps: true }
);

/* Indexes for discovery */
listingSchema.index({ "location.city": 1, avgRating: -1 });
listingSchema.index({ propertyType: 1, avgRating: -1 });
listingSchema.index({ isHotDeal: 1, discountPercentage: -1 });

module.exports = mongoose.model("Listing", listingSchema);
