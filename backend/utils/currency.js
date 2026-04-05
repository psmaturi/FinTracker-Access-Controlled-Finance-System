/**
 * Indian Rupee formatting for API responses (en-IN grouping: lakhs/crores style).
 * Amounts remain plain numbers in the database; only serialized responses use ₹ strings.
 */
function formatINR(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "₹0";
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `₹${formatted}`;
}

module.exports = { formatINR };
