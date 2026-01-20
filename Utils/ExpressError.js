class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
// This code defines a custom error class called `ExpressError` that extends the built-in `Error` class in JavaScript.