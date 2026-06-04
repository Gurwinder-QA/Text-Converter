"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetLink, useUpdateLink, getGetLinkQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  destinationUrl: z.string().url("Must be a valid URL"),
  status: z.enum(["active", "inactive"]),
  expiryDate: z.string().optional().nullable(),
});

type EditValues = z.infer<typeof editSchema>;

export default function EditCodePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linkId = parseInt(params.id as string, 10);

  const { data: link, isLoading } = useGetLink(linkId, {
    query: {
      enabled: !!linkId,
      queryKey: getGetLinkQueryKey(linkId),
    },
  });

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", destinationUrl: "", status: "active", expiryDate: "" },
  });

  useEffect(() => {
    if (link) {
      form.reset({
        name: link.name,
        destinationUrl: link.destinationUrl,
        status: link.status,
        expiryDate: link.expiryDate ? format(new Date(link.expiryDate), "yyyy-MM-dd") : "",
      });
    }
  }, [link, form]);

  const updateMutation = useUpdateLink();

  function onSubmit(values: EditValues) {
    updateMutation.mutate(
      { id: linkId, data: { ...values, expiryDate: values.expiryDate || null } },
      {
        onSuccess: () => {
          toast({ title: "Link updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetLinkQueryKey(linkId) });
          router.push("/manage");
        },
        onError: () => {
          toast({ title: "Failed to update link", variant: "destructive" });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!link) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-foreground">Link not found</h2>
        <Link href="/manage" className="text-primary hover:underline mt-4 inline-block">
          Return to manage codes
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full">
      <Link
        href="/manage"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        data-testid="link-back"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Manage
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Code</h1>
        <p className="text-muted-foreground mt-1">Update settings for your short link.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-muted/20 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-foreground">Link Configuration</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Short code:{" "}
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">
                  {link.code}
                </span>
              </p>
            </div>
            <div className="text-xs bg-background border border-border px-3 py-1.5 rounded-md text-muted-foreground font-mono">
              https://link.company.com/{link.code}
            </div>
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Campaign 2024..." data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" data-testid="input-url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="active" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="inactive" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">Inactive</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-expiry" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Leave blank for a link that never expires.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <Button type="button" variant="outline" asChild>
                  <Link href="/manage">Cancel</Link>
                </Button>
                <Button type="submit" data-testid="button-save" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
