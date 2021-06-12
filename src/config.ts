import dotenv from "dotenv";
dotenv.config();

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export { TELEGRAM_API_KEY, TELEGRAM_CHAT_ID };
