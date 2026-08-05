export interface MarketSession {
  id: string;
  city: string;
  country: string;
  flag: string;
  timeZone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

export const markets: MarketSession[] = [
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    timeZone: "Australia/Sydney",
    openHour: 10,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 0,
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    timeZone: "Asia/Tokyo",
    openHour: 9,
    openMinute: 0,
    closeHour: 15,
    closeMinute: 30,
  },
  {
    id: "hong-kong",
    city: "Hong Kong",
    country: "Hong Kong",
    flag: "🇭🇰",
    timeZone: "Asia/Hong_Kong",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    timeZone: "Europe/London",
    openHour: 8,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 30,
  },
  {
    id: "frankfurt",
    city: "Frankfurt",
    country: "Germany",
    flag: "🇩🇪",
    timeZone: "Europe/Berlin",
    openHour: 9,
    openMinute: 0,
    closeHour: 17,
    closeMinute: 30,
  },
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    flag: "🇺🇸",
    timeZone: "America/New_York",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
];