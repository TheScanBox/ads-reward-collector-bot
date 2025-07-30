import { getUser, isValidAddress } from "../utils";
import { lang, LanguageCode } from "../config/lang";
import prisma from "../config/prisma";

const textCommand = async (ctx: any) => {
    const user_text = ctx.message.text;
    const user_id = ctx.from.id.toString();

    const { action, msgId, languageCode } = await getUser(user_id, ctx);

    if (action == "change_wallet") {
        if (msgId) {
            await ctx.deleteMessage(msgId);
        }
        await ctx.deleteMessage();

        if (!isValidAddress(user_text)) {
            await ctx.reply(lang[languageCode as LanguageCode].INVALID);
            await prisma.user.update({
                where: {
                    telegramId: user_id,
                },
                data: {
                    msgId: null,
                    action: "",
                },
            });

            return;
        }

        await prisma.user.update({
            where: {
                telegramId: user_id,
            },
            data: {
                walletAddress: user_text,
                msgId: null,
                action: "",
            },
        });

        await ctx.reply(lang[languageCode as LanguageCode].UPDATE);
    }
}

export default textCommand;