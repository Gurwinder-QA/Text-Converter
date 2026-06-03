import { Router, type IRouter } from "express";
import { db, linksTable } from "@workspace/db";
import { GetAnalyticsSummaryResponse, GetAnalyticsTableResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const links = await db.select().from(linksTable);
  const now = new Date().toISOString().split("T")[0];

  const totalEngagements = links.reduce((sum, l) => sum + l.clicks + l.scans, 0);
  const totalActiveCodes = links.filter((l) => l.status === "active").length;
  const totalInactiveCodes = links.filter((l) => l.status === "inactive").length;
  const expiredCodes = links.filter(
    (l) => l.expiryDate != null && l.expiryDate < now
  ).length;
  const totalLinks = links.length;

  res.json(
    GetAnalyticsSummaryResponse.parse({
      totalEngagements,
      totalActiveCodes,
      totalInactiveCodes,
      expiredCodes,
      totalLinks,
    })
  );
});

router.get("/analytics/table", async (_req, res): Promise<void> => {
  const links = await db.select().from(linksTable);

  const rows = links.map((l) => ({
    id: l.id,
    code: l.code,
    name: l.name,
    clicks: l.clicks,
    scans: l.scans,
    total: l.clicks + l.scans,
    status: l.status as "active" | "inactive",
  }));

  res.json(GetAnalyticsTableResponse.parse(rows));
});

export default router;
