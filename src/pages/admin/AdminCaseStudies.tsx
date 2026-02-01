
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    FileText,
    Building2,
    Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const MOCK_CASE_STUDIES = [
    {
        id: '1',
        title: 'Mega-scale Warehouse Racking',
        client: 'Amazon India',
        industry: 'Logistics',
        status: 'Published',
        date: '2024-03-15',
        is_mock: true
    },
    {
        id: '2',
        title: 'Automated Assembly Line',
        client: 'Maruti Suzuki',
        industry: 'Automotive',
        status: 'Draft',
        date: '2024-03-10',
        is_mock: true
    },
    {
        id: '3',
        title: 'Hospital Storage Solutions',
        client: 'Apollo Hospitals',
        industry: 'Healthcare',
        status: 'Published',
        date: '2024-02-28',
        is_mock: true
    }
];

const AdminCaseStudies = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [useMockData, setUseMockData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [realCaseStudies, setRealCaseStudies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data from Supabase
    const fetchCaseStudies = async () => {
        if (useMockData) return;

        setIsLoading(true);
        try {
            // @ts-ignore
            const { data, error } = await supabase
                .from('case_studies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching case studies:', error);
                toast({
                    title: "Error",
                    description: "Failed to load case studies. " + error.message,
                    variant: "destructive",
                });
            } else {
                setRealCaseStudies(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!useMockData) {
            fetchCaseStudies();
        }
    }, [useMockData]);

    const data = useMockData ? MOCK_CASE_STUDIES : realCaseStudies.map(item => ({
        ...item,
        client: item.client_name, // Map DB field to UI expectation
        date: new Date(item.created_at).toLocaleDateString(), // Format date
        is_mock: false
    }));

    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.client || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this case study?')) {
            if (useMockData) {
                console.log('Delete mock', id);
                toast({
                    title: "Mock Delete",
                    description: "Item would be deleted in production.",
                });
            } else {
                try {
                    // @ts-ignore
                    const { error } = await supabase
                        .from('case_studies')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    toast({
                        title: "Success",
                        description: "Case study deleted successfully.",
                    });
                    fetchCaseStudies();
                } catch (error: any) {
                    toast({
                        title: "Error",
                        description: "Failed to delete case study: " + error.message,
                        variant: "destructive",
                    });
                }
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Case Studies</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your project portfolio and success stories.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 p-2 rounded-lg">
                        <Switch id="mock-mode" checked={useMockData} onCheckedChange={setUseMockData} />
                        <Label htmlFor="mock-mode" className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-300">Mock Data</Label>
                    </div>
                    <Button onClick={() => navigate('/admin/case-studies/new')} className="bg-brand-orange hover:bg-brand-orange-dark text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Case Study
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search by title or client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Title</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Client</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Industry</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Date</TableHead>
                            <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500 dark:text-slate-400">
                                    Loading case studies...
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800 transition-colors">
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <span>{item.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Building2 className="w-3 h-3" />
                                            {item.client}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.industry}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={item.status === 'Published' ? 'default' : 'secondary'}
                                            className={item.status === 'Published'
                                                ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 border-0'
                                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-0'}
                                        >
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            {item.date}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-800">
                                                <DropdownMenuLabel className="dark:text-slate-300">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigate(`/admin/case-studies/${item.id}`)} className="cursor-pointer dark:focus:bg-slate-800 dark:text-slate-300">
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`/company/case-studies/${item.slug || item.id}`, '_blank')} className="cursor-pointer dark:focus:bg-slate-800 dark:text-slate-300">
                                                    <Eye className="w-4 h-4 mr-2" /> View Live
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="dark:bg-slate-800" />
                                                <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer dark:focus:bg-red-900/10" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500 dark:text-slate-400">
                                    No case studies found.
                                    {!useMockData && (
                                        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                            If you haven't created the table yet, run the migration script.
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminCaseStudies;
