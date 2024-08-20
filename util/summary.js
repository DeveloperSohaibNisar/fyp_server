import ChatSchema from "../models/chat.js";

import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";

export const createSummary = async (text) => {
  try {
    const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;
    if (!HUGGINGFACEHUB_API_KEY)
      throw new Error(`Expected env var HUGGINGFACEHUB_API_KEY`);

    const llm = new HuggingFaceInference({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      temperature: 0.8,
      topK: 50,
    });

    const summaryTemplate = `
    You are an expert in summarizing audio transcriptions.
    Your goal is to create a summary of an audip.
    Below you find the transcript of an audio:
    --------
    {text}
    --------
    
    Provide a concise and informative summary capturing the main points.`;

    llm.invoke;
    const customSummaryTemplate = PromptTemplate.fromTemplate(summaryTemplate);

    const runnable = customSummaryTemplate.pipe(llm);

    const summary = runnable.invoke({ text });
    return summary;
  } catch (err) {
    throw err;
  }
};
