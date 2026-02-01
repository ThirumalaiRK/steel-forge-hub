import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export interface QuotationData {
    quotationNumber: string;
    date: string;
    validUntil: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    companyName?: string;
    gstNumber?: string;
    deliveryAddress: string;
    city: string;
    state: string;
    pincode: string;
    productName: string;
    metalType?: string;
    rentalDuration: string;
    quantity: number;
    monthlyRental: number;
    setupFee: number;
    depositAmount: number;
    totalAmount: number;
    specialRequirements?: string;
}

export function generateFaasQuotationPDF(data: QuotationData) {
    const doc = new jsPDF();

    // Company Header
    doc.setFillColor(251, 146, 60); // brand-orange
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AiRS', 15, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Ai Robo Fab Solutions', 15, 28);
    doc.text('Furniture as a Service', 15, 34);

    // Quotation Number
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Quotation #${data.quotationNumber}`, 150, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${data.date}`, 150, 27, { align: 'right' });
    doc.text(`Valid Until: ${data.validUntil}`, 150, 32, { align: 'right' });

    // Customer Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 62;
    doc.text(data.customerName, 15, yPos);
    if (data.companyName) {
        yPos += 5;
        doc.text(data.companyName, 15, yPos);
    }
    yPos += 5;
    doc.text(data.customerEmail, 15, yPos);
    yPos += 5;
    doc.text(data.customerPhone, 15, yPos);

    // Delivery Address
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const splitAddress = doc.splitTextToSize(data.deliveryAddress, 80);
    doc.text(splitAddress, 15, yPos);
    yPos += (splitAddress.length * 4) + 1; // Adjust for multiline address
    doc.text(`${data.city}, ${data.state} - ${data.pincode}`, 15, yPos);

    // Product Details Table
    yPos += 15;
    autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Metal Type', 'Duration', 'Quantity', 'Monthly Rate']],
        body: [[
            data.productName,
            data.metalType || 'Industrial Grade',
            data.rentalDuration.charAt(0).toUpperCase() + data.rentalDuration.slice(1),
            `${data.quantity} units`,
            `INR ${data.monthlyRental.toLocaleString('en-IN')}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [251, 146, 60], textColor: 255 },
    });

    // Pricing Breakdown
    yPos = (doc as any).lastAutoTable.finalY + 15;

    const lineItems = [
        ['Monthly Rental', `INR ${data.monthlyRental.toLocaleString('en-IN')}`],
        ['Setup Fee (One-time)', `INR ${data.setupFee.toLocaleString('en-IN')}`],
        ['Security Deposit (Refundable)', `INR ${data.depositAmount.toLocaleString('en-IN')}`],
    ];

    autoTable(doc, {
        startY: yPos,
        body: lineItems,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
            0: { halign: 'right', cellWidth: 140 },
            1: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
        }
    });

    // Total
    yPos = (doc as any).lastAutoTable.finalY + 5;
    doc.setFillColor(251, 146, 60);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Payable', 155, yPos + 7, { align: 'right' });
    doc.text(`INR ${data.totalAmount.toLocaleString('en-IN')}`, 195, yPos + 7, { align: 'right' });

    // Terms & Conditions
    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = [
        '1. Monthly rental is billed in advance',
        '2. Security deposit is refundable upon return of equipment',
        '3. Free maintenance and repairs included',
        '4. Minimum rental period: 1 month',
        '5. Delivery and installation included',
        '6. This quotation is valid for 30 days'
    ];

    terms.forEach((term, index) => {
        doc.text(term, 15, yPos + (index * 5));
    });

    // Footer
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(0, 270, 210, 27, 'F');

    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(8);
    doc.text('AiRS - Ai Robo Fab Solutions | www.airs.com | contact@airs.com', 105, 280, { align: 'center' });
    doc.text('Thank you for choosing FaaS!', 105, 285, { align: 'center' });

    return doc;
}

// Usage
export function downloadQuotationPDF(data: QuotationData) {
    const doc = generateFaasQuotationPDF(data);
    doc.save(`AiRS-FaaS-Quotation-${data.quotationNumber}.pdf`);
}

export function emailQuotationPDF(data: QuotationData, email: string) {
    // const doc = generateFaasQuotationPDF(data);
    // const pdfBlob = doc.output('blob');

    // Placeholder for email handling - usually done server-side
    toast.info(`PDF generated for email to ${email}. Check backend logs.`);
}


