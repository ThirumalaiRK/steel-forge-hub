import { SiteSettings } from "@/hooks/use-site-settings";
import { OrderDetails } from "./InvoiceTemplate";
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';

interface ShippingLabelProps {
    order: OrderDetails;
    settings: SiteSettings | null;
}

export const ShippingLabel = ({ order, settings }: ShippingLabelProps) => {
    // Standard Shipping Label Size: 4x6 inches
    // Using inline styles for strict print sizing

    // Fallback for ID
    const displayId = order.id.startsWith('AiRS-') ? order.id : `ORD-${order.id.slice(0, 8).toUpperCase()}`;

    return (
        <div
            className="bg-white text-black font-sans box-border relative print:break-after-page overflow-hidden"
            style={{
                width: "4in",
                height: "6in",
                padding: "0.15in",
                border: "1px solid #ddd", // Visible border on screen, print media handles via page size usually
                margin: "0 auto"
            }}
            id="shipping-label"
        >
            {/* 1. HEADER (SENDER) */}
            <div className="border-b-2 border-black pb-2 mb-3">
                <div className="flex justify-between items-start">
                    <div className="text-xs font-bold text-slate-900 uppercase">
                        <span className="text-slate-500 text-[10px] block mb-0.5">FROM:</span>
                        <p>{(settings as any)?.site_name || "AiRS - Ai ROBO FAB"}</p>
                        <p className="font-normal text-[10px] sm:text-[10px]">{settings?.address || "Warehouse / Dispatch Unit"}</p>
                        <p className="font-normal text-[10px]">{settings?.phone_number}</p>
                    </div>
                </div>
            </div>

            {/* 2. DESTINATION (DOMINANT) */}
            <div className="border-b-4 border-black pb-4 mb-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-1">SHIP TO:</h3>
                <div className="pl-2">
                    <p className="text-lg font-black uppercase leading-none mb-1 text-slate-900">
                        {order.customer_name}
                    </p>
                    <p className="text-sm font-medium uppercase text-slate-700 leading-tight whitespace-pre-line mb-2">
                        {order.shipping_address || order.billing_address || "ADDRESS PENDING"}
                    </p>
                    <p className="text-sm font-bold text-slate-900">PH: {order.phone}</p>
                </div>
            </div>

            {/* 3. ORDER & DATE */}
            <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3 mb-3">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">ORDER ID:</p>
                    <p className="text-sm font-black font-mono mt-0.5 break-all leading-tight">
                        {displayId}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">ORDER DATE:</p>
                    <p className="text-sm font-bold mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                    </p>
                </div>
            </div>

            {/* 4. BARCODE ZONE */}
            <div className="flex flex-col items-center justify-center py-4 mb-4 border-b border-dashed border-slate-300">
                <div className="w-full flex justify-center overflow-hidden">
                    <Barcode
                        value={displayId}
                        width={1.5}
                        height={50}
                        fontSize={12}
                        displayValue={false} // showing value separately above for clarity
                        margin={0}
                    />
                </div>
                <p className="text-[10px] font-bold tracking-widest mt-1 uppercase text-slate-600">SCAN FOR ORDER DETAILS</p>
            </div>

            {/* 5. META INFO & QR (Redundant Check) */}
            <div className="flex justify-between items-end mt-auto">
                <div>
                    <div className="border-2 border-black inline-block px-2 py-1 mb-2">
                        <p className="text-xs font-black uppercase">STANDARD SHIPPING</p>
                    </div>
                    <p className="text-xs font-bold uppercase">PACKAGE 1 OF 1</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">AiRS LOGISTICS</p>
                </div>

                <div className="text-right">
                    <QRCodeCanvas value={displayId} size={64} />
                    <p className="text-[8px] font-bold mt-1 text-center">CHECKPOINT</p>
                </div>
            </div>
        </div>
    );
};
