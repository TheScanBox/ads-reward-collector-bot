import { NextFunction, Request, Response } from "express";
import { config } from "../config/settings";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token !== config.SECRET_KEY) {
        return res.status(403).json({ message: "Forbidden" });
    }

    next();
};