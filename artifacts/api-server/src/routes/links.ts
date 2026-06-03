import { Router, type IRouter } from "express";
import { db, linksTable } from "@workspace/db";
import { eq, and, sql, isNotNull, lt } from "drizzle-orm";
import {
  ListLinksQueryParams,
  ListLinksResponse,
  CreateLinkBody,
  GetLinkParams,
  GetLinkResponse,
  UpdateLinkParams,
  UpdateLinkBody,
  UpdateLinkResponse,
  DeleteLinkParams,
  GetLinkQrParams,
  GetLinkQrResponse,
} from "@workspace/api-zod";
import QRCode from "qrcode";

const BASE_URL = "https://link.company.com";

function generateCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function mapLink(link: typeof linksTable.$inferSelect) {
  return {
    id: link.id,
    code: link.code,
    name: link.name,
    destinationUrl: link.destinationUrl,
    status: link.status as "active" | "inactive",
    expiryDate: link.expiryDate ?? null,
    clicks: link.clicks,
    scans: link.scans,
    totalEngagements: link.clicks + link.scans,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  };
}

const router: IRouter = Router();

router.get("/links", async (req, res): Promise<void> => {
  const queryParsed = ListLinksQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const { status, search, expiry } = queryParsed.data;

  let rows = await db.select().from(linksTable);

  if (status && status !== "all") {
    rows = rows.filter((r) => r.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(s) || r.code.toLowerCase().includes(s)
    );
  }

  if (expiry === "expired") {
    const now = new Date().toISOString().split("T")[0];
    rows = rows.filter((r) => r.expiryDate != null && r.expiryDate < now);
  } else if (expiry === "notExpired") {
    const now = new Date().toISOString().split("T")[0];
    rows = rows.filter((r) => r.expiryDate == null || r.expiryDate >= now);
  }

  res.json(ListLinksResponse.parse(rows.map(mapLink)));
});

router.post("/links", async (req, res): Promise<void> => {
  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let code: string;
  let exists = true;
  do {
    code = generateCode();
    const [existing] = await db.select().from(linksTable).where(eq(linksTable.code, code));
    exists = !!existing;
  } while (exists);

  const [link] = await db
    .insert(linksTable)
    .values({
      code,
      name: parsed.data.name,
      destinationUrl: parsed.data.destinationUrl,
      status: parsed.data.status,
      expiryDate: parsed.data.expiryDate ?? null,
    })
    .returning();

  res.status(201).json(GetLinkResponse.parse(mapLink(link)));
});

router.get("/links/:id", async (req, res): Promise<void> => {
  const params = GetLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [link] = await db.select().from(linksTable).where(eq(linksTable.id, params.data.id));
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(GetLinkResponse.parse(mapLink(link)));
});

router.patch("/links/:id", async (req, res): Promise<void> => {
  const params = UpdateLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof linksTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.destinationUrl !== undefined) updateData.destinationUrl = parsed.data.destinationUrl;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (Object.prototype.hasOwnProperty.call(parsed.data, "expiryDate")) {
    updateData.expiryDate = parsed.data.expiryDate ?? null;
  }

  const [link] = await db
    .update(linksTable)
    .set(updateData)
    .where(eq(linksTable.id, params.data.id))
    .returning();

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(UpdateLinkResponse.parse(mapLink(link)));
});

router.delete("/links/:id", async (req, res): Promise<void> => {
  const params = DeleteLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [link] = await db
    .delete(linksTable)
    .where(eq(linksTable.id, params.data.id))
    .returning();

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/links/:id/qr", async (req, res): Promise<void> => {
  const params = GetLinkQrParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [link] = await db.select().from(linksTable).where(eq(linksTable.id, params.data.id));
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const shortUrl = `${BASE_URL}/${link.code}`;
  const dataUrl = await QRCode.toDataURL(shortUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#1d263a", light: "#ffffff" },
  });

  res.json(GetLinkQrResponse.parse({ dataUrl, shortUrl, code: link.code }));
});

export default router;
