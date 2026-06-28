/**
 * Calculates the savings between original_price (MRP) and price (selling price).
 * Returns an object with hasDiscount, savings, and the validated prices.
 *
 * Edge cases handled:
 *   - original_price is null or undefined
 *   - original_price <= price (no discount)
 *   - Negative savings (never shown)
 */
export const getPriceDetails = (price, originalPrice) => {
  const sellingPrice = Number(price) || 0;
  const mrp = Number(originalPrice) || 0;

  const savings = mrp - sellingPrice;
  const hasDiscount = mrp > 0 && savings > 0;

  return {
    sellingPrice,
    mrp,
    savings: hasDiscount ? savings : 0,
    hasDiscount,
  };
};
