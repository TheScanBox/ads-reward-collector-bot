import { Address } from "ton";

export const isValidAddress = (address) => {
    try {
        Address.parse(address);
        return true;
    } catch (error) {
        return false; // Invalid address
    }
};
