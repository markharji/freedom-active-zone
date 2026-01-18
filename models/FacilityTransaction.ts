import mongoose, { Schema, model, models } from "mongoose";

const facilityTransactionSchema = new Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userContact: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g., "10:00"
    endTime: { type: String, required: true }, // e.g., "12:00"
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const FacilityTransaction = models.FacilityTransaction || model("FacilityTransaction", facilityTransactionSchema);

export default FacilityTransaction;
