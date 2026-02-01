import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Mail, MessageCircle, Trash2 } from "lucide-react";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: string;
  created_at: string;
  product_id: string | null;
  product?: {
    name: string;
    is_faas_enabled: boolean | null;
  } | null;
  admin_notes: string | null;
}

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEnquiries();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-enquiries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiries',
        },
        () => {
          fetchEnquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*, products(name, is_faas_enabled)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnquiries((data as unknown as Enquiry[]) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch enquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("enquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === id ? { ...enq, status: newStatus } : enq)),
      );

      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }

      toast({
        title: "Success",
        description: "Status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;

      setEnquiries((prev) => prev.filter((enq) => enq.id !== id));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }

      toast({ title: "Enquiry deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete enquiry",
        variant: "destructive",
      });
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("enquiries")
        .update({ admin_notes: notes } as any) // Casting to any until types are updated
        .eq("id", id);

      if (error) throw error;

      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === id ? { ...enq, admin_notes: notes } : enq)),
      );

      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, admin_notes: notes });
      }

      toast({
        title: "Notes Saved",
        description: "Internal notes have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "new":
        return "bg-primary/10 text-primary";
      case "contacted":
        return "bg-accent text-accent-foreground";
      case "converted":
        return "bg-emerald-500/10 text-emerald-500";
      case "closed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSource = (enquiry: Enquiry): "Product" | "FaaS" | "Contact" => {
    if (enquiry.product) {
      if (enquiry.product.is_faas_enabled) return "FaaS";
      return "Product";
    }
    return "Contact";
  };

  const buildWhatsAppLink = (enquiry: Enquiry) => {
    if (!enquiry.phone) return "";
    const digits = enquiry.phone.replace(/[^\d]/g, "");
    if (!digits) return "";
    const snippet = enquiry.message.slice(0, 200);
    const text = `Hi ${enquiry.name}, regarding your enquiry: "${snippet}"`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  };

  const buildEmailLink = (enquiry: Enquiry) => {
    const subject = `Re: your enquiry with MetalForge`;
    const snippet = enquiry.message.slice(0, 500);
    const body = `Hi ${enquiry.name},%0D%0A%0D%0AThank you for reaching out.%0D%0A%0D%0AYour message:%0D%0A${encodeURIComponent(
      snippet,
    )}`;
    return `mailto:${encodeURIComponent(enquiry.email)}?subject=${encodeURIComponent(
      subject,
    )}&body=${body}`;
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const source = getSource(enquiry);
    const matchesStatus =
      statusFilter === "all" ? true : enquiry.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" ? true : source.toLowerCase() === sourceFilter;
    const term = search.toLowerCase();
    const matchesSearch = term
      ? enquiry.name.toLowerCase().includes(term) ||
      enquiry.email.toLowerCase().includes(term) ||
      (enquiry.phone || "").toLowerCase().includes(term) ||
      enquiry.message.toLowerCase().includes(term)
      : true;

    return matchesStatus && matchesSource && matchesSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Enquiries</h1>
      </div>

      <Card className="mb-6 dark:bg-slate-900 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by name, email, phone, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
          <div className="flex flex-wrap gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-36 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter}
              onValueChange={(value) => setSourceFilter(value)}
            >
              <SelectTrigger className="w-36 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="faas">FaaS</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-900 dark:border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No enquiries found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
                    <TableHead className="dark:text-slate-300">Date</TableHead>
                    <TableHead className="dark:text-slate-300">Name</TableHead>
                    <TableHead className="dark:text-slate-300">Email</TableHead>
                    <TableHead className="dark:text-slate-300">Phone</TableHead>
                    <TableHead className="dark:text-slate-300">Source</TableHead>
                    <TableHead className="dark:text-slate-300">Product</TableHead>
                    <TableHead className="dark:text-slate-300">Status</TableHead>
                    <TableHead className="dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnquiries.map((enquiry) => {
                    const source = getSource(enquiry);
                    return (
                      <TableRow key={enquiry.id} className="dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="text-sm">
                          {format(
                            new Date(enquiry.created_at),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {enquiry.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {enquiry.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {enquiry.phone || "-"}
                        </TableCell>
                        <TableCell className="text-sm">{source}</TableCell>
                        <TableCell className="text-sm dark:text-slate-300">
                          {enquiry.product?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusClasses(enquiry.status)}>
                            {enquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                              type="button"
                              onClick={() => setSelectedEnquiry(enquiry)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                              type="button"
                              onClick={() => updateStatus(enquiry.id, "new")}
                            >
                              New
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                              type="button"
                              onClick={() =>
                                updateStatus(enquiry.id, "contacted")
                              }
                            >
                              Contacted
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                              type="button"
                              onClick={() =>
                                updateStatus(enquiry.id, "converted")
                              }
                            >
                              Converted
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                              type="button"
                              onClick={() => updateStatus(enquiry.id, "closed")}
                            >
                              Closed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                              type="button"
                              onClick={() => handleDelete(enquiry.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEnquiry && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold mb-2">Enquiry details</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Date:</span>{" "}
                {format(new Date(selectedEnquiry.created_at), "PPpp")}
              </p>
              <p>
                <span className="font-medium">Name:</span> {selectedEnquiry.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selectedEnquiry.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {selectedEnquiry.phone || "-"}
              </p>
              <p>
                <span className="font-medium">Company:</span>{" "}
                {selectedEnquiry.company || "-"}
              </p>
              <p>
                <span className="font-medium">Source:</span>{" "}
                {getSource(selectedEnquiry)}
              </p>
              <p>
                <span className="font-medium">Product:</span>{" "}
                {selectedEnquiry.product?.name || "-"}
              </p>
              <div className="mt-3">
                <p className="font-medium mb-1">Message</p>
                <p className="whitespace-pre-wrap text-sm bg-muted dark:bg-slate-800 rounded-md p-3 dark:text-slate-300">
                  {selectedEnquiry.message}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t dark:border-slate-800">
                <p className="font-medium mb-2 flex items-center gap-2">
                  📝 Internal Notes <span className="text-xs text-muted-foreground font-normal">(Only visible to admins)</span>
                </p>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add internal notes about this enquiry..."
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-[100px]"
                    defaultValue={selectedEnquiry.admin_notes || ""}
                    id="admin-notes-input"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const input = document.getElementById("admin-notes-input") as HTMLTextAreaElement;
                      if (input) updateNotes(selectedEnquiry.id, input.value);
                    }}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl font-semibold mb-2">Follow-up</h2>
              <div className="flex flex-wrap gap-2">
                {selectedEnquiry.email && (
                  <a
                    href={buildEmailLink(selectedEnquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" type="button">
                      <Mail className="h-4 w-4 mr-1" /> Email reply
                    </Button>
                  </a>
                )}
                {selectedEnquiry.phone && buildWhatsAppLink(selectedEnquiry) && (
                  <a
                    href={buildWhatsAppLink(selectedEnquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" type="button">
                      <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                    </Button>
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-medium">Update status</p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "contacted", "converted", "closed"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          selectedEnquiry.status === status
                            ? "default"
                            : "outline"
                        }
                        type="button"
                        onClick={() => updateStatus(selectedEnquiry.id, status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
