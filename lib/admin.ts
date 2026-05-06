/**
 * Hard-coded admin role check.
 */

const ADMIN_EMAILS = ["camdencroy4@gmail.com"];

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
