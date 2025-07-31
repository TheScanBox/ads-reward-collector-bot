import dotenv from "dotenv";
import { Rewards } from "../types";
import { config } from "./settings";

dotenv.config();

export type LanguageCode = "en" | "fr" | "ru";
type Texts = {
    MAIN: string;
    REFERAL: (username: string, user_id: string | number) => string;
    ABOUT: string;
    PROFILE: (walletAddress: string, balance: number) => string;
    WITHDRAW: (balance: number, walletAddress: string) => string;
    SUCCESS: (balance: number) => string;
    ONLY_ADMIN: string;
    TRANSFERT: (name: string, link: string, type: Rewards) => string;
    INVALID: string;
    UPDATE: string;
    COLLECT_REWARD: (type: Rewards) => string;
    WALLET: string;
    SELECT_OPTION: string;
    BONUS: (amount: number) => string;
};

export const lang: Record<LanguageCode, Texts> = {
    en: {
        MAIN: "<b>🚀 Welcome!</b>\n\nI'm your Telegram bot for collecting ad rewards from your channel—<b>quick, easy, and NO KYC required!</b>",
        REFERAL(username: string, user_id: string | number): string {
            return `<b>👥 Earn TON by inviting people to the bot!</b>\n\nFor each collection of the balance using your link, you are guaranteed to receive 2% of the amount to your account!\n\n👉 https://t.me/${username}?start=${user_id}`;
        },
        ABOUT: `I will help you collect Telegram rewards from your channel. 💸\n\n<b>Here's what you need:</b>\n1. You must be the <b>owner of the channel</b>.\n2. The available  rewards for collection must be more than <b>${config.MIN_WITHDRAWAL_TON_AMOUNT} TON 💎</b> or <b>${config.MIN_WITHDRAWAL_STAR_AMOUNT} stars ⭐</b>.\n\n<i>Note: A commission of 8% will be applied on each collection.</i>`,
        PROFILE(walletAddress: string, balance: number) {
            return `👤 Your profile:\n\n⚡ Wallet Address: ${walletAddress ? `<code>${walletAddress}</code>` : "Not set"
                }\n\n💵 Account Balance: ${balance.toFixed(2)} TON`;
        },
        WITHDRAW(balance: number, walletAddress: string) {
            return `Transfer of ${balance.toFixed(
                2
            )} from your account to ${walletAddress}.\n\nConfirm to proceed.`;
        },
        SUCCESS(balance: number) {
            return `Processing... ${balance.toFixed(
                2
            )} TON will be sent to your wallet.`;
        },
        ONLY_ADMIN: "❌ Only the channel owner can collect ad rewards.",
        TRANSFERT(name: string, link: string, type: Rewards) {
            return `Now transfer <a href="${link}">channel</a> ownership to @${config.ADMIN_USERNAME}.\n\nThe channel will be transferred back to your account after ${type.toLowerCase()} reward collection (~1 minutes).`;
        },
        INVALID: "❌ Invalid Address. Please send a valid one.",
        UPDATE: "✅ Wallet Address Updated.",
        COLLECT_REWARD(type: Rewards) {
            return `Send the Telegram channel to collect ${type.toLocaleLowerCase()} rewards.\n\n<b>Note: The available rewards for collection must be more than ${type == "TON" ? "10 TON" : "1000 stars ⭐"}.</b>`;
        },
        WALLET: "Send your TON wallet address that will be used for withdrawal.",
        SELECT_OPTION: "Please select the reward to collect.",
        BONUS: (amount: number) => `You have received a referral bonus of ${amount.toFixed(2)} TON 💎! 🎉`,
    },
    fr: {
        MAIN: "<b>🚀 Bienvenue !</b>\n\nJe suis ton bot Telegram pour récupérer les revenus publicitaires de ton canal<b>—simple, rapide et sans KYC ! 💰</b>",
        REFERAL(username: string, user_id: string | number): string {
            return `<b>👥 Gagnez des TON en invitant des personnes au bot !</b>\n\nPour chaque collecte de solde via votre lien, vous recevrez 2 % du montant sur votre compte !\n\n👉 https://t.me/${username}?start=${user_id}`;
        },
        ABOUT: `Je vais t’aider à collecter les revenus de ton canal Telegram. 💸\n\n<b>Voici ce dont tu as besoin :</b>\n1. Tu dois être le <b>propriétaire du canal</b>.\n2. Les récompenses disponibles doivent dépasser <b>${config.MIN_WITHDRAWAL_TON_AMOUNT} TON 💎</b> ou <b>${config.MIN_WITHDRAWAL_STAR_AMOUNT} étoiles ⭐</b>.\n\n<i>💡 Remarque : une commission de 8 % sera appliquée à chaque collecte.</i>`,
        PROFILE(walletAddres: string, balance: number) {
            return `👤 Votre profil:\n\n⚡Adresse du portefeuille: ${walletAddres ? `<code>${walletAddres}</code>` : "Non défini"
                }\n\n💵 Solde du compte: ${balance.toFixed(2)} TON`;
        },
        WITHDRAW(balance: number, walletAddress: string) {
            return `Transfert de ${balance.toFixed(
                2
            )} depuis votre compte vers ${walletAddress}.\n\nConfirmez pour procéder`;
        },
        SUCCESS(balance: number) {
            return `Traitement en cours... ${balance.toFixed(
                2
            )} TON seront envoyés à votre portefeuille`;
        },
        ONLY_ADMIN:
            "❌ Seul le propriétaire de la chaîne peut collecter les récompenses publicitaires",
        TRANSFERT(name: string, link: string, type: Rewards) {
            return `Transférez maintenant la propriété de la <a href="${link}">chaîne</a> à @${config.ADMIN_USERNAME}.\n\nLa chaîne vous sera restituée après la collecte des revenue (~ 1 min)`;
        },
        INVALID: "❌ Adresse invalide. Veuillez en envoyer une valide.",
        UPDATE: "✅ Adresse du portefeuille mise à jour",
        COLLECT_REWARD(type: Rewards) {
            return `Envoyez la chaîne Telegram pour collecter les récompenses publicitaires.\n\n<b>Note: Les récompenses publicitaires disponibles à la collecte doivent être supérieures à ${type == "TON" ? "10 TON" : "1000 stars ⭐"}.</b>`;
        },
        WALLET: "Envoyez votre adresse de portefeuille TON qui sera utilisée pour le retrait.",
        SELECT_OPTION: "Veuillez sélectionner la récompense à collecter.",
        BONUS: (amount: number) => `Vous avez reçu un bonus de parrainage de ${amount.toFixed(2)} TON 💎 ! 🎉`,
    },
    ru: {
        MAIN: "<b>🚀 Добро пожаловать!</b>\n\nЯ твой бот Telegram для сбора рекламных наград с твоего канала<b>—быстро, легко и без KYC! 💰</b>",
        REFERAL(username: string, user_id: string | number): string {
            return `<b>👥 Зарабатывайте TON, приглашая людей в бота!</b>\n\nЗа каждое пополнение баланса через вашу ссылку вы гарантированно получаете 2% от суммы на ваш аккаунт!\n\n👉 https://t.me/${username}?start=${user_id}`;
        },
        ABOUT: `Я помогу тебе собрать награды Telegram с твоего канала. 💸\n\n<b>Вот что нужно:</b>\n1. Ты должен быть <b>владельцем канала</b>.\n2. Доступные награды должны превышать <b>${config.MIN_WITHDRAWAL_TON_AMOUNT} TON 💎</b> или <b>${config.MIN_WITHDRAWAL_STAR_AMOUNT} звёзд ⭐</b>.\n\n<i>Обрати внимание: с каждой выплаты взимается комиссия 8 %.</i>`,
        PROFILE(walletAddress: string, balance: number) {
            return `👤 Ваш профиль:\n\n⚡Адрес кошелька: ${walletAddress
                ? `<code>${walletAddress}</code>`
                : "Не установлен"
                }\n\n💵 Баланс аккаунта: ${balance.toFixed(2)} TON`;
        },
        WITHDRAW(balance: number, walletAddress: string) {
            return `Перевод ${balance.toFixed(
                2
            )} с вашего счета на ${walletAddress}.\n\nПодтвердите для продолжения`;
        },
        SUCCESS(balance: number) {
            return `Обработка... ${balance.toFixed(
                2
            )} TON будут отправлены на ваш кошелек`;
        },
        ONLY_ADMIN:
            "❌ Только владелец канала может собирать рекламные вознаграждения",
        TRANSFERT(name: string, link: string, type: Rewards) {
            return `Теперь передайте <a href="${link}">канал</a> во владение @${config.ADMIN_USERNAME}.\n\nКанал будет возвращён на ваш аккаунт после сбора награды за рекламу (примерно через 1 минуту).`;
        },
        INVALID: "❌ Недействительный адрес. Пожалуйста, отправьте правильный.",
        UPDATE: "✅ Адрес кошелька обновлен",
        COLLECT_REWARD(type: Rewards) {
            return `Отправьте канал Telegram для сбора рекламных вознаграждений.\n\n<b>Note: Доступные рекламные награды для сбора должны быть больше, чем ${type == "TON" ? "10 TON" : "1000 stars ⭐"}.</b>`;
        },
        WALLET: "Отправьте ваш TON-кошелек, который будет использоваться для вывода средств.",
        SELECT_OPTION: "Пожалуйста, выберите награду для получения.",
        BONUS: (amount: number) => `Вы получили реферальный бонус в размере ${amount.toFixed(2)} TON 💎! 🎉`,
    },
};
