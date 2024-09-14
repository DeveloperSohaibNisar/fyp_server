import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const createSummary = async (text) => {
  try {
    const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;
    if (!HUGGINGFACEHUB_API_KEY) {
      throw new Error(`Expected env var HUGGINGFACEHUB_API_KEY`);
    }

    const llm = new HuggingFaceInference({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      temperature: 0.2,
      maxTokens: 1000,
    });

    const summaryTemplate = `
    You are an expert in summarizing text.
    Below is the text:

    -----------------------
    Text: 
    "${text}"
    -----------------------

    Your goal is to:
    Write a Title for the text that is under 15 words.
    Write a summary of the provided text.
    Then write: "Additional Info".
    Then return a list of the main points in the provided text. Then return a list of action items. Then return a list of follow up questions.
    Limit each list item to be less or at most 100 words, and return less or no more than 5 points per list you can also return empty lists.
    If the text is too small just return empty lists of main points, action items and follow up questions.

    You must always only output a JSON object containing following key structure do not pass any other text or symbols.
      {
        "title": "Concise Title",
        "summary": "Brief summary of the pdf",
        "additionalInfo": {
          "mainPoints": [...],
          "actionItems": [...],
          "followUpQuestions": [...]
        }    
      }   
    `;

    console.log(text);
    const result = await llm.invoke(summaryTemplate);
    const dashRegex = /^-{1,}\n/;
    const jsonResult = result.replace(dashRegex, "");

    console.log(result);
    return JSON.parse(jsonResult);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default createSummary;
