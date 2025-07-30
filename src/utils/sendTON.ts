import {
    WalletContractV5R1,
    TonClient,
    fromNano,
    toNano,
    internal,
    SendMode,
    beginCell,
} from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";
import { config } from "../config/settings";

dotenv.config();

const transfertTON = async (recipientAddress: string, amount: string, comment: string) => {
    try {

        if (!config.MNEMONIC) {
            throw ("MNEMONIC not found")
        }

        const client = new TonClient({
            endpoint: "https://toncenter.com/api/v2/jsonRPC",
            apiKey: config.API_KEY,
        });

        const mnemonic = config.MNEMONIC.split(" ");
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

        const body = beginCell().storeUint(0, 32).storeStringTail(`Rewards Collector\n\n${comment}`).endCell();

        const transfer = walletContract.createTransfer({
            seqno: await walletContract.getSeqno(),
            secretKey: keyPair.secretKey,
            messages: [
                internal({
                    to: recipientAddress,
                    value: toNano(amount),
                    bounce: false, // Set to true for contracts, false for normal wallets
                    body
                }),
            ],
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        });

        await client.sendExternalMessage(wallet, transfer);
        return true;

        // console.log(`✅ Sent ${amount} TON to ${recipientAddress}`);
    } catch (error) {
        console.log(error);
        return false;
    }
};

export default transfertTON;