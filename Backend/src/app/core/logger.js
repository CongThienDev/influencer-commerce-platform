export function logInfo(event, payload = {}) {
  console.info(
    JSON.stringify({
      level: 'info',
      event,
      timestamp: new Date().toISOString(),
      ...payload
    })
  );
}

export function logError(event, payload = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      event,
      timestamp: new Date().toISOString(),
      ...payload
    })
  );
}

export function createRequestLogger() {
  return (req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      logInfo('http.request', {
        method: req.method,
        path: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: Date.now() - startedAt
      });
    });
    next();
  };
}
