const attempts = {};

const MAX_ATTEMPTS = 7;
const WINDOW_MS = 10 * 60 * 1000; // 10 минут

function isBlocked(ip) {
  const record = attempts[ip];
  if (!record) return false;

  const now = Date.now();

  // Сброс попыток по таймауту
  if (now - record.firstAttempt > WINDOW_MS) {
    delete attempts[ip];
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function registerAttempt(ip) {
  const now = Date.now();
  if (!attempts[ip]) {
    attempts[ip] = { count: 1, firstAttempt: now };
  } else {
    attempts[ip].count += 1;
  }
}

function resetAttempts(ip) {
  delete attempts[ip];
}

export { isBlocked, registerAttempt, resetAttempts };
