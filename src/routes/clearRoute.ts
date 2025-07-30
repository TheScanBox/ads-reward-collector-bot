import express from "express";
import { config } from "../config/settings";
import prisma from "../config/prisma";
import { leaveChannel } from "../lib/api";
import { bot } from "..";

const router = express.Router();

router.get("/", async (req, res) => {
    const twoHoursAgo = new Date();
    twoHoursAgo.setMinutes(twoHoursAgo.getMinutes() - config.INTERVAL);

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
                const res = await leaveChannel(process.channel_id!);

                if (!res.status) continue;

                await prisma.process.delete({
                    where: {
                        id: process.id,
                    },
                });

                await bot.telegram.editMessageText(
                    process.user_id,
                    process.message_id ?? undefined,
                    undefined,
                    "❌ Process was canceled..."
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

export default router;