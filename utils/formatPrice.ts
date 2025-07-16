export default function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return `EGP ${formatted}`;
}
