import mongoose from "mongoose";

// container Schema
const ContainerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  // started Boolean 값으로 상태 파악
  status: {
    type: Boolean,
  },
});

// pod schema
export const PodSchema = new mongoose.Schema(
  {
    podName: {
      type: String,
    },
    namespace: {
      type: String,
    },
    podIp: {
      type: String,
    },
    hostIp: {
      type: String,
    },
    nodeName: {
      type: String,
    },
    containers: [ContainerSchema],
  },
  {
    timestamps: true,
  }
);
// Create the pod model
export const Pod = mongoose.model("Pod", PodSchema);
