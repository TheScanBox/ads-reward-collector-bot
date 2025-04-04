import {
    WalletContractV5R1,
    TonClient,
    fromNano,
    toNano,
    internal,
} from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";

dotenv.config();

const MNEMONIC = process.env.MNEMONIC;
const API_KEY = process.env.API_KEY;

export const transfertTON = async (recipientAddress, amount) => {
    try {
        const client = new TonClient({
            endpoint: "https://toncenter.com/api/v2/jsonRPC",
            apiKey: API_KEY,
        });

        const mnemonic = MNEMONIC.split(" ");
        const keyPair = await mnemonicToWalletKey(mnemonic);

        const wallet = WalletContractV5R1.create({
            workchain: 0, // Use 0 for the masterchain
            publicKey: keyPair.publicKey,
        });
        const walletContract = client.open(wallet);

        const balance = await walletContract.getBalance();

        if (balance < toNano("0.1")) {
            console.error("Not enough balance to send!");

            return false;
        }

        const transfer = walletContract.createTransfer({
            seqno: await walletContract.getSeqno(),
            secretKey: keyPair.secretKey,
            messages: [
                internal({
                    to: recipientAddress,
                    value: toNano(amount),
                    bounce: false, // Set to true for contracts, false for normal wallets
                }),
            ],
        });

        await client.sendExternalMessage(wallet, transfer);
        return true;

        // console.log(`✅ Sent ${amount} TON to ${recipientAddress}`);
    } catch (error) {
        console.log(error);
        return false;
    }
};
