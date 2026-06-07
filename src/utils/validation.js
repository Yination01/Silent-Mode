export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password) {
  return password && password.length >= 6;
}

export function sanitizeText(text) {
  if (!text) return '';
  const sanitized = text.trim().replace(/[<>]/g, '');
  if (sanitized.length <= 1000) return sanitized;
  return [...sanitized].slice(0, 1000).join('');
}

export function isValidPhoneNumber(phone) {
  const phoneRegex = /^\+?[\d\s-()]{7,15}$/;
  return phoneRegex.test(phone);
}

export function validateDraftReply(reply) {
  return reply && reply.length > 0 && reply.length < 500;
}