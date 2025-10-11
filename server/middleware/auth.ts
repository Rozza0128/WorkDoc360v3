import { Request, Response, NextFunction } from 'express';

// Lightweight authentication middleware used by API routes.
// In production this should be replaced with the real auth middleware.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // If session has a userId allow through, otherwise return 401 in production
    if ((req as any).session && (req as any).session.userId) {
        return next();
    }

    // In development, allow through for convenience
    if (process.env.NODE_ENV !== 'production') {
        (req as any).session = (req as any).session || {};
        (req as any).session.userId = (req as any).session.userId || 'dev-user';
        return next();
    }

    res.status(401).json({ error: 'Unauthorized' });
}

export default requireAuth;
