import axios from "axios";
import { JoinChannelResponse, LeaveChannelResponse } from "../types";

const SECRET_KEY = process.env.SECRET_KEY;
const API_URL = process.env.CLIENT_API_URL;

if (!SECRET_KEY || !API_URL) {
    throw new Error("Missing required environment variables: SECRET_KEY or CLIENT_API_URL");
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET_KEY}`
    }
});



export const joinChannel = async (channel_link: string, channel_id: string): Promise<JoinChannelResponse> => {
    try {
        const response = await api.post("/join", { channel_link, channel_id });
        return response.data;
    } catch (error) {
        console.error("Error joining channel:", error);
        throw new Error("Failed to join channel");
    }
}

export const leaveChannel = async (channel_id: string | number): Promise<LeaveChannelResponse> => {
    try {
        const response = await api.post("/leave", { channel_id });
        return response.data;
    } catch (error) {
        console.error("Error leaving channel:", error);
        throw new Error("Failed to leave channel");
    }
}