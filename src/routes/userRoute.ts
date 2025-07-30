import express from "express";
import { getUser } from "../utils"

const router = express.Router();

router.get("/", async (req, res) => {
    const user_id = req.query.user_id as string;

    try {
        const user = await getUser(user_id);

        return res.json({ ...user });
    } catch (error) {
        console.log(error);

        res.status(503).json({ error: error });
    }
});

export default router;