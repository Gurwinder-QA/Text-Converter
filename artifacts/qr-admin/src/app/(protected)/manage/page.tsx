"use client";

import { useState } from "react";
import { useListLinks, getListLinksQueryKey, useDeleteLink } from "@workspace/api-client-react";
import Link from "next/link";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "flowbite-react";
import { Search, PlusCircle, Pencil, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";

export default function ManageCodesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams: Record<string, string> = {};
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (statusFilter !== "all") queryParams.status = statusFilter;
  if (expiryFilter !== "all") queryParams.expiry = expiryFilter;

  const { data: links, isLoading } = useListLinks(queryParams as Parameters<typeof useListLinks>[0], {
    query: { queryKey: getListLinksQueryKey(queryParams as Parameters<typeof useListLinks>[0]) },
  });

  const deleteMutation = useDeleteLink();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Link deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
          setDeleteId(null);
        },
        onError: () => {
          toast({ title: "Failed to delete link", variant: "destructive" });
          setDeleteId(null);
        },
      }
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Codes</h1>
          <p className="text-muted-foreground mt-1">View, edit, and track all your generated short links.</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 w-fit"
          data-testid="link-create-new"
        >
          <PlusCircle className="w-4 h-4" /> Create New
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            className="pl-9 w-full bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="select-status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            data-testid="select-expiry"
          >
            <option value="all">All Expiry</option>
            <option value="expired">Expired</option>
            <option value="notExpired">Not Expired</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3 w-[100px]">Code</th>
                <th className="px-6 py-3">Name & Destination</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3 text-right">Engagement</th>
                <th className="px-6 py-3 text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : links && links.length > 0
                ? links.map((link) => (
                    <tr key={link.id} className="group hover:bg-muted/20 transition-colors" data-testid={`row-link-${link.id}`}>
                      <td className="px-6 py-4 font-mono text-sm font-medium text-muted-foreground">{link.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{link.name}</div>
                        <a
                          href={link.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors max-w-[280px] truncate mt-0.5"
                        >
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{link.destinationUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={link.status === "active" ? "success" : "failure"}>
                          {link.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {link.expiryDate ? format(new Date(link.expiryDate), "MMM d, yyyy") : "None"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {link.totalEngagements.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/manage/${link.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium bg-muted hover:bg-accent transition-colors text-foreground"
                            data-testid={`link-edit-${link.id}`}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Link>
                          <button
                            onClick={() => setDeleteId(link.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive"
                            data-testid={`button-delete-${link.id}`}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No links found matching your filters.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The short link and QR code will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
