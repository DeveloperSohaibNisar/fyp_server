import PdfSchema from "../models/pdf.js";
import pdf from "pdf-parse";
import { MongoClient } from "mongodb";

import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};

export const createVectorDb = async (req, res) => {
    try {
        if (!req.params.pdfId) throw new Error(`Invalid Request`);

        const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;
        if (!HUGGINGFACEHUB_API_KEY) throw new Error(`Expected env var HUGGINGFACEHUB_API_KEY`);

        const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;
        if (!MONGODB_ATLAS_URI) throw new Error(`Expected env var MONGODB_ATLAS_URI`);

        let pdfSnap = await PdfSchema.findById(req.params.pdfId);
        if (!pdfSnap) {
            return res.status(404).json({ error: `pdf with id ${req.params.audioId} not found` });
        }

        const model_name = "BAAI/bge-large-en-v1.5";
        const spliter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const client = new MongoClient(MONGODB_ATLAS_URI || "");
        const collection = client.db("FYP").collection("vector_documents");

        let dataBuffer = Buffer.from(
            await fetch("http://localhost:3000/uploads/pdfs/1717784868428-411444644-DataLake.pdf").then((x) => x.arrayBuffer())
        );
        const data = await pdf(dataBuffer);
        const output = await spliter.createDocuments([data.text], [{ pdfID: req.params.pdfId }]);

        await MongoDBAtlasVectorSearch.fromDocuments(output, new HuggingFaceInferenceEmbeddings({ model: model_name }), {
            collection,
            indexName: "vector_index", // The name of the Atlas search index. Defaults to "default"
            textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
            embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
        });
        await client.close();

        pdfSnap.isVectorDatabaseCreated = true;
        const updatedRecording = await pdfSnap.save();
        return res.status(200).json(updatedRecording);
    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};

export const chatbot = async (req, res) => {
    console.log(req.params.pdfID);
    console.log(req.params.query);
    const model_name = "BAAI/bge-large-en-v1.5";

    const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;
    if (!HUGGINGFACEHUB_API_KEY) throw new Error(`Expected env var HUGGINGFACEHUB_API_KEY`);

    const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;
    if (!MONGODB_ATLAS_URI) throw new Error(`Expected env var MONGODB_ATLAS_URI`);

    const client = new MongoClient(MONGODB_ATLAS_URI || "");
    const collection = client.db("FYP").collection("vector_documents");
    const vectorStore = new MongoDBAtlasVectorSearch(new HuggingFaceInferenceEmbeddings({ model: model_name }), {
        collection,
        indexName: "vector_index", // The name of the Atlas search index. Defaults to "default"
        textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
        embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
    });

    const retriever = vectorStore.asRetriever({
        filter: {
            preFilter: {
                pdfID: {
                    $eq: req.params.pdfID,
                },
            },
        },
    });

    const llm = new HuggingFaceInference({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        temperature: 0.8,
        topK: 50,
    });

    const template = `
Answer the user question based on the given context.     
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}
Question: {question}
Answer: 
`;

    const customRagPrompt = PromptTemplate.fromTemplate(template);

    const ragChain = await createStuffDocumentsChain({
        llm,
        prompt: customRagPrompt,
        outputParser: new StringOutputParser(),
    });
    const context = await retriever.invoke(req.params.query);

    const result = await ragChain.invoke({
        question: req.params.query,
        context,
    });
    res.send(result);
};
