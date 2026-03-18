export type CountryCode = {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
};

export const COUNTRY_CODES: CountryCode[] = [
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "Ghana", dial_code: "+233", code: "GH", flag: "🇬🇭" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "UAE", dial_code: "+971", code: "AE", flag: "🇦🇪" },
  { name: "Saudi Arabia", dial_code: "+966", code: "SA", flag: "🇸🇦" },
  { name: "Egypt", dial_code: "+20", code: "EG", flag: "🇪🇬" },
  { name: "Tanzania", dial_code: "+255", code: "TZ", flag: "🇹🇿" },
  { name: "Uganda", dial_code: "+256", code: "UG", flag: "🇺🇬" },
  { name: "Cameroon", dial_code: "+237", code: "CM", flag: "🇨🇲" },
  { name: "Senegal", dial_code: "+221", code: "SN", flag: "🇸🇳" },
  { name: "Rwanda", dial_code: "+250", code: "RW", flag: "🇷🇼" },
  { name: "Ethiopia", dial_code: "+251", code: "ET", flag: "🇪🇹" },
  { name: "Pakistan", dial_code: "+92", code: "PK", flag: "🇵🇰" },
  { name: "Bangladesh", dial_code: "+880", code: "BD", flag: "🇧🇩" },
  { name: "Philippines", dial_code: "+63", code: "PH", flag: "🇵🇭" },
  { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
  { name: "Colombia", dial_code: "+57", code: "CO", flag: "🇨🇴" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "Netherlands", dial_code: "+31", code: "NL", flag: "🇳🇱" },
  { name: "Turkey", dial_code: "+90", code: "TR", flag: "🇹🇷" },
  { name: "Indonesia", dial_code: "+62", code: "ID", flag: "🇮🇩" },
  { name: "Malaysia", dial_code: "+60", code: "MY", flag: "🇲🇾" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "South Korea", dial_code: "+82", code: "KR", flag: "🇰🇷" },
  { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
];

/** Find the default country code (Nigeria) */
export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0]; // Nigeria
