import { bot } from "..";
import { inline_keyboard } from "../config/keyboard";
import { lang, LanguageCode } from "../config/lang";
import prisma from "../config/prisma";
import { config } from "../config/settings";
import { leaveChannel } from "../lib/api";
import { clearProcess, generateID, getUser, sendChannel, transfertTON } from "../utils";

const callbackQueryCommand = async (ctx: any) => {
    const command = (ctx.callbackQuery as any).data as string;
    const user_id = ctx.from.id.toString();

    const { languageCode, balance, walletAddress, } = await getUser(user_id);

    if (command == "collect_reward") {
        await ctx.editMessageText(lang[languageCode as LanguageCode].SELECT_OPTION, {
            reply_markup: {
                inline_keyboard: inline_keyboard[languageCode as LanguageCode].SELECT_OPTION,
            },
            parse_mode: "HTML",
        })

        return;
    }

    if (command == "collect_ton_reward" || command == "collect_stars_reward") {
        await clearProcess(bot, user_id);

        const type = command == "collect_ton_reward" ? "TON" : "STARS";

        await prisma.process.create({
            data: {
                type,
                user_id
            }
        });

        await sendChannel(ctx, type, languageCode as LanguageCode);

        return;
    }

    if (command == "profile") {
        await ctx.editMessageText(
            lang[languageCode as LanguageCode].PROFILE(walletAddress, balance.toNumber()),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode as LanguageCode].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        return;
    }

    if (command == "referrals") {
        const username = ctx.botInfo.username;

        await ctx.editMessageText(
            lang[languageCode as LanguageCode].REFERAL(username, user_id),
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔙 Back", callback_data: "back_home" }],
                    ],
                },
                link_preview_options: {
                    is_disabled: true,
                },
                parse_mode: "HTML",
            }
        );

        return;
    }

    if (command == "about") {
        await ctx.editMessageText(lang[languageCode as LanguageCode].ABOUT, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{ text: "🔙 Back", callback_data: "back_home" }]],
            },
        });

        return;
    }

    if (command == "change_language") {
        const newLang =
            languageCode == "en"
                ? "ru"
                : languageCode == "ru"
                    ? "fr"
                    : languageCode == "fr"
                        ? "en"
                        : "fr";

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                languageCode: newLang,
            },
        });

        await ctx.editMessageText(
            lang[newLang].PROFILE(walletAddress, balance.toNumber()),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[newLang].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        return;
    }

    if (command == "wallet") {
        const msg = await ctx.reply(lang[languageCode as LanguageCode].WALLET);

        let messageId: number | null = null;
        if (typeof msg === "object" && "message_id" in msg) {
            messageId = (msg as { message_id: number }).message_id;
        }

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                msgId: messageId,
                action: "change_wallet",
            },
        });

        return;
    }

    if (command == "withdraw") {
        if (!walletAddress) {
            await ctx.answerCbQuery("❌ Wallet address not set.", {
                show_alert: true,
            });
            return;
        }

        if (balance.toNumber() < config.MIN_WITHDRAWAL_AMOUNT) {
            await ctx.answerCbQuery(`❌ Insufficient TON balance. You need atleast ${config.MIN_WITHDRAWAL_AMOUNT} TON`, {
                show_alert: true,
            });
            return;
        }

        const msg = await ctx.editMessageText(
            lang[languageCode as LanguageCode].WITHDRAW(balance.toNumber(), walletAddress),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode as LanguageCode].CONFIRM,
                },
            }
        );

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                msgId: typeof msg === "object" && "message_id" in msg ? msg.message_id : null,
            },
        });

        return;
    }

    if (command == "withdraw_confirm") {
        if (balance.toNumber() < config.MIN_WITHDRAWAL_AMOUNT) {
            await ctx.answerCbQuery(`❌ Insufficient TON balance. You need atleast ${config.MIN_WITHDRAWAL_AMOUNT} TON`, {
                show_alert: true,
            });

            return;
        }

        let withadrawAmount = balance.toNumber();

        if (withadrawAmount > config.MAX_WITHDRAWAL_AMOUNT) {
            withadrawAmount = config.MAX_WITHDRAWAL_AMOUNT;
        }

        const users = await prisma.user.updateMany({
            where: {
                telegramId: user_id,
                withdrawalStatus: "idle",
            },
            data: {
                withdrawalStatus: "active",
                balance: {
                    decrement: withadrawAmount,
                },
            },
        });

        if (users.count == 0) {
            await ctx.answerCbQuery("pending...", {
                show_alert: true,
            });

            return;
        }

        await ctx.editMessageText("Processing...");

        const transactionId = generateID(8);
        const status = await transfertTON(
            walletAddress,
            withadrawAmount.toFixed(2).toString(),
            transactionId
        );

        if (!status) {
            await prisma.user.update({
                where: {
                    telegramId: user_id,
                },
                data: {
                    withdrawalStatus: "idle",
                    balance: {
                        increment: withadrawAmount,
                    },
                },
            });

            await ctx.answerCbQuery("❌ Something went wrong", {
                show_alert: true,
            });

            await ctx.editMessageText(
                lang[languageCode as LanguageCode].PROFILE(walletAddress, balance.toNumber()),
                {
                    reply_markup: {
                        inline_keyboard: inline_keyboard[languageCode as LanguageCode].PROFILE,
                    },
                    parse_mode: "HTML",
                }
            );

            return;
        }

        await ctx.answerCbQuery(lang[languageCode as LanguageCode].SUCCESS(withadrawAmount), {
            show_alert: true,
        });

        const updatedUser = await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                withdrawalStatus: "idle"
            },
        });

        await ctx.editMessageText(
            lang[languageCode as LanguageCode].PROFILE(walletAddress, updatedUser.balance.toNumber() || 0),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode as LanguageCode].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        await prisma.transaction.create({
            data: {
                id: transactionId,
                amount: balance,
                userId: user_id,
                status: "completed",
            },
        });
    }

    if (command == "withdraw_cancel") {
        await ctx.answerCbQuery(`❌ Request canceled`, {
            show_alert: true,
        });

        await ctx.editMessageText(
            lang[languageCode as LanguageCode].PROFILE(walletAddress, balance.toNumber()),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode as LanguageCode].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        return;
    }

    if (command == "back_home" || command == "cancel") {
        if (command == "cancel") {
            const process = await prisma.process.findFirst({
                where: { user_id },
            });

            if (process && process.channel_id) {
                await leaveChannel(process.channel_id);
            }
        }

        await ctx.editMessageText(lang[languageCode as LanguageCode].MAIN, {
            reply_markup: {
                inline_keyboard: inline_keyboard[languageCode as LanguageCode].MAIN,
            },
            parse_mode: "HTML",
        });

        return;
    }
}

export default callbackQueryCommand;