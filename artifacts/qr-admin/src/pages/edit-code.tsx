import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetLink, useUpdateLink, getGetLinkQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  destinationUrl: z.string().url("Must be a valid URL"),
  status: z.enum(["active", "inactive"]),
  expiryDate: z.string().optional().nullable(),
});

type EditValues = z.infer<typeof editSchema>;

export default function EditCode() {
  const { id } = useParams();
  const linkId = parseInt(id as string, 10);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: link, isLoading } = useGetLink(linkId, {
    query: {
      enabled: !!linkId,
      queryKey: getGetLinkQueryKey(linkId),
    }
  });

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      destinationUrl: "",
      status: "active",
      expiryDate: "",
    },
  });

  // Initialize form with server data
  useEffect(() => {
    if (link) {
      form.reset({
        name: link.name,
        destinationUrl: link.destinationUrl,
        status: link.status,
        expiryDate: link.expiryDate ? format(new Date(link.expiryDate), "yyyy-MM-dd'T'HH:mm") : "",
      });
    }
  }, [link, form]);

  const updateMutation = useUpdateLink();

  function onSubmit(values: EditValues) {
    const payload = {
      ...values,
      expiryDate: values.expiryDate || null,
    };
    
    updateMutation.mutate({ id: linkId, data: payload }, {
      onSuccess: () => {
        toast({ title: "Link updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetLinkQueryKey(linkId) });
        setLocation("/manage");
      },
      onError: (error) => {
        toast({
          title: "Failed to update link",
          description: error.error?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-96 mb-8" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Link not found</h2>
        <Button variant="link" asChild className="mt-4"><Link href="/manage">Return to manage codes</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/manage">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Manage
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Code: {link.code}</h1>
        <p className="text-muted-foreground mt-1">Update settings for your short link.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/20 border-b border-border pb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
            <div>
              <CardTitle>Link Configuration</CardTitle>
              <CardDescription>Short code: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{link.code}</span></CardDescription>
            </div>
            <div className="text-sm bg-background border border-border px-3 py-1.5 rounded-md text-muted-foreground font-mono">
              https://link.company.com/{link.code}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
                        <Input placeholder="Campaign 2024..." {...field} />
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
                        <Input placeholder="https://example.com/landing-page" {...field} />
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
                            <FormControl>
                              <RadioGroupItem value="active" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="inactive" />
                            </FormControl>
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
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ""} />
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
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
