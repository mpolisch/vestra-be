export class AppError extends Error {
    statusCode: number;
    expose: boolean;

    constructor(message: string, statusCode: number, expose = true) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.expose = expose;
    }
}
