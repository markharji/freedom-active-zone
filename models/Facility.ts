import mongoose from "mongoose";

const TimeSlotSchema = new mongoose.Schema(
  {
    start: { type: Number, required: true, min: 6, max: 23 }, // hours only
    end: { type: Number, required: true, min: 6, max: 23 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }, // optional, avoids creating separate _id for each slot
);

const HotspotSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true, min: 0, max: 100 },
    y: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const FacilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sport: { type: String, required: true },
    convertible: { type: Boolean, default: false },
    otherSports: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          if (this.convertible) {
            return value.length > 0;
          }
          return true;
        },
        message: "Convertible facilities must have otherSports.",
      },
    },

    description: { type: String, required: true },

    timeSlots: {
      type: [TimeSlotSchema],
      default: [],
      validate: {
        validator: function (slots) {
          // Ensure no overlapping slots and valid ranges
          for (let i = 0; i < slots.length; i++) {
            const a = slots[i];
            if (a.start >= a.end || a.start < 6 || a.end > 23) return false;

            for (let j = i + 1; j < slots.length; j++) {
              const b = slots[j];
              if (!(a.end <= b.start || a.start >= b.end)) return false;
            }
          }
          return true;
        },
        message: "Time slots must be valid, within 6–23, and not overlap.",
      },
    },

    hotspot: { type: [HotspotSchema], required: false }, // ✅ add hotspot

    thumbnail: { type: String },
    rating: { type: Number, default: 0 },
    images: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.models.Facility || mongoose.model("Facility", FacilitySchema);
