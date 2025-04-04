import crypto from "crypto";

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
