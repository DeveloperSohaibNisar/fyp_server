import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";

export const create_llm = async () => {
    const model = new HuggingFaceInference({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        apiKey: process.env.HUGGINGFACEHUB_API_KEY, // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
    });
    // const res = await model.invoke("Write a poem about the ocean.");
    // console.log({ res });
    const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:'

    // A prompt created using PromptTemplate and the fromTemplate method
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

    // Take the standaloneQuestionPrompt and PIPE the model
    const standaloneQuestionChain = standaloneQuestionPrompt.pipe(model)

    // Await the response when you INVOKE the chain. 
    // Remember to pass in a question.
    const response = await standaloneQuestionChain.invoke({
        question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'
    })

    console.log({response})
}