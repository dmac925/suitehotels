// Helper function to get price range for non-authenticated users
export function getPriceRange(price: string | number): string {
  // Extract numeric value from price string
  let numericPrice = 0;
  if (typeof price === 'number') {
    numericPrice = price;
  } else if (typeof price === 'string') {
    // Remove currency symbols and parse
    const cleaned = price.replace(/[£$,]/g, '');
    numericPrice = parseInt(cleaned) || 0;
  }
  
  if (numericPrice === 0) {
    return 'Price on application';
  }
  
  // Define price ranges
  if (numericPrice < 750000) {
    return '£500k - £750k';
  } else if (numericPrice < 1000000) {
    return '£750k - £1m';
  } else if (numericPrice < 1500000) {
    return '£1m - £1.5m';
  } else if (numericPrice < 2000000) {
    return '£1.5m - £2m';
  } else if (numericPrice < 3000000) {
    return '£2m - £3m';
  } else if (numericPrice < 5000000) {
    return '£3m - £5m';
  } else if (numericPrice < 7500000) {
    return '£5m - £7.5m';
  } else if (numericPrice < 10000000) {
    return '£7.5m - £10m';
  } else if (numericPrice < 15000000) {
    return '£10m - £15m';
  } else if (numericPrice < 20000000) {
    return '£15m - £20m';
  } else if (numericPrice < 30000000) {
    return '£20m - £30m';
  } else if (numericPrice < 50000000) {
    return '£30m - £50m';
  } else if (numericPrice < 75000000) {
    return '£50m - £75m';
  } else if (numericPrice < 100000000) {
    return '£75m - £100m';
  } else {
    return '£100m+';
  }
}