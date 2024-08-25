import jwt from "jsonwebtoken";
import UserSchema from "../models/user.js";

const varifyAuth = async (req, res, next) => {
    let idToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const verified = jwt.verify(idToken, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ message: "Token verification failed, authorization denied" });
        }

        const user = await UserSchema.findById(verified.id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        req.userData = user;
        next();
    } catch (err) {
        if (err.message) {
            return res.status(500).json({ message: err.message }); // Use 400 for bad request errors
        }
        return res.status(500).json({ message: err }); // Generic message for unexpected issues
    }
};

export default varifyAuth;