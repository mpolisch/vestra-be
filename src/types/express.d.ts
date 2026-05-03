declare global {
    namespace Express {
        interface Request {
            user?: import('./index.js').AuthPayload;
        }
    }
}

export {};
