import express from "express";
import prisma from "../config/prisma";
import { config } from "../config/settings";

import { bot } from "..";
import { calculateReward, getUser, generateID } from "../utils";
import { lang, LanguageCode } from "../config/lang";


const router = express.Router();

router.post("/", async (req, res) => {
    const { amount, user_id, type } = req.body;

    try {
        const { mainUser, company, referrer } = calculateReward(parseFloat(amount));
        const { inviterId } = await getUser(user_id.toString());

        if (inviterId) {
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

        await prisma.user.update({
            where: {
                telegramId: user_id.toString(),
            },
            data: {
                balance: {
                    increment: mainUser,
                },
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

        await prisma.transaction.createMany({
            data: [
                {
                    id: generateID(8),
                    amount: mainUser,
                    userId: user_id.toString(),
                    status: "completed",
                    type: "deposit",
                },
                {
                    id: generateID(8),
                    amount: inviterId ? company : company + referrer,
                    userId: config.ADMIN_ID?.toString() || "",
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

export default router;  