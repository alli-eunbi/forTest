import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost/portal");
    console.log("Successfully connected to database");
  } catch (error) {
    console.error(error);
  }
}
