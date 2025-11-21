import axios from "axios";

const BASE_URL = "https://sandbox.safaricom.co.ke";

export const generateToken = async () => {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const { data } = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    console.log("🔥 Token Generated:", data.access_token);
    return data.access_token;

  } catch (error) {
    console.log("❌ TOKEN ERROR:", error.response?.data || error.message);
    throw error;
  }
};

export const stkPush = async ({ phone, amount }) => {
  const token = await generateToken();

  // TIMESTAMP
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .substring(0, 14);

  console.log("⏱️ Timestamp:", timestamp);

  // PASSWORD
  const password = Buffer.from(
    process.env.DARAJA_SHORTCODE + process.env.DARAJA_PASSKEY + timestamp
  ).toString("base64");

  // PAYLOAD
  const payload = {
    BusinessShortCode: process.env.DARAJA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.DARAJA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.CALLBACK_URL,
    AccountReference: "Test123",
    TransactionDesc: "Testing STK push",
  };

  console.log("📦 FINAL PAYLOAD SENT TO SAFARICOM:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ SAFARICOM RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.log("❌ SAFARICOM ERROR RESPONSE:");
    console.log(error.response?.data || error.message);
    throw error;
  }
};
