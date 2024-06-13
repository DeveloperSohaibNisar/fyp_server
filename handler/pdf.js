import PdfSchema from "../models/pdf.js";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MongoClient } from "mongodb";

export const uploadPdf = async (req, res) => {

    try {
        const data = await pdf(req.file.path);
        const newPdf = new PdfSchema({
            name: req.file.originalname,
            numpages: parseInt(data.numpages),
            pdfUrl: `http://localhost:3000/uploads/pdfs/${req.file.filename}`,
        });
        const snapshot = await newPdf.save();
        res.status(200).json(snapshot);
    }
    catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};

export const createVectorDb = async (req, res) => {
    try {
        let dataBuffer = Buffer.from(await fetch("http://localhost:3000/uploads/pdfs/1717784868428-411444644-DataLake.pdf").then(x => x.arrayBuffer()));

        const spliter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100
        });

        const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
        const collection = client.db('FYP').collection('vector_documents');

        const data = await pdf(dataBuffer);
        const output = await spliter.createDocuments([data.text], [{ pdfID: req.params.pdfId }]);

        const vectorstore = await MongoDBAtlasVectorSearch.fromDocuments(
            output,
            new HuggingFaceInferenceEmbeddings(),
            {
                collection,
                indexName: "vector_index", // The name of the Atlas search index. Defaults to "default"
                textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
                embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
            }
        );

        // const assignedIds = await vectorstore.addDocuments([
        //     { pageContent: "upsertable", metadata: {} },
        // ]);

        // const upsertedDocs = [{ pageContent: "overwritten", metadata: {} }];

        // await vectorstore.addDocuments(upsertedDocs, { ids: assignedIds });

        await client.close();
        // console.log(output);
        res.send(output)

    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};