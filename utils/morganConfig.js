const morgan = require('morgan');

// Create custom token to log request body
morgan.token('req-body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return null;
});

module.exports = morgan;
