export const AUTH_COOKIE = "pm_session";

export function isValidSession(cookieValue) {
  return cookieValue === process.env.TEAM_PASSWORD;
}
