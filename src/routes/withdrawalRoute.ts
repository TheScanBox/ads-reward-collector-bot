import express from "express";
import prisma from "../config/prisma";
import { config } from "../config/settings";

import { bot } from "..";
import { calculateReward, getUser, generateID } from "../utils";
import { lang, LanguageCode } from "../config/lang";

const router = express.Router();

router.post("/", async (req, res) => {
    const { amount, user_id, type } = req.body;
    let isRefferalValid = false;

    try {
        const { mainUser, company, referrer } = calculateReward(parseFloat(amount));
        const { inviterId } = await getUser(user_id.toString());

        if (inviterId) {
            try {
                const user = await prisma.user.findFirst({
                    where: {
                        telegramId: inviterId.toString(),
                    },
                })

                if (user) {
                    isRefferalValid = true;

                    const inviter = await prisma.user.update({
                        where: {
                            telegramId: inviterId.toString(),
                        },
                        data: {
                            balance: {
                                increment: referrer,
                            },
                        },
                        select: {
                            telegramId: true,
                            languageCode: true,
                        }
                    });

                    await bot.telegram.sendMessage(
                        inviterId.toString(),
                        lang[inviter.languageCode as LanguageCode].BONUS(referrer),
                        {
                            parse_mode: "HTML",
                        }
                    );
                }
            } catch (error) {
                console.error(`Error updating inviter balance for user ${inviterId}:`, error);
            }
        }

        if (company > 0) {
            await bot.telegram.sendMessage(
                config.PAYMENT_CHANNEL_ID,
                `🚀 A new <b>${type?.toLowerCase()}</b> withdrawal request has been made by <b>${user_id}</b> for <b>${amount}</b> TON 💎.\n\n${isRefferalValid ? company : (company + referrer).toFixed(2)} TON 💎 will be added to the admin balance.`,
                {
                    parse_mode: "HTML",
                }
            );
        }

        await prisma.user.update({
            where: {
                telegramId: user_id.toString(),
            },
            data: {
                balance: {
                    increment: mainUser,
                }
            },
        });

        await prisma.user.update({
            where: {
                telegramId: config.ADMIN_ID?.toString(),
            },
            data: {
                balance: {
                    increment: inviterId ? company : company + referrer,
                },
            },
        });

        const transactions = [
            {
                id: generateID(8),
                amount: mainUser,
                userId: user_id.toString(),
                status: "completed",
                type: "deposit",
            },
            {
                id: generateID(8),
                amount: isRefferalValid ? company : company + referrer,
                userId: config.ADMIN_ID?.toString() || "",
                status: "completed",
                type: "deposit",
            },
        ]

        if (isRefferalValid) {
            transactions.push({
                id: generateID(8),
                amount: referrer,
                userId: inviterId?.toString(),
                status: "completed",
                type: "deposit",
            });
        }

        await prisma.transaction.createMany({
            data: transactions,
        });

        res.json({ status: "done" });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

export default router;  