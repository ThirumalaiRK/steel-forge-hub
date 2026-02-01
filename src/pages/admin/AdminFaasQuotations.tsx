import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Eye, Download, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { downloadQuotationPDF, QuotationData } from '@/utils/faasQuotationPDF';
import { FaasQuotationDetailsDialog } from '@/components/admin/faas/FaasQuotationDetailsDialog';

export default function AdminFaasQuotations() {
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        fetchQuotations();
    }, [filter]);

    const fetchQuotations = async () => {
        setLoading(true);
        try {
            let query = (supabase as any)
                .from('faas_quotations')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setQuotations(data || []);
        } catch (error) {
            console.error('Error fetching quotations:', error);
            toast.error('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (quotation: any) => {
        try {
            const quotationData: QuotationData = {
                quotationNumber: quotation.quotation_number,
                date: new Date(quotation.created_at).toLocaleDateString(),
                validUntil: quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : '30 Days from Date',
                customerName: quotation.customer_name,
                customerEmail: quotation.customer_email,
                customerPhone: quotation.customer_phone || '',
                companyName: quotation.company_name,
                gstNumber: quotation.gst_number,
                deliveryAddress: quotation.delivery_address || '',
                city: quotation.city || '',
                state: quotation.state || '',
                pincode: quotation.pincode || '',
                productName: quotation.product_name,
                metalType: quotation.metal_type,
                rentalDuration: quotation.rental_duration,
                quantity: quotation.quantity,
                monthlyRental: quotation.monthly_rental_amount || 0,
                setupFee: quotation.setup_fee || 0,
                depositAmount: quotation.deposit_amount || 0,
                totalAmount: quotation.total_amount || 0,
                specialRequirements: quotation.special_requirements
            };

            downloadQuotationPDF(quotationData);
            toast.success('PDF Downloaded');
        } catch (e) {
            console.error("PDF Gen Error", e);
            toast.error("Failed to generate PDF");
        }
    };

    const handleViewDetails = (quotation: any) => {
        setSelectedQuotation(quotation);
        setDetailsOpen(true);
    };

    const handleDelete = async (quotation: any) => {
        if (!confirm(`Are you sure you want to delete quotation ${quotation.quotation_number}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await (supabase as any)
                .from('faas_quotations')
                .delete()
                .eq('id', quotation.id);

            if (error) throw error;

            toast.success('Quotation deleted successfully');
            fetchQuotations(); // Refresh list
        } catch (error) {
            console.error('Error deleting quotation:', error);
            toast.error('Failed to delete quotation');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: 'bg-yellow-500 hover:bg-yellow-600',
            quoted: 'bg-blue-500 hover:bg-blue-600',
            accepted: 'bg-green-500 hover:bg-green-600',
            rejected: 'bg-red-500 hover:bg-red-600',
            expired: 'bg-gray-500 hover:bg-gray-600'
        };
        return <Badge className={variants[status] || 'bg-gray-500'}>{status.toUpperCase()}</Badge>;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">FaaS Quotations</h1>
                    <p className="text-muted-foreground">Manage and track FaaS quotation requests</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-xl">All Quotations</CardTitle>
                        <div className="flex gap-2">
                            {['all', 'pending', 'quoted', 'accepted', 'rejected'].map((status) => (
                                <Button
                                    key={status}
                                    variant={filter === status ? 'default' : 'outline'}
                                    onClick={() => setFilter(status)}
                                    size="sm"
                                    className="capitalize"
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">Loading quotations...</div>
                    ) : quotations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No quotations found.</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Quotation #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotations.map((quotation) => (
                                        <TableRow key={quotation.id}>
                                            <TableCell className="font-mono font-medium whitespace-nowrap">{quotation.quotation_number}</TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate" title={quotation.customer_name}>{quotation.customer_name}</span>
                                                    <span className="text-xs text-muted-foreground truncate" title={quotation.customer_email}>{quotation.customer_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <div className="flex flex-col">
                                                    <span className="truncate" title={quotation.product_name}>{quotation.product_name}</span>
                                                    <span className="text-xs text-muted-foreground">{quotation.quantity} units • {quotation.metal_type || 'Standard'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{quotation.rental_duration}</TableCell>
                                            <TableCell className="text-center">{getStatusBadge(quotation.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(quotation.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="View Details"
                                                        onClick={() => handleViewDetails(quotation)}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                                                        title="Download PDF"
                                                        onClick={() => handleDownloadPDF(quotation)}
                                                    >
                                                        <Download size={16} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Delete Quotation"
                                                        onClick={() => handleDelete(quotation)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <FaasQuotationDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                quotation={selectedQuotation}
                onUpdate={fetchQuotations}
            />
        </div>
    );
}
