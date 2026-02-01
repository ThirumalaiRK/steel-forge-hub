import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Printer, Package, CreditCard, User, Box, FileText, Download } from "lucide-react";
import { InvoiceTemplate, OrderDetails } from "./InvoiceTemplate";
import { ShippingLabel } from "./ShippingLabel";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useReactToPrint } from "react-to-print";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetailsDialogProps {
    order: any; // Raw order from Supabase
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (id: string, status: string) => void;
}

export const OrderDetailsDialog = ({ order, isOpen, onClose, onStatusChange }: OrderDetailsDialogProps) => {
    const { settings } = useSiteSettings();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);

    const [shippingAddress, setShippingAddress] = useState<any>(null);
    const [billingAddress, setBillingAddress] = useState<any>(null);
    const [customerDetails, setCustomerDetails] = useState<any>(null);
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    // Fetch additional order data
    useEffect(() => {
        if (!order?.id) return;

        const fetchOrderDetails = async () => {
            // Fetch shipping address
            const { data: shipping } = await supabase
                .from('order_addresses' as any)
                .select('*')
                .eq('order_id', order.id)
                .eq('address_type', 'shipping')
                .maybeSingle();

            if (shipping) setShippingAddress(shipping);

            // Fetch billing address
            const { data: billing } = await supabase
                .from('order_addresses' as any)
                .select('*')
                .eq('order_id', order.id)
                .eq('address_type', 'billing')
                .maybeSingle();

            if (billing) setBillingAddress(billing);

            // Fetch customer details
            const { data: customer } = await supabase
                .from('order_customer_details' as any)
                .select('*')
                .eq('order_id', order.id)
                .maybeSingle();

            if (customer) setCustomerDetails(customer);

            // Fetch payment details
            const { data: payment } = await supabase
                .from('order_payment_details' as any)
                .select('*')
                .eq('order_id', order.id)
                .maybeSingle();

            if (payment) setPaymentDetails(payment);
        };

        fetchOrderDetails();
    }, [order?.id]);

    // Format address helper
    const formatAddress = (addr: any) => {
        if (!addr) return "Address pending";

        const parts = [
            addr.address_line_1,
            addr.address_line_2,
            `${addr.city}, ${addr.state} ${addr.postal_code}`,
            addr.country
        ].filter(Boolean);

        return parts.join('\n');
    };

    // Parse items from JSON
    const items = Array.isArray(order?.products) ? order.products : [];

    // Calculate totals if not present (assuming standard price structure if available)
    const calculateTotal = () => {
        // If we have total_amount in DB (future), use it. Else sum items.
        return items.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    };

    const totalAmount = calculateTotal();

    // Normalize data for templates
    const orderDetails: OrderDetails = {
        id: order?.order_number || order?.id || "",
        created_at: order?.created_at || "",
        customer_name: customerDetails?.name || order?.customer_name || "",
        email: customerDetails?.email || order?.email || "",
        phone: customerDetails?.phone || order?.phone || "",
        billing_address: formatAddress(billingAddress),
        shipping_address: formatAddress(shippingAddress),
        status: order?.status || "new",
        payment_status: paymentDetails?.payment_status || "pending",
        items: items.map((i: any) => ({
            id: i.id || "sku",
            name: i.title || i.name || "Product", // Handle various shapes
            quantity: i.quantity || 1,
            price: i.price || 0,
            total: (i.price || 0) * (i.quantity || 1),
            customization: i.selected_options ? JSON.stringify(i.selected_options) : undefined
        })),
        total: totalAmount,
        subtotal: totalAmount,
        is_custom_quote: order?.order_type === 'rental' || totalAmount === 0 // Logic: if price is 0, it's likely a generic quote
    };

    const handlePrintInvoice = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${order?.id}`,
    });

    const handlePrintLabel = useReactToPrint({
        contentRef: labelRef,
        documentTitle: `Label-${order?.id}`,
    });

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                Order #{order.order_number || order.id.slice(0, 8)}
                                <StatusBadge status={order.status} />
                                <Badge variant="outline" className="text-xs font-normal uppercase">{order.order_type}</Badge>
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Placed on {format(new Date(order.created_at), "PPP p")}
                            </p>
                        </div>
                        <div className="flex gap-2 mr-8">
                            <Button variant="outline" size="sm" onClick={() => handlePrintInvoice && handlePrintInvoice()}>
                                <FileText className="w-4 h-4 mr-2" /> Invoice
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePrintLabel && handlePrintLabel()}>
                                <Package className="w-4 h-4 mr-2" /> Label
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Items */}
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-right">Qty</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orderDetails.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{item.name}</p>
                                                    {item.customization && <p className="text-xs text-slate-500 mt-0.5">{item.customization}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600">
                                                    {orderDetails.is_custom_quote ? '-' : `₹${item.price?.toLocaleString()}`}
                                                </td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {orderDetails.is_custom_quote ? '-' : `₹${item.total?.toLocaleString()}`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!orderDetails.is_custom_quote && (
                                    <div className="p-4 bg-slate-50/50 flex justify-end">
                                        <div className="w-48 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>₹{totalAmount.toLocaleString()}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-base">
                                                <span>Total</span>
                                                <span>₹{totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline / Notes */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Internal Notes</h3>
                                <div className="bg-amber-50 p-4 rounded-md border border-amber-100 text-sm text-amber-900 whitespace-pre-wrap">
                                    {order.internal_notes || "No internal notes."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Customer</h3>
                                <div className="flex gap-3 items-start">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                        {(customerDetails?.name || order.customer_name).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{customerDetails?.name || order.customer_name}</p>
                                        {customerDetails?.company && (
                                            <p className="text-sm text-slate-600 font-medium">{customerDetails.company}</p>
                                        )}
                                        <p className="text-sm text-slate-500">{customerDetails?.email || order.email}</p>
                                        <p className="text-sm text-slate-500">{customerDetails?.phone || order.phone}</p>
                                        {customerDetails?.gst_number && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                <span className="font-semibold">GST:</span> {customerDetails.gst_number}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">SHIPPING ADDRESS</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-line">{formatAddress(shippingAddress)}</p>
                                </div>
                                {billingAddress && formatAddress(billingAddress) !== formatAddress(shippingAddress) && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">BILLING ADDRESS</p>
                                            <p className="text-sm text-slate-700 whitespace-pre-line">{formatAddress(billingAddress)}</p>
                                        </div>
                                    </>
                                )}
                                {paymentDetails && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">PAYMENT METHOD</p>
                                            <p className="text-sm text-slate-700 capitalize">{paymentDetails.payment_type.replace(/_/g, ' ')}</p>
                                            <Badge variant={paymentDetails.payment_status === 'paid' ? 'default' : 'secondary'} className="mt-1 text-xs">
                                                {paymentDetails.payment_status}
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Order Status</h3>
                                <select
                                    className="w-full p-2 border rounded-md text-sm bg-white"
                                    value={order.status}
                                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                                >
                                    <option value="new">New</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <p className="text-xs text-slate-400">Update status to trigger notifications.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Hidden Print Content - Positioned off-screen to ensure render for capture */}
                <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
                    <div ref={invoiceRef}>
                        <InvoiceTemplate order={orderDetails} settings={settings} />
                    </div>
                    <div ref={labelRef}>
                        <ShippingLabel order={orderDetails} settings={settings} />
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        new: "bg-blue-100 text-blue-800",
        processing: "bg-purple-100 text-purple-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800"
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${styles[status as keyof typeof styles] || "bg-gray-100"}`}>{status}</span>;
}

// Helper to fake address from notes if not in DB yet
const extractAddress = (notes: string, prefix: string) => {
    // Very basic extraction for fallback
    const lines = notes.split('\n');
    const start = lines.findIndex(l => l.includes(prefix));
    if (start === -1) return "Address pending";
    // naive
    return lines.slice(start, start + 3).join('\n').replace(prefix, '').trim();
}
