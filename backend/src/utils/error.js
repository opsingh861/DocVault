class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

export { AppError, ValidationError, UnauthorizedError, NotFoundError };