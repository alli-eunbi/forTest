import mongoose from "mongoose";

// the ENI schema
const ENISchema = new mongoose.Schema(
  {
    eniId: {
      type: String,
      required: true,
      unique: true,
    },
    privateIp: {
      type: String,
      required: true,
    },
    primaryIp: {
      type: String,
    },
    publicIp: {
      type: String,
    },
    instanceId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the ENI model
export const Eni = mongoose.model("Eni", ENISchema);
