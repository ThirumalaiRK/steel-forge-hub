import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle2, Building2, CreditCard, Banknote, FileText, TestTube2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface CheckoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    cartTotal: number;
    cart: any[];
    onOrderSuccess: () => void;
}

export const EnhancedCheckoutDialog = ({ isOpen, onClose, cartTotal, cart, onOrderSuccess }: CheckoutDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('form'); // form | success
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        // Customer Details
        name: "",
        email: "",
        phone: "",
        company: "",
        gstNumber: "",

        // Shipping Address
        shippingAddress1: "",
        shippingAddress2: "",
        shippingCity: "",
        shippingState: "",
        shippingPostalCode: "",
        shippingCountry: "India",

        // Billing Address
        billingSameAsShipping: true,
        billingAddress1: "",
        billingAddress2: "",
        billingCity: "",
        billingState: "",
        billingPostalCode: "",
        billingCountry: "India",

        // Payment & Notes
        paymentType: "pay_on_delivery",
        orderNotes: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData({ ...formData, billingSameAsShipping: checked });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Generate Sequential Order ID
            let nextOrderNumber = "0001";
            try {
                const { data: lastOrder } = await supabase
                    .from('orders')
                    .select('order_number')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (lastOrder?.order_number) {
                    const parts = lastOrder.order_number.split('-');
                    const lastNum = parseInt(parts[parts.length - 1]);
                    if (!isNaN(lastNum)) {
                        nextOrderNumber = (lastNum + 1).toString().padStart(4, '0');
                    }
                }
            } catch (err) {
                console.warn("Using default ID start", err);
            }

            const currentYear = new Date().getFullYear();
            const fullOrderNumber = `AiRS-IN-ORD-${currentYear}-${nextOrderNumber}`;

            // 2. Create main order
            const orderData = {
                customer_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                order_type: 'purchase' as const,
                status: 'new' as const,
                order_status: 'pending',
                products: cart,
                order_notes: formData.orderNotes || null,
                created_at: new Date().toISOString(),
                order_number: fullOrderNumber,
            };

            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (orderError) throw orderError;
            if (!newOrder) throw new Error("Failed to create order");

            const orderId = newOrder.id;

            // 3. Insert customer details
            const { error: customerError } = await supabase
                .from('order_customer_details')
                .insert([{
                    order_id: orderId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company || null,
                    gst_number: formData.gstNumber || null,
                }]);

            if (customerError) console.error("Customer details error:", customerError);

            // 4. Insert shipping address
            const { error: shippingError } = await supabase
                .from('order_addresses')
                .insert([{
                    order_id: orderId,
                    address_type: 'shipping',
                    address_line_1: formData.shippingAddress1,
                    address_line_2: formData.shippingAddress2 || null,
                    city: formData.shippingCity,
                    state: formData.shippingState,
                    postal_code: formData.shippingPostalCode,
                    country: formData.shippingCountry,
                    phone: formData.phone,
                }]);

            if (shippingError) console.error("Shipping address error:", shippingError);

            // 5. Insert billing address
            const billingData = formData.billingSameAsShipping ? {
                order_id: orderId,
                address_type: 'billing',
                address_line_1: formData.shippingAddress1,
                address_line_2: formData.shippingAddress2 || null,
                city: formData.shippingCity,
                state: formData.shippingState,
                postal_code: formData.shippingPostalCode,
                country: formData.shippingCountry,
                phone: formData.phone,
            } : {
                order_id: orderId,
                address_type: 'billing',
                address_line_1: formData.billingAddress1,
                address_line_2: formData.billingAddress2 || null,
                city: formData.billingCity,
                state: formData.billingState,
                postal_code: formData.billingPostalCode,
                country: formData.billingCountry,
                phone: formData.phone,
            };

            const { error: billingError } = await supabase
                .from('order_addresses')
                .insert([billingData]);

            if (billingError) console.error("Billing address error:", billingError);

            // 6. Insert payment details
            const { error: paymentError } = await supabase
                .from('order_payment_details')
                .insert([{
                    order_id: orderId,
                    payment_type: formData.paymentType,
                    payment_status: 'unpaid',
                }]);

            if (paymentError) console.error("Payment details error:", paymentError);

            // 7. Create notification
            await supabase.from('notifications').insert({
                type: 'order',
                title: 'New Order Received',
                message: `Order #${fullOrderNumber} from ${formData.name}`,
                reference_id: orderId,
                is_read: false
            });

            setStep('success');
            onOrderSuccess();

            toast({
                title: "Order Placed Successfully!",
                description: `Order #${fullOrderNumber} has been created.`,
            });

        } catch (error) {
            console.error('Order failed:', error);
            toast({
                title: "Order Failed",
                description: "There was an error placing your order. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep('form');
        setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            gstNumber: "",
            shippingAddress1: "",
            shippingAddress2: "",
            shippingCity: "",
            shippingState: "",
            shippingPostalCode: "",
            shippingCountry: "India",
            billingSameAsShipping: true,
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingPostalCode: "",
            billingCountry: "India",
            paymentType: "pay_on_delivery",
            orderNotes: ""
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Lock className="w-5 h-5 text-brand-orange" /> Secure Checkout
                            </DialogTitle>
                            <DialogDescription>
                                Complete your purchase by providing your details. <br />
                                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">TEST MODE: No payment required</span>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            {/* Customer Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Building2 size={18} className="text-brand-orange" />
                                    Customer Details
                                </h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input id="name" name="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input id="email" name="email" type="email" placeholder="john@company.com" required value={formData.email} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input id="phone" name="phone" placeholder="+91 98765 43210" required value={formData.phone} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Name</Label>
                                            <Input id="company" name="company" placeholder="Acme Industries Ltd." value={formData.company} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gstNumber">GST Number</Label>
                                            <Input id="gstNumber" name="gstNumber" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Shipping Address */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <FileText size={18} className="text-brand-orange" />
                                    Shipping Address
                                </h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shippingAddress1">Address Line 1 *</Label>
                                        <Input id="shippingAddress1" name="shippingAddress1" placeholder="Street address, P.O. box" required value={formData.shippingAddress1} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shippingAddress2">Address Line 2</Label>
                                        <Input id="shippingAddress2" name="shippingAddress2" placeholder="Apartment, suite, unit, building, floor, etc." value={formData.shippingAddress2} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="shippingCity">City *</Label>
                                            <Input id="shippingCity" name="shippingCity" placeholder="Mumbai" required value={formData.shippingCity} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="shippingState">State *</Label>
                                            <Input id="shippingState" name="shippingState" placeholder="Maharashtra" required value={formData.shippingState} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="shippingPostalCode">Postal Code *</Label>
                                            <Input id="shippingPostalCode" name="shippingPostalCode" placeholder="400001" required value={formData.shippingPostalCode} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="shippingCountry">Country</Label>
                                            <Input id="shippingCountry" name="shippingCountry" value={formData.shippingCountry} onChange={handleChange} disabled className="bg-slate-50" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Billing Address */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="billingSame"
                                        checked={formData.billingSameAsShipping}
                                        onCheckedChange={handleCheckboxChange}
                                    />
                                    <label
                                        htmlFor="billingSame"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Billing address same as shipping
                                    </label>
                                </div>

                                {!formData.billingSameAsShipping && (
                                    <div className="grid gap-4 pl-6 border-l-2 border-slate-200">
                                        <h3 className="font-semibold">Billing Address</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingAddress1">Address Line 1 *</Label>
                                            <Input id="billingAddress1" name="billingAddress1" placeholder="Street address" required value={formData.billingAddress1} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingAddress2">Address Line 2</Label>
                                            <Input id="billingAddress2" name="billingAddress2" placeholder="Apartment, suite" value={formData.billingAddress2} onChange={handleChange} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="billingCity">City *</Label>
                                                <Input id="billingCity" name="billingCity" placeholder="Mumbai" required value={formData.billingCity} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="billingState">State *</Label>
                                                <Input id="billingState" name="billingState" placeholder="Maharashtra" required value={formData.billingState} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="billingPostalCode">Postal Code *</Label>
                                                <Input id="billingPostalCode" name="billingPostalCode" placeholder="400001" required value={formData.billingPostalCode} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="billingCountry">Country</Label>
                                                <Input id="billingCountry" name="billingCountry" value={formData.billingCountry} onChange={handleChange} disabled className="bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Payment Method */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <CreditCard size={18} className="text-brand-orange" />
                                    Payment Method
                                </h3>
                                <RadioGroup value={formData.paymentType} onValueChange={(value) => setFormData({ ...formData, paymentType: value })}>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value="pay_on_delivery" id="pod" />
                                        <Label htmlFor="pod" className="flex items-center gap-2 cursor-pointer flex-1">
                                            <Banknote size={16} />
                                            <span>Pay on Delivery / Proforma Invoice</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value="bank_transfer" id="bank" />
                                        <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                                            <Building2 size={16} />
                                            <span>Bank Transfer</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 bg-slate-50 opacity-60">
                                        <RadioGroupItem value="online_payment" id="online" disabled />
                                        <Label htmlFor="online" className="flex items-center gap-2 flex-1">
                                            <CreditCard size={16} />
                                            <span>Online Payment</span>
                                            <span className="text-xs text-slate-500">(Coming Soon)</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value="test_order" id="test" />
                                        <Label htmlFor="test" className="flex items-center gap-2 cursor-pointer flex-1">
                                            <TestTube2 size={16} />
                                            <span>Test Order (Demo)</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Separator />

                            {/* Order Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                                <Textarea
                                    id="orderNotes"
                                    name="orderNotes"
                                    placeholder="Special instructions or delivery notes..."
                                    value={formData.orderNotes}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            {/* Order Summary */}
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tax (GST 18%)</span>
                                    <span className="font-semibold">₹{(cartTotal * 0.18).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-brand-orange">₹{(cartTotal * 1.18).toLocaleString()}</span>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                                <Button type="submit" className="bg-brand-orange hover:bg-brand-orange-dark text-white" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        "Place Order"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h2>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            Your order has been received. Our team will contact you shortly for confirmation.
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={handleClose} className="flex-1">Close</Button>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800 flex-1" asChild>
                                <Link to="/products" onClick={handleClose}>Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
