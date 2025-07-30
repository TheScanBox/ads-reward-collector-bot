import { Telegraf } from "telegraf";
import express from "express";
import { message } from "telegraf/filters";
import dotenv from "dotenv";

dotenv.config();

import prisma from "./config/prisma"
import { config } from "./config/settings";
import { checkAuth } from "./middlewares/checkAuth";
import { userRoute, clearRoute, deleteRoute, processRoute, withdrawalRoute } from "./routes";
import { callbackqueryCommand, chatSharedCommand, errorHandler, startCommand, textCommand } from "./commands";

if (!config.BOT_TOKEN || !config.API_URL || !config.SECRET_KEY || !config.PORT) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

export const bot = new Telegraf(config.BOT_TOKEN);
const app = express();

app.use(express.json());

const protectedRoute = express.Router();
protectedRoute.use(checkAuth);

app.get("/", (req, res) => {
    return res.send("Server Started");
});

protectedRoute.use("/withdrawal", withdrawalRoute);
protectedRoute.use("/user", userRoute);
protectedRoute.use("/clear", clearRoute);
protectedRoute.use("/delete", deleteRoute);
protectedRoute.use("/process", processRoute);

bot.start(startCommand);
bot.on(message("text"), textCommand);
bot.on("callback_query", callbackqueryCommand);
bot.on(message("chat_shared"), chatSharedCommand);
bot.catch(errorHandler);

const startBot = async () => {
    if (process.env.NODE_ENV === "production") {
        app.use(
            await bot.createWebhook({
                domain: config.WEBHOOK_DOMAIN!,
                drop_pending_updates: true,
            })
        );
    } else {
        bot.launch(() => console.log("Bot launched successfully"));
    }
}

const startServer = async () => {
    try {
        await startBot();
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        app.listen(config.PORT, "0.0.0.0", () => {
            console.log(`Listening to port: ${config.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
}

startServer();