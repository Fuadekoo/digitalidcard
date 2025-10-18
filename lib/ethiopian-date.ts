/**
 * Ethiopian Calendar Converter
 * Converts Gregorian dates to Ethiopian calendar dates
 */

interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

const ETHIOPIAN_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

/**
 * Convert Gregorian date to Ethiopian date
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const day = date.getDate();

  // Ethiopian calendar starts on September 11 (or 12 in leap years)
  const jdn = toJulianDay(year, month, day);

  // Calculate Ethiopian date from Julian Day Number
  const ethYear = Math.floor((jdn - 1723856) / 365.25);
  const ethMonthStart = 1723856 + Math.floor(ethYear * 365.25);
  const daysIntoYear = jdn - ethMonthStart;

  let ethMonth = Math.floor(daysIntoYear / 30) + 1;
  let ethDay = (daysIntoYear % 30) + 1;

  // Adjust for Ethiopian calendar rules
  if (ethMonth > 13) {
    ethMonth = 1;
  }
  if (ethDay > 30 && ethMonth <= 12) {
    ethDay = 30;
  }
  if (ethMonth === 13 && ethDay > 5) {
    ethDay = 5;
  }

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
  };
}

/**
 * Convert date to Julian Day Number
 */
function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Format Ethiopian date as dd/mm/yyyy
 */
export function formatEthiopianDate(date: Date): string {
  const ethDate = gregorianToEthiopian(date);
  const day = ethDate.day.toString().padStart(2, "0");
  const month = ethDate.month.toString().padStart(2, "0");
  const year = ethDate.year.toString();

  return `${day}/${month}/${year}`;
}

/**
 * Format Ethiopian date with month name (e.g., "15 Meskerem 2016")
 */
export function formatEthiopianDateWithMonthName(
  date: Date,
  locale: "en" | "am" = "en"
): string {
  const ethDate = gregorianToEthiopian(date);
  const monthName = ETHIOPIAN_MONTHS[ethDate.month - 1] || "Meskerem";

  if (locale === "am") {
    // Return Amharic format if needed
    return `${ethDate.day} ${monthName} ${ethDate.year}`;
  }

  return `${ethDate.day} ${monthName} ${ethDate.year}`;
}

/**
 * Get Ethiopian month name
 */
export function getEthiopianMonthName(monthNumber: number): string {
  return ETHIOPIAN_MONTHS[monthNumber - 1] || "Meskerem";
}

/**
 * Convert Ethiopian date back to Gregorian (approximate)
 */
export function ethiopianToGregorian(
  ethYear: number,
  ethMonth: number,
  ethDay: number
): Date {
  // Ethiopian New Year starts on September 11 (or 12 in Gregorian leap years)
  const gregYear = ethYear + 7; // Ethiopian calendar is ~7-8 years behind

  // Calculate days from start of Ethiopian year
  const daysFromStart = (ethMonth - 1) * 30 + ethDay - 1;

  // Start date is September 11 of Gregorian year
  const startDate = new Date(gregYear, 8, 11); // Month 8 = September

  // Add days
  const resultDate = new Date(startDate);
  resultDate.setDate(startDate.getDate() + daysFromStart);

  return resultDate;
}
