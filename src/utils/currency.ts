export const formatCurrency = (value : Number) => {
  if (!value) return "₹0";

  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
};
