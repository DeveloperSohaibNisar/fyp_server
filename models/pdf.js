import mongoose from "mongoose"

const pdfSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    uploadDate: {
        type: Date,
        default: Date.now()
    },
    numpages: {
        required: true,
        type: Number
    },
    pdfUrl: {
        required: true,
        type: String
    },
    isVectorDatabaseCreated: {
        type: Boolean,
        default: false
    },
    isSummaryCreated: {
        type: Boolean,
        default: false
    },
    summaryText: {
        type: String,
        default: null
    }
})

export default mongoose.model('pdf', pdfSchema)