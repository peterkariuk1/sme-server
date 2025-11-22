import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Tool } from "langchain/tools";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";

import { stkPush } from "./mpesa.js";

// ------------------------
// 1. DEFINE TOOLS
// ------------------------
class MpesaTool extends Tool {
  name = "mpesaStkPush";
  description = "Initiate an M-Pesa STK push. Input: { phone, amount }";

  async _call(input) {
    const { phone, amount } = JSON.parse(input);
    return await stkPush({ phone, amount });
  }
}

export const tools = [new MpesaTool()];

// ------------------------
// 2. CREATE THE MODEL
// ------------------------
export const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",      // or 1.5-pro for heavier tasks
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
});

// ------------------------
// 3. BUILD THE AGENT PIPELINE
// ------------------------
export const agent = RunnableSequence.from([
  async (input) => new HumanMessage(input),
  model.bindTools(tools), // <== MAGIC: model can call tools here
]);
