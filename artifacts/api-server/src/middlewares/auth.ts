import { type Request, type Response, type NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const sessionUser = (req as Request & { session?: { userId?: number; username?: string; email?: string } }).session;
  const userId = req.headers["x-admin-id"];
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}
