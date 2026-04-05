/** Practical RFC 5322–oriented check for API input (not full RFC parser). */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const s = email.trim();
  return s.length <= 254 && EMAIL_REGEX.test(s);
}

function normalizeEmail(email) {
  return String(email).trim();
}

module.exports = {
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  normalizeEmail,
};
