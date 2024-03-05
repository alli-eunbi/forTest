import mongoose from "mongoose";

const InstanceSchema = new mongoose.Schema(
  {
    instanceId: {
      type: String,
    },
    eniId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Node model
export const Instance = mongoose.model("Node", InstanceSchema);
