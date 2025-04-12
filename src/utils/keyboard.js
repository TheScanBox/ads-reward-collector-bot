// import dotenv from "dotenv";

// dotenv.config();

// const SUPPORT_USERNAME = process.env.SUPPORT_USERNAME;
const SUPPORT_USERNAME = "Mark_Twainx";

export const inline_keyboard = {
    en: {
        MAIN: [
            [
                {
                    text: "⭐ Collect Ads Rewards",
                    callback_data: "collect_reward",
                },
            ],
            [
                { text: "👤 Profile", callback_data: "profile" },
                {
                    text: "👥 Referrals",
                    callback_data: "referrals",
                },
            ],
            [
                { text: "🌐 About", callback_data: "about" },
                { text: "👨‍💻 Support", url: `https://t.me/${SUPPORT_USERNAME}` },
            ],
        ],
        PROFILE: [
            [
                { text: "➖ Withdraw", callback_data: "withdraw" },
                { text: "🎯 Change Wallet", callback_data: "wallet" },
            ],
            [
                {
                    text: "🇺🇸 Language",
                    callback_data: "change_language",
                },
            ],
            [{ text: "🔙 Back", callback_data: "back_profile" }],
        ],
        CONFIRM: [
            [
                {
                    text: "✅ Confirm",
                    callback_data: "withdraw_confirm",
                },
                {
                    text: "❌ Cancel",
                    callback_data: "withdraw_cancel",
                },
            ],
            [{ text: "🔙 Back", callback_data: "profile" }],
        ],
    },
    fr: {
        MAIN: [
            [
                {
                    text: "⭐ Collecte les Revenus",
                    callback_data: "collect_reward",
                },
            ],
            [
                { text: "👤 Profil", callback_data: "profile" },
                {
                    text: "👥 Parrainages",
                    callback_data: "referrals",
                },
            ],
            [
                { text: "🌐 À propos", callback_data: "about" },
                { text: "👨‍💻 Support", url: `https://t.me/${SUPPORT_USERNAME}` },
            ],
        ],
        PROFILE: [
            [
                { text: "➖ Retirer", callback_data: "withdraw" },
                {
                    text: "🎯 Changer de Portefeuille",
                    callback_data: "wallet",
                },
            ],
            [
                {
                    text: "🇫🇷 Langue",
                    callback_data: "change_language",
                },
            ],
            [{ text: "🔙 Retour", callback_data: "back_profile" }],
        ],
        CONFIRM: [
            [
                {
                    text: "✅ Confirmer",
                    callback_data: "withdraw_confirm",
                },
                {
                    text: "❌ Annuler",
                    callback_data: "withdraw_cancel",
                },
            ],
            [{ text: "🔙 Retour", callback_data: "profile" }],
        ],
    },
    ru: {
        MAIN: [
            [
                {
                    text: "⭐ Собрать награды",
                    callback_data: "collect_reward",
                },
            ],
            [
                { text: "👤 Профиль", callback_data: "profile" },
                {
                    text: "👥 Рефералы",
                    callback_data: "referrals",
                },
            ],
            [
                { text: "🌐 О нас", callback_data: "about" },
                {
                    text: "👨‍💻 Поддержка",
                    url: `https://t.me/${SUPPORT_USERNAME}`,
                },
            ],
        ],
        PROFILE: [
            [
                { text: "➖ Вывести", callback_data: "withdraw" },
                { text: "🎯 Изменить кошелек", callback_data: "wallet" },
            ],
            [
                {
                    text: "🇷🇺 Язык",
                    callback_data: "change_language",
                },
            ],
            [{ text: "🔙 Назад", callback_data: "back_profile" }],
        ],
        CONFIRM: [
            [
                {
                    text: "✅ Подтвердить",
                    callback_data: "withdraw_confirm",
                },
                {
                    text: "❌ Отмена",
                    callback_data: "withdraw_cancel",
                },
            ],
            [{ text: "🔙 Назад", callback_data: "profile" }],
        ],
    },
};
