import { Context } from "telegraf";

import { LanguageCode, lang } from "../config/lang";
import { inline_keyboard } from "../config/keyboard";
import { getUser } from "../utils"

const startCommand = async (ctx: Context) => {
    const user_id = ctx.from?.id.toString();

    if (!user_id) {
        await ctx.reply("❌ User ID not found.");
        return;
    }

    const { languageCode } = await getUser(user_id, ctx);

    await ctx.reply(lang[languageCode as LanguageCode].MAIN, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: inline_keyboard[languageCode as LanguageCode].MAIN,
        },
    });
}

export default startCommand;