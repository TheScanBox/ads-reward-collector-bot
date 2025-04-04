export const calculateReward = (totalAmount) => {
    if (totalAmount <= 0) {
        throw new Error("Total amount must be greater than zero");
    }

    const mainUserReward = (totalAmount * 0.92).toFixed(2);
    const companyShare = (totalAmount * 0.06).toFixed(2);
    const referrerShare = (totalAmount * 0.02).toFixed(2);

    return {
        mainUser: parseFloat(mainUserReward),
        company: parseFloat(companyShare),
        referrer: parseFloat(referrerShare),
    };
};
