import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
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
        default: "http://localhost:3000/uploads/images/blank-profile-picture.png"
    }
})

export default mongoose.model('user', userSchema)