import {GoogleGenerativeAI} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.API_KEY);

export async function translateInput(text: string, userLanguage: string, targetLanguage: string){
        //chagne model to newest
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Please translate the input from ${userLanguage} to ${targetLanguage} and return the original and translated sentence
        Returned: ${text}`

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }