export const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(amount));
};