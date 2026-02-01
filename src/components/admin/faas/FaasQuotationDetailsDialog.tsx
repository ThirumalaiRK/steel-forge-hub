import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, User, Package, MapPin, DollarSign, FileText } from "lucide-react";

interface FaasQuotationDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quotation: any;
    onUpdate: () => void;
}

export function FaasQuotationDetailsDialog({
    open,
    onOpenChange,
    quotation,
    onUpdate,
}: FaasQuotationDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        status: "",
        monthly_rental_amount: "",
        deposit_amount: "",
        setup_fee: "",
        discount_percentage: "",
        valid_until: "",
        admin_notes: "",
    });

    useEffect(() => {
        if (quotation) {
            setFormData({
                status: quotation.status || "pending",
                monthly_rental_amount: quotation.monthly_rental_amount || "",
                deposit_amount: quotation.deposit_amount || "",
                setup_fee: quotation.setup_fee || "0",
                discount_percentage: quotation.discount_percentage || "0",
                valid_until: quotation.valid_until ? new Date(quotation.valid_until).toISOString().split('T')[0] : "",
                admin_notes: quotation.admin_notes || "",
            });
        }
    }, [quotation]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Calculate total amount roughly (monthly + setup - discount) just for record, 
            // but logic might vary. Let's just sum it up for now or let admin enter it manually?
            // For simplicity, let's keep total_amount as auto-calculated or just ignore specific complex logic for now.

            const monthly = parseFloat(formData.monthly_rental_amount || "0");
            const setup = parseFloat(formData.setup_fee || "0");
            const deposit = parseFloat(formData.deposit_amount || "0");
            const discount = parseFloat(formData.discount_percentage || "0");

            // Simple logic: First month total = (Monthly * 1) + Setup + Deposit - (Discount on Monthly?)
            // Let's just update the fields provided.
            const total = monthly + setup + deposit; // Basic total

            const { error } = await (supabase as any)
                .from("faas_quotations")
                .update({
                    status: formData.status,
                    monthly_rental_amount: monthly || null,
                    deposit_amount: deposit || null,
                    setup_fee: setup || 0,
                    discount_percentage: discount || 0,
                    total_amount: total,
                    valid_until: formData.valid_until || null,
                    admin_notes: formData.admin_notes,
                    quoted_at: formData.status === "quoted" && quotation.status !== "quoted" ? new Date().toISOString() : quotation.quoted_at,
                    accepted_at: formData.status === "accepted" && quotation.status !== "accepted" ? new Date().toISOString() : quotation.accepted_at,
                })
                .eq("id", quotation.id);

            if (error) throw error;

            toast.success("Quotation updated successfully");
            onUpdate();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error updating quotation:", error);
            toast.error("Failed to update quotation");
        } finally {
            setLoading(false);
        }
    };

    if (!quotation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {quotation.quotation_number}
                                <Badge variant={
                                    quotation.status === 'pending' ? 'secondary' :
                                        quotation.status === 'quoted' ? 'default' :
                                            quotation.status === 'accepted' ? 'outline' : 'destructive'
                                }>
                                    {quotation.status?.toUpperCase()}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                Created on {new Date(quotation.created_at).toLocaleDateString()}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid md:grid-cols-12 gap-6 mt-6">

                    {/* LEFT COLUMN - REQUEST DETAILS (READ ONLY) */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <div className="bg-slate-50 dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b">
                                <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    <FileText size={18} className="text-brand-orange" /> Request Details
                                </h3>
                            </div>

                            <div className="p-4 space-y-6 flex-1 overflow-y-auto max-h-[600px]">
                                {/* Customer Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <User size={14} /> Customer
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-medium">{quotation.customer_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium text-right break-all max-w-[180px]">{quotation.customer_email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span className="font-medium">{quotation.customer_phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Company:</span>
                                            <span className="font-medium">{quotation.company_name || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">GST:</span>
                                            <span className="font-medium">{quotation.gst_number || "-"}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Product Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Package size={14} /> Product Configuration
                                    </h4>
                                    <div className="bg-white dark:bg-black border rounded-lg p-3 space-y-2 text-sm">
                                        <div className="font-medium text-brand-orange">{quotation.product_name}</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground block">Metal:</span>
                                                <span>{quotation.metal_type || "Standard"}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Qty:</span>
                                                <span>{quotation.quantity} units</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Duration:</span>
                                                <span className="capitalize">{quotation.rental_duration}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Context:</span>
                                                <span className="capitalize">{quotation.usage_context}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {quotation.special_requirements && (
                                        <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/30">
                                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-500 block mb-1">Requirements:</span>
                                            <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                                                "{quotation.special_requirements}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Address Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <MapPin size={14} /> Delivery Location
                                    </h4>
                                    <p className="text-sm bg-slate-100 dark:bg-slate-950 p-3 rounded text-slate-700 dark:text-slate-300 leading-relaxed border-l-2 border-slate-300">
                                        {quotation.delivery_address}<br />
                                        {quotation.city}, {quotation.state}<br />
                                        Pincode: {quotation.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - ACTIONS & PRICING (WRITE) */}
                    <div className="md:col-span-7 flex flex-col gap-6">

                        {/* Status Panel */}
                        <div className="bg-white dark:bg-slate-950 border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Workflow Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase">Current Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">🟡 Pending Review</SelectItem>
                                            <SelectItem value="quoted">🔵 Quote Sent</SelectItem>
                                            <SelectItem value="accepted">🟢 Approved / Accepted</SelectItem>
                                            <SelectItem value="rejected">🔴 Rejected</SelectItem>
                                            <SelectItem value="expired">⚫ Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase">Quote Validity</Label>
                                    <Input
                                        type="date"
                                        className="h-10"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Panel */}
                        <div className="bg-white dark:bg-slate-950 border rounded-xl shadow-lg shadow-brand-orange/5 overflow-hidden flex-1 flex flex-col">
                            <div className="bg-brand-orange/10 border-b border-brand-orange/20 p-4 flex justify-between items-center">
                                <h3 className="font-semibold text-brand-orange-dark flex items-center gap-2">
                                    <DollarSign size={18} /> Pricing Configurator
                                </h3>
                                <Badge variant="outline" className="bg-white text-brand-orange border-brand-orange/30">
                                    Secure
                                </Badge>
                            </div>

                            <div className="p-5 grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label>Monthly Rental (₹)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-7 font-mono text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            placeholder="0.00"
                                            value={formData.monthly_rental_amount}
                                            onChange={(e) => setFormData({ ...formData, monthly_rental_amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Security Deposit (Refundable)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-7 font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            placeholder="0.00"
                                            value={formData.deposit_amount}
                                            onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Setup / Logistics Fee</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-7 font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            placeholder="0.00"
                                            value={formData.setup_fee}
                                            onChange={(e) => setFormData({ ...formData, setup_fee: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Discount (%)</Label>
                                    <div className="relative">
                                        <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                                        <Input
                                            type="number"
                                            className="font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            placeholder="0"
                                            value={formData.discount_percentage}
                                            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase">Total Payable (1st Payment)</p>
                                        <p className="text-xs text-slate-400">Includes 1st Month + Setup + Deposit</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold text-brand-orange block">
                                            ₹ {((parseFloat(formData.monthly_rental_amount || "0") + parseFloat(formData.setup_fee || "0") + parseFloat(formData.deposit_amount || "0"))).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase">Internal Notes</Label>
                            <Textarea
                                placeholder="Private notes for admin team..."
                                className="resize-none h-20 bg-yellow-50/50 dark:bg-yellow-950/10 dark:text-yellow-200 border-yellow-100 dark:border-yellow-900/30 placeholder:text-yellow-700/30 dark:placeholder:text-yellow-500/30"
                                value={formData.admin_notes}
                                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-brand-orange hover:bg-brand-orange-dark text-white">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
