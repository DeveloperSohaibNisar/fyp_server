import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    profilePictureUrl: {
      type: String,
      default: "http://192.168.100.6:3000/uploads/images/blank-profile-picture.png",
    },
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
