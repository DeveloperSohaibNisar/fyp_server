import mongoose from "mongoose"

const recordingSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    uploadDate: {
        type: Date,
        default: Date.now()
    },
    audioLength: {
        required: true,
        type: Number
    },
    audioUrl: {
        required: true,
        type: String
    },
    isTranscritonCreated: {
        type: Boolean,
        default: false
    },
    isSummaryCreated: {
        type: Boolean,
        default: false
    },
    transcriptionData: {
        type: [{
            text: {
                type: String,
                required: true,
            },
            start: {
                type: Number,
                required: true,
            },
            end: {
                type: Number,
                required: true,
            },
        }],
        default: null,
    },
    summaryText: {
        type: String,
        default: null
    }
})

export default mongoose.model('recording', recordingSchema)