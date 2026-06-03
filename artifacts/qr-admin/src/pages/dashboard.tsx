import { useGetAnalyticsSummary, useGetAnalyticsTable, getGetAnalyticsSummaryQueryKey, getGetAnalyticsTableQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Activity, QrCode, Ban, CalendarX, ArrowRight, BarChart3, Scan, MousePointerClick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary({
    query: {
      queryKey: getGetAnalyticsSummaryQueryKey(),
    }
  });

  const { data: tableData, isLoading: isLoadingTable } = useGetAnalyticsTable({
    query: {
      queryKey: getGetAnalyticsTableQueryKey(),
    }
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your short links and QR code performance.</p>
        </div>
        <Link href="/create" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 w-fit shrink-0">
          Create New Link
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Engagements" 
          value={summary?.totalEngagements} 
          icon={Activity} 
          loading={isLoadingSummary} 
          className="bg-card"
        />
        <SummaryCard 
          title="Active Codes" 
          value={summary?.totalActiveCodes} 
          icon={QrCode} 
          loading={isLoadingSummary} 
          iconColor="text-green-500"
        />
        <SummaryCard 
          title="Inactive Codes" 
          value={summary?.totalInactiveCodes} 
          icon={Ban} 
          loading={isLoadingSummary} 
          iconColor="text-red-500"
        />
        <SummaryCard 
          title="Expired Codes" 
          value={summary?.expiredCodes} 
          icon={CalendarX} 
          loading={isLoadingSummary} 
          iconColor="text-orange-500"
        />
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Link Performance
            </CardTitle>
          </div>
          <Link href="/manage" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Scans</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTable ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tableData && tableData.length > 0 ? (
                tableData.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-sm font-medium text-muted-foreground">{link.code}</TableCell>
                    <TableCell className="font-medium">{link.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={link.status === "active" ? "default" : "destructive"} className={link.status === "active" ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 shadow-none border-green-500/20" : ""}>
                        {link.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">
                      <div className="flex items-center justify-end gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 opacity-50" />
                        {link.clicks.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">
                      <div className="flex items-center justify-end gap-1.5">
                        <Scan className="w-3.5 h-3.5 opacity-50" />
                        {link.scans.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {link.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No link data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, loading, className = "", iconColor = "text-muted-foreground" }: any) {
  return (
    <Card className={`border-border shadow-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value !== undefined ? value.toLocaleString() : "-"}</div>
        )}
      </CardContent>
    </Card>
  );
}
