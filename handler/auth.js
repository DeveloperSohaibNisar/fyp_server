import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";

import { validateSignupData, validateLoginData } from "../util/validation.js";
import UserSchema from "../models/user.js";

export const signup = async (req, res) => {
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            name: req.body.name
        };

        const { errors, valid } = validateSignupData(data);
        if (!valid) return res.status(400).json(errors);

        const existingUser = await UserSchema.exists({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: "User with same email already exists! " });
        }

        const hashedPassword = await bcryptjs.hash(data.password, 8);
        const newUser = new UserSchema({
            name: data.name,
            email: data.email,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        // sending token and doc of that user NOTE: don't send all users data
        return res.status(201).json({ token });
    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
}

export const login = async (req, res) => {
    const data = {
        email: req.body.email,
        password: req.body.password,
    };

    const { errors, valid } = validateLoginData(data);
    if (!valid) return res.status(400).json(errors);

    const user = await UserSchema.findOne({ email: data.email });

    if (!user) {
        return res.status(404).json({ error: "user not found " });
    }

    // check password typed in matchs with one in database
    // as passwords in DB are hashed so
    // compare(password that user typed, which user to compare )
    const isMatch = await bcryptjs.compare(data.password, user.password);

    if (!isMatch) {
        return res.status(400).json({ error: "Incorrect Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // sending token and doc of that user NOTE: don't send all users data
    return res.status(202).json({ token });
}