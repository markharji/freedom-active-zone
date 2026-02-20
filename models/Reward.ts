import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },
    exclusions: {
      type: [String], // list of exclusions, e.g., ["apparel", "facilities"]
      default: [],
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "amount"],
      default: "percentage",
    },
  },
  {
    timestamps: true,
  },
);

const Reward = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);

export default Reward;
