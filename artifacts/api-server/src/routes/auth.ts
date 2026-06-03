import { Router, type IRouter } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, LoginResponse, GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.username, username));

  if (!admin || admin.passwordHash !== password) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  res.setHeader("x-admin-id", String(admin.id));
  res.json(LoginResponse.parse({
    user: { id: admin.id, username: admin.username, email: admin.email },
    message: "Login successful",
  }));
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const adminIdRaw = req.headers["x-admin-id"];
  if (!adminIdRaw) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const adminId = parseInt(Array.isArray(adminIdRaw) ? adminIdRaw[0] : adminIdRaw, 10);
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.id, adminId));

  if (!admin) {
    res.status(401).json({ error: "Admin not found" });
    return;
  }

  res.json(GetMeResponse.parse({ id: admin.id, username: admin.username, email: admin.email }));
});

export default router;
