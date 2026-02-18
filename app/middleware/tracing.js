const { v4: uuidv4 } = require('uuid');
const { trace, context } = require('@opentelemetry/api');

// Simple request-id tracing middleware that also creates a span per request
module.exports = function requestIdMiddleware(req, res, next) {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  // expose on response header for clients
  res.setHeader('X-Request-Id', id);

  // provide a simple child logger if available
  if (req.app && req.app.locals && req.app.locals.logger && typeof req.app.locals.logger.child === 'function') {
    req.log = req.app.locals.logger.child({ requestId: id });
  }

  // create an OpenTelemetry span for the incoming HTTP request
  try {
    const tracer = trace.getTracer('app-tracer');
    const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
      attributes: {
        'http.method': req.method,
        'http.route': req.path,
        'request.id': id,
      },
    });

    // bind span to active context for downstream instrumentation
    trace.setSpan(context.active(), span);

    // ensure span ends when response finishes
    res.on('finish', () => {
      try {
        span.setAttribute('http.status_code', res.statusCode);
        span.end();
      } catch (e) {
        // ignore span errors
      }
    });

    // optional: expose span on request for additional manual instrumentation
    req._otelSpan = span;
  } catch (err) {
    // if tracing libs not available, continue silently
  }

  next();
};
