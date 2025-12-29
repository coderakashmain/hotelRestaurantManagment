export function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
    "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const makeTwoDigits = (n: number) => {
    if (n < 20) return a[n];
    return `${b[Math.floor(n / 10)]}${n % 10 ? " " + a[n % 10] : ""}`;
  };

  const makeThreeDigits = (n: number) => {
    let word = "";
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    if (hundred > 0) word += a[hundred] + " Hundred";
    if (rest > 0) word += (word ? " " : "") + makeTwoDigits(rest);

    return word;
  };

  let word = "Rupees ";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  if (crore > 0) word += makeTwoDigits(crore) + " Crore ";
  if (lakh > 0) word += makeTwoDigits(lakh) + " Lakh ";
  if (thousand > 0) word += makeTwoDigits(thousand) + " Thousand ";
  if (hundred > 0) word += makeThreeDigits(hundred);

  return word.trim() + " Only.";
}

