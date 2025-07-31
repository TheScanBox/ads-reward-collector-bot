import dotenv from "dotenv";

dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN || "",
    API_URL: process.env.CLIENT_API_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    PORT: parseInt(process.env.PORT || "3000", 10),
    ADMIN_ID: process.env.ADMIN_ID,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    SUPPORT_USERNAME: process.env.SUPPORT_USERNAME,
    INTERVAL: parseInt(process.env.INTERVAL || "30", 10),
    WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN || "",
    MIN_WITHDRAWAL_AMOUNT: parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT || "0.1"),
    MAX_WITHDRAWAL_AMOUNT: parseFloat(process.env.MAX_WITHDRAWAL_AMOUNT || "100"),
    MIN_WITHDRAWAL_TON_AMOUNT: parseFloat(process.env.MIN_WITHDRAWAL_TON_AMOUNT || "10"),
    MIN_WITHDRAWAL_STAR_AMOUNT: parseFloat(process.env.MIN_WITHDRAWAL_STAR_AMOUNT || "1000"),
    MNEMONIC: process.env.MNEMONIC || "",
    API_KEY: process.env.API_KEY || "",
    PAYMENT_CHANNEL_ID: process.env.PAYMENT_CHANNEL_ID || "",
}