import { lang, LanguageCode } from "../config/lang";
import prisma from "../config/prisma";
import { joinChannel } from "../lib/api";
import { clearAllChannelsProcesses, getUser } from "../utils";

const chatSharedCommand = async (ctx: any) => {
    const chat_id = ctx.update.message.chat_shared.chat_id.toString();
    const user_id = ctx.from.id.toString();
    const user = await getUser(user_id, ctx);

    if (!user) return;

    try {
        const process = await prisma.process.findFirst({
            where: { user_id },
        });

        if (!process) {
            await ctx.reply("❌ No process found. Please start a new collection.");
            return;
        }

        await ctx.deleteMessage(process.message_id ?? undefined);
        const { message_id } = await ctx.reply("Processing...");

        const { status } = await ctx.telegram.getChatMember(chat_id, parseInt(user_id));
        const channelInfo = await ctx.telegram.getChat(chat_id) as unknown as any;

        if (!channelInfo.username && process?.type == "TON") {
            await ctx.telegram.editMessageText(
                user_id,
                message_id,
                undefined,
                "❌ Channel most be public.",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔙 Back", callback_data: "back_home" }],
                        ],
                    },
                }
            );

            return;
        }

        if (status != "creator") {
            await ctx.telegram.editMessageText(
                user_id,
                message_id,
                undefined,
                lang[user.languageCode as LanguageCode].ONLY_ADMIN,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔙 Back", callback_data: "back_home" }],
                        ],
                    },
                }
            );

            return;
        }

        await clearAllChannelsProcesses(chat_id);

        // Generate invite link and use it to add user account to channel

        const res = await joinChannel(channelInfo.invite_link, chat_id);

        // await ctx.telegram.leaveChat(chat_id);

        if (!res.status) {
            await ctx.telegram.editMessageText(
                user_id,
                message_id,
                undefined,
                "❌ Something went wrong. Please try later or contact support.",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔙 Back", callback_data: "back_home" }],
                        ],
                    },
                }
            );

            return;
        }

        await prisma.process.update({
            where: { user_id },
            data: {
                channel_id: chat_id,
                message_id: message_id,
            },
        });

        await ctx.telegram.editMessageText(
            user_id,
            message_id,
            undefined,
            lang[user.languageCode as LanguageCode].TRANSFERT(
                channelInfo.title,
                channelInfo.invite_link,
                process.type
            ),
            {
                parse_mode: "HTML",
                link_preview_options: {
                    is_disabled: true,
                },
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "❌ Cancel", callback_data: "cancel" }],
                    ],
                }
            }
        );

    } catch (error) {
        console.error("Error in chat_shared handler:", error);
        await ctx.reply("❌ An error occurred while processing your request. Please try again later.");
    }

}

export default chatSharedCommand;