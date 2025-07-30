import express from "express";
import prisma from "../config/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
    const { channel_id } = req.query;

    try {
        const process = await prisma.process.findFirst({
            where: {
                channel_id: channel_id as string,
            },
            select: {
                user_id: true,
                type: true,
                channel_id: true,
                message_id: true,
                user: {
                    select: {
                        telegramId: true,
                        languageCode: true,
                    }
                }
            },
        });

        if (!process) return res.json({ status: "failed" });

        return res.json({
            ...process,
            status: "ok",
        });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error, status: "failed" });
    }
});

export default router;