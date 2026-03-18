/**
 * Formats a stored phone number for use in wa.me/ links.
 *
 * - Strips all non-digit characters (spaces, dashes, parentheses, plus sign)
 * - Removes a leading zero if present (local format → needs country code already prepended)
 *
 * Numbers should already be stored with their country code (e.g. "2348105898930").
 * This function is a safety net to clean up any formatting issues.
 */
export function formatWhatsAppNumber(phone: string): string {
  // Strip everything except digits
  let cleaned = phone.replace(/\D/g, "");

  // If still starts with 0, it's likely a legacy local number.
  // We can't assume a country code here since the app is global,
  // but we strip the leading 0 for best-effort compatibility.
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}
