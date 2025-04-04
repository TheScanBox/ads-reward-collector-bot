import { prisma } from "../config/prisma.js";

export const getUser = async (user_id, ctx) => {
    let user = await prisma.user.findFirst({
        where: {
            telegramId: user_id,
        },
    });

    if (!user) {
        const {
            first_name,
            last_name,
            id,
            username,
            is_premium,
            language_code,
        } = ctx.from;

        user = await prisma.user.create({
            data: {
                firstName: first_name,
                telegramId: user_id,
                isPremium: is_premium,
                languageCode: language_code,
                lastName: last_name,
                username: username,
                inviterId: ctx.payload || null,
            },
        });
    }

    return user;
};
