import express from "express";
import prisma from "../config/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
    const { user_id, channel_id } = req.query;

    try {
        await prisma.process.deleteMany({
            where: {
                channel_id: channel_id as string,
                user_id: user_id as string,
            },
        });

        res.json({ status: "deleted" });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

export default router;