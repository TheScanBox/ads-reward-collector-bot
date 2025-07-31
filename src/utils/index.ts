import crypto from "crypto";
import { Context, Telegraf } from "telegraf";
import { Address } from "ton";

import prisma from "../config/prisma"
import { Update } from "telegraf/typings/core/types/typegram";
import { leaveChannel } from "../lib/api";
import { lang, LanguageCode } from "../config/lang";
import { Rewards } from "../types";

import transfertTON from "./sendTON";

export const clearAllChannelsProcesses = async (channel_id: string | number) => {
    try {
        await prisma.process.deleteMany({
            where: { channel_id: channel_id.toString() }
        });

        console.log(`All processes for channel ${channel_id} cleared.`);
    } catch (error) {
        console.error(`Error clearing processes for channel ${channel_id}:`, error);
    }
}

export const calculateReward = (totalAmount: number) => {
    if (totalAmount <= 0) {
        throw new Error("Total amount must be greater than zero");
    }

    const mainUserReward = Math.floor(totalAmount * 0.92 * 100) / 100;
    const companyShare = Math.floor(totalAmount * 0.06 * 100) / 100;
    const referrerShare = Math.floor(totalAmount * 0.02 * 100) / 100;

    return {
        mainUser: mainUserReward,
        company: companyShare,
        referrer: referrerShare,
    };
};

export const clearProcess = async (bot: Telegraf<Context<Update>>, user_id: string) => {
    try {
        const process = await prisma.process.findUnique({
            where: { user_id },
            select: {
                message_id: true,
                channel_id: true,
            },
        });

        if (!process) return;

        await prisma.process.delete({
            where: { user_id }
        });

        const { message_id, channel_id } = process;

        if (channel_id) {
            await leaveChannel(channel_id);
        }

        if (!message_id) return;

        console.log(`Clearing process for user ${user_id} with message ID ${message_id}`);

        await bot.telegram.deleteMessage(user_id, message_id);
    } catch (error) {
        console.error(error);
    }
};

export const generateID = (length = 8) => {
    const bytesNeeded = Math.ceil((length * 3) / 4);
    const buffer = crypto.randomBytes(bytesNeeded);

    const id = buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return id.substring(0, length);
};

export const getUser = async (user_id: string, ctx?: any) => {
    let user = await prisma.user.findFirst({
        where: {
            telegramId: user_id,
        },
    });

    if (!user) {
        const {
            first_name,
            last_name,
            id,
            username,
            is_premium,
            language_code,
        } = ctx.from;

        user = await prisma.user.create({
            data: {
                firstName: first_name,
                telegramId: user_id,
                isPremium: is_premium,
                languageCode: language_code,
                lastName: last_name,
                username: username,
                inviterId: ctx.payload || null,
            },
        });
    }

    return user;
};

export const isValidAddress = (address: string) => {
    try {
        Address.parse(address);
        return true;
    } catch (error) {
        return false; // Invalid address
    }
};

export const sendChannel = async (ctx: Context, type: Rewards, languageCode: LanguageCode) => {
    try {
        const user_id = ctx.from?.id

        if (!user_id) {
            await ctx.sendMessage("❌ Process was failed... Please try again later.");

            return;
        }

        try {
            await ctx.deleteMessage();
        } catch (error) {
            console.error("Failed to delete message:", error);
        }

        const msg = await ctx.sendMessage(lang[languageCode].COLLECT_REWARD(type), {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "Select Channel",
                            request_chat: {
                                chat_is_channel: true,
                                bot_administrator_rights: {
                                    is_anonymous: false,
                                    can_manage_chat: false,
                                    can_delete_messages: false,
                                    can_manage_video_chats: false,
                                    can_restrict_members: false,
                                    can_promote_members: false,
                                    can_change_info: false,
                                    can_invite_users: true,
                                    can_post_messages: false,
                                    can_edit_messages: false,
                                    can_pin_messages: false,
                                    can_manage_topics: false
                                },
                                user_administrator_rights: {
                                    is_anonymous: false,
                                    can_manage_chat: false,
                                    can_delete_messages: false,
                                    can_manage_video_chats: false,
                                    can_restrict_members: false,
                                    can_promote_members: false,
                                    can_change_info: false,
                                    can_invite_users: true,
                                    can_post_messages: false,
                                    can_edit_messages: false,
                                    can_pin_messages: false,
                                    can_manage_topics: false
                                },
                                request_id: 2323343,
                                chat_has_username: type == "TON" ? true : undefined,
                                chat_is_created: true,

                            },
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
            parse_mode: "HTML",
        });

        await prisma.process.update({
            where: { user_id: user_id.toString() },
            data: { message_id: msg.message_id }
        })
    } catch (error) {
        console.error("Error in sendChannel:", error);

        await ctx.sendMessage("❌ An error occurred while processing your request. Please try again later.");
    }
}

export { transfertTON };