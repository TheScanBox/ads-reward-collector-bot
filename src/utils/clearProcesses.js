import { prisma } from "../config/prisma.js";

export const clearProcess = async (bot, chat_id) => {
    try {
        const process = await prisma.process.findFirst({
            where: {
                channel_id: chat_id,
            },
            select: {
                user_id: true,
                message_id: true,
            },
        });

        if (!process) return;

        await prisma.process.delete({
            where: {
                channel_id: chat_id,
            },
        });

        const { message_id, user_id } = process;

        await bot.telegram.editMessageText(
            user_id,
            message_id,
            undefined,
            "❌ Process was canceled...",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔙 Back", callback_data: "back" }],
                    ],
                },
            }
        );
    } catch (error) {
        console.error(error);
    }
};
