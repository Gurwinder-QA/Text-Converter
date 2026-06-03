import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLink, useGetLinkQr, getGetLinkQrQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Check, Copy, Download, Link as LinkIcon, Printer, QrCode } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  destinationUrl: z.string().url("Must be a valid URL"),
  status: z.enum(["active", "inactive"]),
  expiryDate: z.string().optional().nullable(),
});

type CreateValues = z.infer<typeof createSchema>;

export default function CreateCode() {
  const { toast } = useToast();
  const [createdLinkId, setCreatedLinkId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      destinationUrl: "",
      status: "active",
      expiryDate: "",
    },
  });

  const createMutation = useCreateLink();

  const { data: qrData, isLoading: isLoadingQr } = useGetLinkQr(createdLinkId as number, {
    query: {
      enabled: !!createdLinkId,
      queryKey: getGetLinkQrQueryKey(createdLinkId as number),
    }
  });

  function onSubmit(values: CreateValues) {
    const payload = {
      ...values,
      expiryDate: values.expiryDate || null,
    };
    
    createMutation.mutate({ data: payload }, {
      onSuccess: (data) => {
        setCreatedLinkId(data.id);
        toast({ title: "Link created successfully" });
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast({
          title: "Failed to create link",
          description: error.error?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    });
  }

  function handleReset() {
    setCreatedLinkId(null);
    form.reset();
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create QR Code</h1>
        <p className="text-muted-foreground mt-1">Generate a new short link and QR code.</p>
      </div>

      {createdLinkId && qrData ? (
        <SuccessView qrData={qrData} onReset={handleReset} />
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Link Details</CardTitle>
            <CardDescription>Enter the destination and settings for your new short link.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Campaign 2024..." {...field} />
                        </FormControl>
                        <FormDescription>A descriptive name for internal tracking.</FormDescription>
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
                        <FormDescription>Where should this link redirect users?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Initial Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>Leave blank for a link that never expires.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Link & QR"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SuccessView({ qrData, onReset }: { qrData: any, onReset: () => void }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://link.company.com/${qrData.code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    const link = document.createElement('a');
    link.href = qrData.dataUrl;
    link.download = `qr-${qrData.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQr = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${qrData.code}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
              img { max-width: 400px; height: auto; margin-bottom: 20px; }
              .url { font-size: 1.2rem; font-weight: bold; }
            </style>
          </head>
          <body>
            <img src="${qrData.dataUrl}" alt="QR Code" />
            <div class="url">${fullUrl}</div>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card className="border-green-500/30 shadow-md overflow-hidden">
      <div className="bg-green-500/10 p-6 flex flex-col items-center border-b border-green-500/20">
        <div className="bg-green-500 text-white rounded-full p-3 mb-4 shadow-sm">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Success!</h2>
        <p className="text-green-700/80 dark:text-green-500/80 mt-1">Your short link and QR code are ready.</p>
      </div>

      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
          
          <div className="flex flex-col items-center space-y-4 bg-muted/30 p-6 rounded-xl border border-border">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
              <img src={qrData.dataUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={downloadQr}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button variant="outline" className="flex-1" onClick={printQr}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full max-w-md">
            <div>
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Short URL</label>
              <div className="flex items-center gap-2">
                <div className="bg-muted px-4 py-3 rounded-md font-mono text-sm border border-border flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {fullUrl}
                </div>
                <Button variant={copied ? "default" : "secondary"} className="shrink-0" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Short Code</div>
                <div className="font-mono font-bold text-lg">{qrData.code}</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="font-bold text-lg text-green-600">Active</div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button className="w-full" onClick={onReset}>Create Another</Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/manage/${qrData.code}/edit`}>Edit Details</Link>
              </Button>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
