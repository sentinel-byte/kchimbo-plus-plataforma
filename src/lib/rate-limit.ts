interface RateLimitRecord {
  count: number;
  resetTime: number;
  lockedUntil: number | null;
}

const tracker = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  lockoutMs: number;
}

interface RateLimitResult {
  limited: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { limit: 5, windowMs: 60 * 1000, lockoutMs: 10 * 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const record = tracker.get(key);

  if (!record) {
    tracker.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      lockedUntil: null,
    });
    return { limited: false, remainingSeconds: 0, attemptsLeft: config.limit - 1 };
  }

  // Si está bloqueado, verificar si el bloqueo ha expirado
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remaining = Math.ceil((record.lockedUntil - now) / 1000);
      return { limited: true, remainingSeconds: remaining, attemptsLeft: 0 };
    } else {
      // Bloqueo expirado, reiniciar
      tracker.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        lockedUntil: null,
      });
      return { limited: false, remainingSeconds: 0, attemptsLeft: config.limit - 1 };
    }
  }

  // Si la ventana ha expirado, reiniciar
  if (now > record.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      lockedUntil: null,
    });
    return { limited: false, remainingSeconds: 0, attemptsLeft: config.limit - 1 };
  }

  // Incrementar contador
  record.count += 1;

  // Si alcanzó el límite, bloquear
  if (record.count > config.limit) {
    record.lockedUntil = now + config.lockoutMs;
    tracker.set(key, record);
    const remaining = Math.ceil(config.lockoutMs / 1000);
    return { limited: true, remainingSeconds: remaining, attemptsLeft: 0 };
  }

  tracker.set(key, record);
  return { limited: false, remainingSeconds: 0, attemptsLeft: config.limit - record.count };
}

// Mantener compatibilidad con la función anterior
export function isRateLimited(
  ip: string,
  config: { limit: number; windowMs: number } = { limit: 5, windowMs: 60 * 1000 }
): boolean {
  const result = checkRateLimit(ip, { ...config, lockoutMs: 10 * 60 * 1000 });
  return result.limited;
}
