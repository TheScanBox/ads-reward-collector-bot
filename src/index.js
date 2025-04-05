import { Telegraf } from "telegraf";
import express from "express";
import { message } from "telegraf/filters";
import dotenv from "dotenv";

import { inline_keyboard } from "./utils/keyboard.js";
import { prisma } from "./config/prisma.js";
import { getUser } from "./utils/getUser.js";
import { text } from "./utils/text.js";
import { transfertTON } from "./utils/sendTON.js";
import { generateID } from "./utils/generateID.js";
import { isValidAddress } from "./utils/isValidAddress.js";
import { calculateReward } from "./utils/calculateRewards.js";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.CLIENT_API_URL;
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
const ADMIN_ID = process.env.ADMIN_ID;
const INTERVAL = process.env.INTERVAL;

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(
    await bot.createWebhook({
        domain: process.env.webhookDomain,
        drop_pending_updates: true,
    })
);

const checkAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // Example token check (replace with JWT verification)
    if (token !== SECRET_KEY) {
        return res.status(403).json({ message: "Forbidden" });
    }

    next(); // Allow request to continue
};

app.get("/", (req, res) => {
    return res.send("Server Started");
});

app.get("/user", checkAuth, async (req, res) => {
    const user_id = req.query.user_id;

    try {
        const user = await getUser(user_id);

        return res.json({ ...user });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

app.post("/withdrawal", checkAuth, async (req, res) => {
    const { amount, user_id } = req.body;
    const { mainUser, company, referrer } = calculateReward(parseFloat(amount));

    try {
        const { inviterId } = await getUser(user_id.toString());

        if (inviterId) {
            await prisma.user.update({
                where: {
                    telegramId: inviterId,
                },
                data: {
                    balance: {
                        increment: referrer,
                    },
                },
            });
        }

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                balance: {
                    increment: mainUser,
                },
            },
        });

        await prisma.user.update({
            where: {
                telegramId: ADMIN_ID,
            },
            data: {
                balance: {
                    increment: inviterId ? company : company + referrer,
                },
            },
        });

        await prisma.transaction.createMany({
            data: [
                {
                    id: generateID(8),
                    amount,
                    userId: user_id,
                    status: "completed",
                    type: "deposit",
                },
                {
                    id: generateID(8),
                    amount: company,
                    userId: ADMIN_ID,
                    status: "completed",
                    type: "deposit",
                },
            ],
        });

        res.json({ status: "done" });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

app.get("/delete", checkAuth, async (req, res) => {
    const { user_id, channel_id } = req.query;

    try {
        await prisma.process.deleteMany({
            where: {
                channel_id,
                user_id,
            },
        });

        res.json({ status: "deleted" });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

app.get("/clear", checkAuth, async (req, res) => {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - parseInt(INTERVAL));

    try {
        const processes = await prisma.process.findMany({
            where: {
                createdAt: {
                    lt: twoHoursAgo,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        });

        if (!processes.length) return res.json({ ok: true });

        for (let process of processes) {
            try {
                const res = await fetch(`${API_URL}/leave`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${SECRET_KEY}`,
                    },
                    body: JSON.stringify({
                        channel_id: process.channel_id,
                    }),
                });
                const data = await res.json();

                if (!data.status) {
                    console.log("continue");
                    continue;
                }

                await prisma.process.delete({
                    where: {
                        id: process.id,
                    },
                });

                await bot.telegram.editMessageText(
                    process.user_id,
                    process.message_id,
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
        }

        return res.json({ ok: true });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

bot.start(async (ctx) => {
    const user_id = ctx.from.id.toString();
    const { languageCode } = await getUser(user_id, ctx);

    ctx.reply(text[languageCode].MAIN, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: inline_keyboard[languageCode].MAIN,
        },
    });
});

bot.on(message("text"), async (ctx) => {
    const user_text = ctx.message.text;
    const user_id = ctx.from.id.toString();

    const { action, msgId, languageCode } = await getUser(user_id, ctx);

    if (action == "change_wallet") {
        if (msgId) {
            await ctx.deleteMessage(msgId);
        }
        await ctx.deleteMessage();

        if (!isValidAddress(user_text)) {
            await ctx.reply(text[languageCode].INVALID);
            await prisma.user.update({
                where: {
                    telegramId: user_id,
                },
                data: {
                    msgId: null,
                },
            });

            return;
        }

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                walletAddress: user_text,
                msgId: null,
                action: "",
            },
        });

        await ctx.reply(text[languageCode].UPDATE);
    }
});

bot.on("callback_query", async (ctx) => {
    const command = ctx.callbackQuery.data;
    const user_id = ctx.from.id.toString();

    if (command == "collect_reward") {
        const { languageCode } = await getUser(user_id);

        await ctx.deleteMessage();
        const msg = await ctx.sendMessage(text[languageCode].COLLECT_REWARD, {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "Select Channel",
                            request_chat: {
                                chat_is_channel: true,
                                bot_administrator_rights: {
                                    can_invite_users: true,
                                },
                                user_administrator_rights: {
                                    can_invite_users: true,
                                },
                                request_id: 2323343,
                                chat_has_username: true,
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

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                msgId: msg.message_id,
            },
        });

        return;
    }

    if (command == "profile") {
        const { balance, walletAddress, languageCode } = await getUser(
            user_id,
            ctx
        );

        await ctx.editMessageText(
            text[languageCode].PROFILE(walletAddress, balance),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        return;
    }

    if (command == "referrals") {
        const { languageCode } = await getUser(user_id);
        const username = ctx.botInfo.username;

        await ctx.editMessageText(
            text[languageCode].REFERAL(username, user_id),
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔙 Back", callback_data: "back" }],
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
        const { languageCode } = await getUser(user_id);

        await ctx.editMessageText(text[languageCode].ABOUT, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]],
            },
        });

        return;
    }

    if (command == "change_language") {
        const { languageCode, walletAddress, balance } = await getUser(
            user_id,
            ctx
        );
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
            text[newLang].PROFILE(walletAddress, balance),
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
        const { languageCode } = await getUser(user_id);

        const msg = await ctx.reply(text[languageCode].WALLET);

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                msgId: msg.message_id,
                action: "change_wallet",
            },
        });

        return;
    }

    if (command == "withdraw") {
        const { balance, walletAddress, languageCode } = await getUser(
            user_id,
            ctx
        );

        if (!walletAddress) {
            await ctx.answerCbQuery("❌ Wallet address not set.", {
                show_alert: true,
            });
            return;
        }

        if (balance == 0) {
            await ctx.answerCbQuery("❌ Insufficient TON balance", {
                show_alert: true,
            });
            return;
        }

        const msg = await ctx.editMessageText(
            text[languageCode].WITHDRAW(balance, walletAddress),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode].CONFIRM,
                },
            }
        );

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                msgId: msg.message_id,
            },
        });

        return;
    }

    if (command == "withdraw_confirm") {
        const { balance, walletAddress, languageCode } = await getUser(
            user_id,
            ctx
        );

        if (balance == 0) {
            await ctx.answerCbQuery("❌ Insufficient TON balance", {
                show_alert: true,
            });

            return;
        }

        const users = await prisma.user.updateMany({
            where: {
                telegramId: user_id,
                withdrawalStatus: "idle",
            },
            data: {
                withdrawalStatus: "active",
                balance: 0,
            },
        });

        if (users.count == 0) {
            await ctx.answerCbQuery("pending...", {
                show_alert: true,
            });

            return;
        }

        await ctx.editMessageText("Processing...");

        const status = await transfertTON(
            walletAddress,
            balance.toFixed(2).toString()
        );

        if (!status) {
            await prisma.user.update({
                where: {
                    telegramId: user_id,
                },
                data: {
                    withdrawalStatus: "idle",
                    balance: balance,
                },
            });

            await ctx.answerCbQuery("❌ Something went wrong", {
                show_alert: true,
            });

            await ctx.editMessageText(
                text[languageCode].PROFILE(walletAddress, balance),
                {
                    reply_markup: {
                        inline_keyboard: inline_keyboard[languageCode].PROFILE,
                    },
                    parse_mode: "HTML",
                }
            );

            return;
        }

        await ctx.answerCbQuery(text[languageCode].SUCCESS(balance), {
            show_alert: true,
        });

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                withdrawalStatus: "idle",
                balance: 0,
            },
        });

        await ctx.editMessageText(
            text[languageCode].PROFILE(walletAddress, 0),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        await prisma.transaction.create({
            data: {
                id: generateID(8),
                amount: balance,
                userId: user_id,
                status: "completed",
            },
        });
    }

    if (command == "withdraw_cancel") {
        const { balance, walletAddress, languageCode } = await getUser(
            user_id,
            ctx
        );

        await ctx.answerCbQuery(`❌ Request canceled`, {
            show_alert: true,
        });

        await ctx.editMessageText(
            text[languageCode].PROFILE(walletAddress, balance),
            {
                reply_markup: {
                    inline_keyboard: inline_keyboard[languageCode].PROFILE,
                },
                parse_mode: "HTML",
            }
        );

        return;
    }

    if (command == "back_profile" || command == "back") {
        const { languageCode } = await getUser(user_id);

        await ctx.editMessageText(text[languageCode].MAIN, {
            reply_markup: {
                inline_keyboard: inline_keyboard[languageCode].MAIN,
            },
            parse_mode: "HTML",
        });

        return;
    }
});

bot.on(message("chat_shared"), async (ctx) => {
    const chat_id = ctx.update.message.chat_shared.chat_id.toString();
    const user_id = ctx.from.id.toString();

    const { status } = await ctx.telegram.getChatMember(chat_id, user_id);

    const user = await getUser(user_id, ctx);

    if (!user) return;

    await ctx.deleteMessage(user.msgId);

    if (status != "creator") {
        await ctx.reply(text[user.languageCode].ONLY_ADMIN, {
            reply_markup: {
                inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]],
            },
        });

        return;
    }

    // Generate invite link and use it to add user account to channel
    const invite_link = await ctx.telegram.exportChatInviteLink(chat_id);

    const msg = await ctx.reply("Processing...");

    const res = await fetch(`${API_URL}/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SECRET_KEY}`,
        },
        body: JSON.stringify({
            channel_link: invite_link,
        }),
    });

    const state = await res.json();

    if (!state.status) {
        await ctx.reply(
            "❌ Something went wrong. Please try later or contact support.",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔙 Back", callback_data: "back" }],
                    ],
                },
            }
        );
        await ctx.telegram.leaveChat(chat_id);

        return;
    }

    await ctx.telegram.leaveChat(chat_id);
    await ctx.telegram.editMessageText(
        ctx.from.id,
        msg.message_id,
        undefined,
        text[user.languageCode].TRANSFERT
    );

    await prisma.process.create({
        data: {
            channel_id: chat_id,
            user_id: user_id,
            message_id: msg.message_id,
        },
    });

    await prisma.user.update({
        where: {
            telegramId: user_id,
        },
        data: {
            msgId: msg.message_id,
        },
    });
});

// bot.launch(() => {
//     console.log("BOT STARTED");
// });

app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
});
