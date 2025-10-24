export const formatCurrency = (value: number | undefined | null, locale: string = 'en-US', currency: string = 'USD'): string => {
  if (value == null) {
    return '0.00';
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return value.toFixed(2); // Fallback
  }
};