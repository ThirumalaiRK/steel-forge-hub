import { format } from "date-fns";
import { SiteSettings } from "@/hooks/use-site-settings";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price?: number;
    total?: number;
    customization?: string;
    sku?: string;
}

export interface OrderDetails {
    id: string;
    created_at: string;
    customer_name: string;
    email?: string;
    phone?: string;
    billing_address?: string;
    shipping_address?: string;
    status: string;
    payment_status?: string;
    items: OrderItem[];
    subtotal?: number;
    tax?: number;
    shipping_cost?: number;
    discount?: number;
    total?: number;
    is_custom_quote?: boolean;
}

interface InvoiceTemplateProps {
    order: OrderDetails;
    settings: SiteSettings | null;
}

export const InvoiceTemplate = ({ order, settings }: InvoiceTemplateProps) => {
    const formatDate = (date: string) => format(new Date(date), "dd MMM, yyyy");

    return (
        <div className="bg-white text-slate-800 p-0 max-w-[850px] mx-auto font-sans shadow-none print:shadow-none" id="printable-invoice">
            {/* Top Brand Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-orange to-brand-yellow print:print-color-adjust-exact"></div>

            <div className="p-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-6">
                        {/* Branding & Logo */}
                        <div className="flex flex-col items-start gap-4">
                            <img
                                src={settings?.logo_dark || "/airs_log.png"}
                                alt="Company Logo"
                                className="h-20 w-auto object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            {/* Fallback Text Logo */}
                            <div className="hidden">
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900">AiRS</h1>
                                <p className="text-xs font-bold tracking-[0.2em] text-brand-orange uppercase">Ai Robo Fab Solutions</p>
                            </div>
                        </div>

                        {/* Company Details (Sender) */}
                        <div className="text-sm text-slate-500 space-y-1">
                            <p className="font-bold text-xl text-slate-900">{(settings as any)?.site_name === "Steel Forge Hub" ? "AiRS - Ai Robo Fab Solutions" : ((settings as any)?.site_name || "AiRS - Ai Robo Fab Solutions")}</p>
                            <p className="w-64 leading-relaxed">{settings?.address || "123 Industrial Estate, Tech City"}</p>
                            <div className="text-slate-600 gap-3 pt-2">
                                {settings?.email && (
                                    <div className="flex items-center gap-2"><Mail size={14} /> {settings.email}</div>
                                )}
                                {settings?.phone_number && (
                                    <div className="flex items-center gap-2 mt-1"><Phone size={14} /> {settings.phone_number}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-5xl font-light text-slate-200 tracking-wider mb-2">INVOICE</h2>
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-slate-700">
                                #{order.id.startsWith('AIRS-') ? order.id : order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-sm text-slate-500">Date: {formatDate(order.created_at)}</p>
                            {order.payment_status && (
                                <div className="pt-2">
                                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${order.payment_status === 'paid'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        } print:print-color-adjust-exact`}>
                                        {order.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12 border-t border-b border-slate-100 py-8">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bill To</h3>
                        <div className="space-y-1.5">
                            <p className="text-lg font-bold text-slate-800">{order.customer_name}</p>
                            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                                {order.billing_address || "Address pending"}
                            </p>
                            <div className="text-sm text-slate-500 mt-2 space-y-0.5">
                                {order.email && <p>{order.email}</p>}
                                {order.phone && <p>{order.phone}</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ship To</h3>
                        <div className="space-y-1.5">
                            <p className="text-lg font-bold text-slate-800">{order.customer_name}</p>
                            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                                {order.shipping_address || order.billing_address || "Same as billing address"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-10">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 print:print-color-adjust-exact">
                                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Description</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Qty</th>
                                {!order.is_custom_quote && (
                                    <>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Price</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Total</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                        {item.customization && (
                                            <p className="text-xs text-slate-500 mt-1 italic pl-2 border-l-2 border-brand-orange/30">
                                                Specs: {item.customization}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center text-sm text-slate-600">{item.quantity}</td>
                                    {!order.is_custom_quote && (
                                        <>
                                            <td className="py-4 px-4 text-right text-sm text-slate-600">₹{item.price?.toLocaleString()}</td>
                                            <td className="py-4 px-4 text-right text-sm font-bold text-slate-800">
                                                ₹{(item.total ?? ((item.price || 0) * item.quantity)).toLocaleString()}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-16 px-4">
                    <div className="w-80 space-y-3">
                        {!order.is_custom_quote ? (
                            <>
                                <div className="flex justify-between text-sm text-slate-500 pb-3 border-b border-slate-100">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-800">₹{order.subtotal?.toLocaleString() ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-bold text-slate-900">Total Due</span>
                                    <span className="text-xl font-black text-brand-orange">₹{order.total?.toLocaleString() ?? 0}</span>
                                </div>
                            </>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center print:print-color-adjust-exact">
                                <p className="font-bold text-slate-800 mb-1">Custom Quote</p>
                                <p className="text-xs text-slate-500">Pricing determined by contract terms.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto border-t-2 border-slate-100 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div className="text-xs text-slate-400 max-w-md">
                            <p className="font-medium text-slate-600 mb-1">Terms & Conditions</p>
                            <p>Payment due within 30 days. Please include invoice number on your check.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-slate-200 tracking-widest">AiRS</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Industrial Excellence</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
