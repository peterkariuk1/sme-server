import express from "express";
import dotenv from "dotenv";
import { stkPush } from "./mpesa.js";
import cors from "cors";
import { agent } from "./ai.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- 1. Trigger STK push ----
app.post("/api/stk", async (req, res) => {
  const { phone, amount } = req.body;
  console.log("📞 Phone:", phone);
  console.log("💵 Amount:", amount);

  try {
    const response = await stkPush({ phone, amount });
    res.json({ success: true, response });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({
      error: "STK push failed",
      details: error.response?.data || error.message,
    });
  }
});

// ---- 2. STK Callback ----
app.post("/api/stk-callback", (req, res) => {
  console.log("STK Callback received:", JSON.stringify(req.body, null, 2));
  res.json({ message: "Callback received successfully" });
});

app.post("/api/agent", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await agent.invoke(message);

    res.json({
      reply: response?.content ?? response
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- 3. Healthcheck ----
app.get("/", (req, res) => {
  res.send("M-Pesa STK backend running.");
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port: ${port}`));
