import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { stkPush } from "./mpesa.js";

dotenv.config();

// 1) Initialize your model
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

// 2) Wrap STK PUSH as a tool
const stkTool = tool(
  async ({ phone, amount }) => {
    return await stkPush({ phone, amount });
  },
  {
    name: "mpesa_stk_push",
    description: "Send an M-Pesa STK push to a phone number.",
    schema: {
      type: "object",
      properties: {
        phone: { type: "string" },
        amount: { type: "number" },
      },
      required: ["phone", "amount"],
    },
  }
);

// 3) Create agent
export const agent = createReactAgent({
  llm,
  tools: [stkTool],
  messageModifier:
    "You are a finance assistant for SMEs. Use tools ONLY when necessary.",
});
