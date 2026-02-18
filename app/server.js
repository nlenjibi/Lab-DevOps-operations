// Initialize tracing as early as possible
require('./tracing/opentelemetry');

const mongoose = require('mongoose');
const bodyParse = require('body-parser');
const express = require('express');
const app = express();
const morgan = require('morgan');
const logger = require('./config/logger');

// Fontend route
const FrontRouter = require('./routes/front');
// API routes (JSON)
const ApiRouter = require('./routes/api');

// Set ejs template engine
app.set('view engine', 'ejs');

const requestIdMiddleware = require('./middleware/tracing');

// Expose base logger for middleware-child loggers
app.locals.logger = logger;

// attach request id middleware early
app.use(requestIdMiddleware);

// Add morgan token for request id and use it in logging
morgan.token('id', function getId(req) { return req.id; });
app.use(morgan(':id :remote-addr - :method :url :status :res[content-length] - :response-time ms', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use(bodyParse.urlencoded({ extended: false }));

// Database connection (skip during tests)
const db = require('./config/keys').mongoProdURI;
if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(db, { useNewUrlParser: true })
        .then(() => console.log(`Mongodb Connected`))
        .catch(error => console.log(error));
}


app.use(FrontRouter);
// mount API routes under /api
app.use('/api', ApiRouter);

// Health endpoint for operability
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Centralized error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error: %o', err);
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    // If request expects HTML, render simple error page, otherwise return JSON
    if (req.accepts('html')) {
        res.status(status).send(`<h1>Error</h1><pre>${err.message}</pre>`);
    } else {
        res.status(status).json({ error: err.message || 'Internal Server Error', code: err.code || 'server_error' });
    }
});

// Only start server when run directly; export `app` for tests
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
    });
}

module.exports = app;