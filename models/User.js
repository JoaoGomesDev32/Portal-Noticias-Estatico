import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { collection: "users", timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

