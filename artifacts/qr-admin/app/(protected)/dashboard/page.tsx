"use client";

import {
  useGetAnalyticsSummary,
  useGetAnalyticsTable,
  getGetAnalyticsSummaryQueryKey,
  getGetAnalyticsTableQueryKey,
} from "@workspace/api-client-react";
import Link from "next/link";
import { Activity, QrCode, Ban, CalendarX, BarChart3, Scan, MousePointerClick } from "lucide-react";
import { Badge } from "flowbite-react";

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  iconColor = "text-muted-foreground",
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  loading: boolean;
  iconColor?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {loading ? (
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      ) : (
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value !== undefined ? value.toLocaleString() : "-"}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary({
    query: { queryKey: getGetAnalyticsSummaryQueryKey() },
  });
  const { data: tableData, isLoading: isLoadingTable } = useGetAnalyticsTable({
    query: { queryKey: getGetAnalyticsTableQueryKey() },
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your short links and QR code performance.</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 w-fit"
          data-testid="link-create-new"
        >
          Create New Link
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Engagements" value={summary?.totalEngagements} icon={Activity} loading={isLoadingSummary} />
        <StatCard title="Active Codes" value={summary?.totalActiveCodes} icon={QrCode} loading={isLoadingSummary} iconColor="text-green-500" />
        <StatCard title="Inactive Codes" value={summary?.totalInactiveCodes} icon={Ban} loading={isLoadingSummary} iconColor="text-red-500" />
        <StatCard title="Expired Codes" value={summary?.expiredCodes} icon={CalendarX} loading={isLoadingSummary} iconColor="text-orange-500" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <BarChart3 className="w-5 h-5 text-primary" />
            Link Performance
          </div>
          <Link href="/manage" className="text-sm font-medium text-primary hover:underline" data-testid="link-view-all">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Clicks</th>
                <th className="px-6 py-3 text-right">Scans</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingTable
                ? Array(4).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : tableData && tableData.length > 0
                ? tableData.map((link) => (
                    <tr key={link.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-muted-foreground">{link.code}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{link.name}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge color={link.status === "active" ? "success" : "failure"} className="justify-center">
                          {link.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          <MousePointerClick className="w-3.5 h-3.5 opacity-50" />
                          {link.clicks.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          <Scan className="w-3.5 h-3.5 opacity-50" />
                          {link.scans.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">{link.total.toLocaleString()}</td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No link data available.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
