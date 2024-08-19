import UserSchema from "../models/user.js";
import { validateUserDetails } from "../util/validation.js";

export const editProfile = async (req, res) => {
  let user = req.userData;
  user.name = req.body.name;

  if (req.file) {
    user.profilePictureUrl = `http://localhost:3000/uploads/images/${req.file.filename}`;
  } else {
    user.profilePictureUrl =
      "http://localhost:3000/uploads/images/blank-profile-picture.png";
  }

  const { errors, valid } = validateUserDetails({ name: user.name });
  if (!valid) return res.status(400).json(errors);

  await UserSchema.updateOne(
    { _id: req.userData._id },
    {
      profilePictureUrl: user.profilePictureUrl,
      name: user.name,
    }
  ).exec();

  return res.status(200).json(user);
};

export const getUserData = async (req, res) => {
  return res.status(200).json(req.userData);
};
