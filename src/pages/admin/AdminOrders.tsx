import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, Filter, MoreVertical, FileText, Package, CheckCircle, Ban, Clock, Trash2 } from "lucide-react";
import { OrderDetailsDialog } from "@/components/admin/orders/OrderDetailsDialog";
import { Badge } from "@/components/ui/badge";

type OrderStatus = "new" | "processing" | "completed" | "cancelled";
type OrderType = "purchase" | "rental";

const orderFilterSchema = z.object({
  status: z
    .union([
      z.literal("all"),
      z.literal("new"),
      z.literal("processing"),
      z.literal("completed"),
      z.literal("cancelled"),
    ])
    .default("all"),
  type: z
    .union([z.literal("all"), z.literal("purchase"), z.literal("rental")])
    .default("all"),
  search: z.string().trim().max(255).optional(),
});

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState<z.infer<typeof orderFilterSchema>>({
    status: "all",
    type: "all",
    search: "",
  });

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus | string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: status as OrderStatus })
        .eq("id", orderId);

      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

      // Also update selected order if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status }));
      }

      toast({ title: "Status updated" });
    } catch (error) {
      console.error("Error updating status", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete);

      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete));
      setOrderToDelete(null);

      toast({
        title: "Order deleted",
        description: "The order has been permanently removed.",
      });
    } catch (error) {
      console.error("Error deleting order", error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const calculateOrderTotal = (order: any) => {
    if (!order.products || !Array.isArray(order.products)) return 0;
    return order.products.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const filteredOrders = useMemo(() => {
    const parsed = orderFilterSchema.safeParse(filters);
    if (!parsed.success) return orders;
    const { status, type, search } = parsed.data;

    return orders.filter((order) => {
      const matchesStatus = status === "all" ? true : order.status === status;
      const matchesType = type === "all" ? true : order.order_type === type;
      const searchTerm = search?.toLowerCase();
      const matchesSearch = searchTerm
        ? (order.customer_name || "").toLowerCase().includes(searchTerm) ||
        (order.email || "").toLowerCase().includes(searchTerm) ||
        (order.order_number || order.id || "").toLowerCase().includes(searchTerm)
        : true;
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [orders, filters]);

  const exportCsv = () => {
    if (!orders.length) {
      toast({ title: "No orders to export" });
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Order Type",
      "Status",
      "Total Amount",
      "Created At",
    ];

    const rows = orders.map((o) => [
      o.order_number || o.id,
      o.customer_name,
      o.email || "",
      o.phone || "",
      o.order_type,
      o.status,
      calculateOrderTotal(o),
      o.created_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "processing": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "completed": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage customer orders, invoices, and shipping.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <CardContent className="p-5 space-y-5">
          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <Input
                placeholder="Search orders..."
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="md:max-w-xs bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
              />
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 md:mt-0">
                <Filter className="h-4 w-4" />
                Filters
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value as any }))
                }
              >
                <SelectTrigger className="w-32 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value as any }))
                }
              >
                <SelectTrigger className="w-32 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-md overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-700">
            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mb-4"></div>
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No orders found</h3>
                <p className="max-w-xs mx-auto mt-1">Orders will appear here once customers place them.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const total = calculateOrderTotal(order);
                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-800">
                        <TableCell className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                          {order.order_number || order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-slate-200">{order.customer_name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{order.email || order.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize font-normal text-slate-600 dark:text-slate-300 dark:border-slate-700">
                            {order.order_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {total > 0 ? `₹${total.toLocaleString()}` : <span className="text-slate-400 italic text-xs">Custom Quote</span>}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
                                <Package className="mr-2 h-4 w-4" /> Shipping Label
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'processing')}>
                                <Clock className="mr-2 h-4 w-4" /> Mark Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')} className="text-red-600 focus:text-red-600">
                                <Ban className="mr-2 h-4 w-4" /> Cancel Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setOrderToDelete(order.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedOrder(null); }}
        onStatusChange={handleStatusChange}
      />

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
