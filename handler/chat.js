import ChatSchema from "../models/chat.js";
import { MongoClient } from "mongodb";

import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

export const chatBot = async (req, res) => {
  try {
    if (!req.params.sourceId) throw new Error(`Invalid Request`);
    if (!req.body.query) throw new Error(`Invalid Request`);

    const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;
    if (!HUGGINGFACEHUB_API_KEY)
      throw new Error(`Expected env var HUGGINGFACEHUB_API_KEY`);

    const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;
    if (!MONGODB_ATLAS_URI)
      throw new Error(`Expected env var MONGODB_ATLAS_URI`);

    const client = new MongoClient(MONGODB_ATLAS_URI || "");
    const collection = client.db("FYP").collection("vector_documents");
    const vectorStore = new MongoDBAtlasVectorSearch(
      new HuggingFaceInferenceEmbeddings({ model: "BAAI/bge-large-en-v1.5" }),
      {
        collection,
        indexName: "vector_index", // The name of the Atlas search index. Defaults to "default"
        textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
        embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
      }
    );

    const retriever = vectorStore.asRetriever({
      filter: {
        preFilter: {
          sourceId: {
            $eq: req.params.sourceId,
          },
        },
      },
    });

    const llm = new HuggingFaceInference({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      temperature: 0.7,
      maxTokens: 1000,
    });

    const template = `
Answer the user question exclusively based on the provided context. 
If the answer cannot be deduced from the context, state that you don't know it. 
Do not attempt to speculate or fabricate information.
Make the answer as concise as possible.

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
    const context = await retriever.invoke(req.body.query);

    const result = await ragChain.invoke({
      question: req.body.query,
      context,
    });

    const newChat = new ChatSchema({
      query: req.body.query,
      reply: result,
      sourceId: req.params.sourceId,
      userId: req.userData._id,
    });
    const snapshot = await newChat.save();
    res.status(200).json(snapshot);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getChats = async (req, res) => {
  try {
    if (!req.params.sourceId) throw new Error(`Invalid Request`);
    const result = await ChatSchema.find({
      $and: [{ sourceId: req.params.sourceId }, { userId: req.userData._id }],
    }).sort({ createdAt: 1 });

    return res.status(200).json(result);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
