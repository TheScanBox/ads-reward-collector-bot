import dotenv from "dotenv";

dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

export const text = {
    en: {
        MAIN: "<b>🚀 Welcome!</b>\n\nI'm your Telegram bot for collecting ad rewards from your channel—<b>quick, easy, and NO KYC required!</b>",
        REFERAL(username, user_id) {
            return `<b>👥 Earn TON by inviting people to the bot!</b>\n\nFor each collection of the balance using your link, you are guaranteed to receive 2% of the amount to your account!\n\n👉 https://t.me/${username}?start=${user_id}`;
        },
        ABOUT: "I will help you collect Telegram ad rewards from your channel. 💸\n\n<b>Here's what you need:</b>\n1. You must be the <b>owner of the channel</b>.\n2. The available ad rewards for collection must be more than <b>10 TON</b>.\n\n<i>Note: A small commission of 8% will be applied on each collection.</i>",
        PROFILE(walletAddress, balance) {
            return `👤 Your profile:\n\n⚡ Wallet Address: ${
                walletAddress ? `<code>${walletAddress}</code>` : "Not set"
            }\n\n💵 Account Balance: ${balance.toFixed(2)} TON`;
        },
        WITHDRAW(balance, walletAddress) {
            return `Transfer of ${balance.toFixed(
                2
            )} from your account to ${walletAddress}.\n\nConfirm to proceed.`;
        },
        SUCCESS(balance) {
            return `Processing... ${balance.toFixed(
                2
            )} TON will be sent to your wallet.`;
        },
        ONLY_ADMIN: "❌ Only the channel owner can collect ad rewards.",
        TRANSFERT(name, link) {
            return `Now transfer <a href="${link}">channel</a> ownership to @${ADMIN_USERNAME}.\n\nThe channel will be transferred back to your account after ads reward collection (~1 minutes).`;
        },
        INVALID: "❌ Invalid Address. Please send a valid one.",
        UPDATE: "✅ Wallet Address Updated.",
        COLLECT_REWARD:
            "Send the Telegram channel to collect ad rewards.\n\n<b>Note: The available ad rewards for collection must be more than 10 TON</b>.",
        WALLET: "Send your TON wallet address that will be used for withdrawal.",
    },
    fr: {
        MAIN: "<b>🚀 Bienvenue !</b>\n\nJe suis ton bot Telegram pour récupérer les revenus publicitaires de ton canal<b>—simple, rapide et sans KYC ! 💰</b>",
        REFERAL(username, user_id) {
            return `<b>👥 Gagnez des TON en invitant des personnes au bot !</b>\n\nPour chaque collecte de solde via votre lien, vous recevrez 2 % du montant sur votre compte !\n\n👉 https://t.me/${username}?start=${user_id}`;
        },
        ABOUT: "Je vais t'aider à collecter les revenus publicitaires Telegram de ton canal. 💸\n\n<b>Voici ce dont tu as besoin :</b>\n1. Tu dois être le <b>propriétaire du canal</b>.\n2. Les récompenses publicitaires disponibles à la collecte doivent être supérieures à <b>10 TON</b>.\n\n<i>Note : Une commission de 8 % sera appliquée à chaque collecte.</i>",
        PROFILE(walletAddress, balance) {
            return `👤 Votre profil:\n\n⚡Adresse du portefeuille: ${
                walletAddress ? `<code>${walletAddress}</code>` : "Non défini"
            }\n\n💵 Solde du compte: ${balance.toFixed(2)} TON`;
        },
        WITHDRAW(balance, walletAddress) {
            return `Transfert de ${balance.toFixed(
                2
            )} depuis votre compte vers ${walletAddress}.\n\nConfirmez pour procéder`;
        },
        SUCCESS(balance) {
            return `Traitement en cours... ${balance.toFixed(
                2
            )} TON seront envoyés à votre portefeuille`;
        },
        ONLY_ADMIN:
            "❌ Seul le propriétaire de la chaîne peut collecter les récompenses publicitaires",
        TRANSFERT(name, link) {
            return `Transférez maintenant la propriété de la <a href="${link}">chaîne</a> à @${ADMIN_USERNAME}.\n\nLa chaîne vous sera restituée après la collecte des revenue (~ 1 min)`;
        },
        INVALID: "❌ Adresse invalide. Veuillez en envoyer une valide.",
        UPDATE: "✅ Adresse du portefeuille mise à jour",
        COLLECT_REWARD:
            "Envoyez la chaîne Telegram pour collecter les récompenses publicitaires.\n\n<b>Note: Les récompenses publicitaires disponibles à la collecte doivent être supérieures à 10 TON.</b>",
        WALLET: "Envoyez votre adresse de portefeuille TON qui sera utilisée pour le retrait.",
    },
    ru: {
        MAIN: "<b>🚀 Добро пожаловать!</b>\n\nЯ твой бот Telegram для сбора рекламных наград с твоего канала<b>—быстро, легко и без KYC! 💰</b>",
        REFERAL(username, user_id) {
            return `<b>👥 Зарабатывайте TON, приглашая людей в бота!</b>\n\nЗа каждое пополнение баланса через вашу ссылку вы гарантированно получаете 2% от суммы на ваш аккаунт!\n\n👉 https://t.me/${username}?start=${user_id}`;
        },
        ABOUT: "Я помогу тебе собрать рекламные награды Telegram с твоего канала. 💸\n\n<b>Вот что нужно:</b>\n1. Ты должен быть <b>владельцем канала</b>.\n2. Доступные рекламные награды для сбора должны быть больше, чем <b>10 TON</b>.\n\n<i>Обратите внимание: на каждое снятие применяется комиссия в размере 8 %.</i>",
        PROFILE(walletAddress, balance) {
            return `👤 Ваш профиль:\n\n⚡Адрес кошелька: ${
                walletAddress
                    ? `<code>${walletAddress}</code>`
                    : "Не установлен"
            }\n\n💵 Баланс аккаунта: ${balance.toFixed(2)} TON`;
        },
        WITHDRAW(balance, walletAddress) {
            return `Перевод ${balance.toFixed(
                2
            )} с вашего счета на ${walletAddress}.\n\nПодтвердите для продолжения`;
        },
        SUCCESS(balance) {
            return `Обработка... ${balance.toFixed(
                2
            )} TON будут отправлены на ваш кошелек`;
        },
        ONLY_ADMIN:
            "❌ Только владелец канала может собирать рекламные вознаграждения",
        TRANSFERT(name, link) {
            return `Теперь передайте <a href="${link}">канал</a> во владение @${ADMIN_USERNAME}.\n\nКанал будет возвращён на ваш аккаунт после сбора награды за рекламу (примерно через 1 минуту).`;
        },
        INVALID: "❌ Недействительный адрес. Пожалуйста, отправьте правильный.",
        UPDATE: "✅ Адрес кошелька обновлен",
        COLLECT_REWARD:
            "Отправьте канал Telegram для сбора рекламных вознаграждений.\n\n<b>Note: Доступные рекламные награды для сбора должны быть больше, чем 10 TON.</b>",
        WALLET: "Отправьте ваш TON-кошелек, который будет использоваться для вывода средств.",
    },
};
