import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FaasQuoteRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
    metalType?: string | null;
    prefilledData?: {
        duration: string;
        quantity: string;
        usage: string;
    };
}

export function FaasQuoteRequestDialog({
    open,
    onOpenChange,
    productId,
    productName,
    metalType,
    prefilledData
}: FaasQuoteRequestDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        companyName: '',
        gstNumber: '',
        deliveryAddress: '',
        city: '',
        state: '',
        pincode: '',
        specialRequirements: ''
    });

    // Helper function to generate quotation number
    const generateQuotationNumber = async (): Promise<string> => {
        // Casting supabase to any to avoid type errors since the RPC function is not yet in the generated types
        const { data, error } = await (supabase as any).rpc('generate_quotation_number');
        if (error) {
            console.error('Error generating quotation number:', error);
            // Fallback unique ID if RPC fails
            return `FQ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        }
        return data as string;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate quotation number
            const quotationNumber = await generateQuotationNumber();

            // Insert without selecting return data (avoids RLS permission issues for public users)
            const { error } = await (supabase as any)
                .from('faas_quotations')
                .insert({
                    quotation_number: quotationNumber,
                    product_id: productId,
                    product_name: productName,
                    metal_type: metalType,
                    rental_duration: prefilledData?.duration || 'monthly',
                    quantity: parseInt(prefilledData?.quantity || '1'),
                    usage_context: prefilledData?.usage || 'office',
                    customer_name: formData.customerName,
                    customer_email: formData.customerEmail,
                    customer_phone: formData.customerPhone,
                    company_name: formData.companyName,
                    gst_number: formData.gstNumber,
                    delivery_address: formData.deliveryAddress,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    special_requirements: formData.specialRequirements,
                    status: 'pending'
                });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            toast.success('Quote request submitted successfully!', {
                description: `Your quotation number is ${quotationNumber}. We'll contact you within 24 hours.`
            });

            onOpenChange(false);

            // Reset form
            setFormData({
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                companyName: '',
                gstNumber: '',
                deliveryAddress: '',
                city: '',
                state: '',
                pincode: '',
                specialRequirements: ''
            });

        } catch (error: any) {
            console.error('Error submitting quote request:', error);
            toast.error('Failed to submit quote request: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Request FaaS Quotation</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Product Summary */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Product Details</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <p><strong className="text-slate-900 dark:text-slate-200">Product:</strong> {productName}</p>
                            <p><strong className="text-slate-900 dark:text-slate-200">Details:</strong> {metalType || 'Standard'}</p>
                            <p><strong className="text-slate-900 dark:text-slate-200">Duration:</strong> <span className="capitalize">{prefilledData?.duration}</span></p>
                            <p><strong className="text-slate-900 dark:text-slate-200">Quantity:</strong> {prefilledData?.quantity} units</p>
                            <p><strong className="text-slate-900 dark:text-slate-200">Usage:</strong> <span className="capitalize">{prefilledData?.usage}</span></p>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Full Name *</Label>
                            <Input
                                id="customerName"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerEmail">Email *</Label>
                            <Input
                                id="customerEmail"
                                type="email"
                                required
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">Phone *</Label>
                            <Input
                                id="customerPhone"
                                type="tel"
                                required
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                            <Input
                                id="gstNumber"
                                value={formData.gstNumber}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                        <Textarea
                            id="deliveryAddress"
                            required
                            value={formData.deliveryAddress}
                            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                            className="bg-white dark:bg-slate-950 min-h-[80px]"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                required
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                                id="pincode"
                                required
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                    </div>

                    {/* Special Requirements */}
                    <div className="space-y-2">
                        <Label htmlFor="specialRequirements">Special Requirements</Label>
                        <Textarea
                            id="specialRequirements"
                            value={formData.specialRequirements}
                            onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                            placeholder="Any specific requirements or questions..."
                            className="bg-white dark:bg-slate-950 min-h-[80px]"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white">
                            {loading ? 'Submitting...' : 'Submit Quote Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
