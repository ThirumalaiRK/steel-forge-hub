import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Image as ImageIcon,
    Type,
    Settings,
    BarChart,
    Globe,
    Upload,
    FileText,
    Plus,
    Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminCaseStudyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        client_name: '',
        industry: '',
        location: '',
        duration: '',
        status: 'Draft',
        overview: '',
        challenges: '',
        solution: '',
        materials: '', // kept as string for input, converted to array on save
        processes: [] as string[],
        customization_level: 'Medium',
        meta_title: '',
        meta_description: '',
        slug: '',
        key_results: [] as string[]
    });

    // Load data if edit mode
    useEffect(() => {
        if (!isEditMode) return;

        const loadCaseStudy = async () => {
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!id || !uuidRegex.test(id)) {
                console.warn("Invalid or Mock ID detected:", id);
                // If it's a mock ID (simple number), we could just load static mock data or return
                if (id && ['1', '2', '3'].includes(id)) {
                    toast({
                        title: "Mock Data Detected",
                        description: "You are viewing a mock case study. Actions will not be saved to the database.",
                    });
                    // Optional: You could populate with mock data here if you wanted, 
                    // but for now let's just avoid the crash.
                    return;
                }

                toast({
                    title: "Invalid ID",
                    description: "The case study ID is invalid.",
                    variant: "destructive",
                });
                return;
            }

            setIsLoading(true);
            try {
                // @ts-ignore
                const { data, error } = await supabase
                    .from('case_studies')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data) {
                    const caseData = data as any;
                    setFormData({
                        title: caseData.title || '',
                        client_name: caseData.client_name || '',
                        industry: caseData.industry || '',
                        location: caseData.location || '',
                        duration: caseData.duration || '',
                        status: caseData.status || 'Draft',
                        overview: caseData.overview || '',
                        challenges: caseData.challenges || '',
                        solution: caseData.solution || '',
                        materials: Array.isArray(caseData.materials) ? caseData.materials.join(', ') : (caseData.materials || ''),
                        processes: Array.isArray(caseData.processes) ? caseData.processes : [],
                        customization_level: caseData.customization_level || 'Medium',
                        meta_title: caseData.meta_title || '',
                        meta_description: caseData.meta_description || '',
                        slug: caseData.slug || '',
                        key_results: Array.isArray(caseData.key_results) ? caseData.key_results : []
                    });
                }
            } catch (error: any) {
                console.error("Error loading case study:", error);
                toast({
                    title: "Error",
                    description: "Failed to load case study details.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadCaseStudy();
    }, [id, isEditMode, toast]);

    const handleBack = () => navigate('/admin/case-studies');

    const handleSave = async () => {
        if (!formData.title) {
            toast({
                title: "Validation Error",
                description: "Title is required.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            // Prepare payload
            const materialsArray = formData.materials
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const payload = {
                title: formData.title,
                client_name: formData.client_name,
                industry: formData.industry,
                location: formData.location,
                duration: formData.duration,
                status: formData.status,
                overview: formData.overview,
                challenges: formData.challenges,
                solution: formData.solution,
                materials: materialsArray,
                processes: formData.processes,
                customization_level: formData.customization_level,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                key_results: formData.key_results,
                updated_at: new Date().toISOString()
            };

            let error;
            if (isEditMode) {
                // @ts-ignore
                const { error: updateError } = await supabase
                    .from('case_studies')
                    .update(payload)
                    .eq('id', id);
                error = updateError;
            } else {
                // @ts-ignore
                const { error: insertError } = await supabase
                    .from('case_studies')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: "Success",
                description: `Case study ${isEditMode ? 'updated' : 'created'} successfully.`,
            });
            navigate('/admin/case-studies');

        } catch (error: any) {
            console.error("Error saving case study:", error);
            toast({
                title: "Error",
                description: "Failed to save case study: " + error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-generate slug from title if slug is empty logic moved to handleSave or user explicit type
        if (field === 'title' && !isEditMode && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            }));
        }
    };

    const toggleProcess = (process: string) => {
        setFormData(prev => {
            const processes = prev.processes.includes(process)
                ? prev.processes.filter(p => p !== process)
                : [...prev.processes, process];
            return { ...prev, processes };
        });
    }

    const addKeyResult = () => {
        setFormData(prev => ({
            ...prev,
            key_results: [...prev.key_results, '']
        }));
    };

    const updateKeyResult = (index: number, value: string) => {
        const newResults = [...formData.key_results];
        newResults[index] = value;
        setFormData(prev => ({ ...prev, key_results: newResults }));
    };

    const removeKeyResult = (index: number) => {
        setFormData(prev => ({
            ...prev,
            key_results: prev.key_results.filter((_, i) => i !== index)
        }));
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading case study details...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isEditMode ? 'Edit Case Study' : 'New Case Study'}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {isEditMode ? `Editing` : 'Create a new success story'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor="status-mode" className="text-sm font-medium">Published</Label>
                        <Switch
                            id="status-mode"
                            checked={formData.status === 'Published'}
                            onCheckedChange={(checked) => handleChange('status', checked ? 'Published' : 'Draft')}
                        />
                    </div>
                    <Button variant="outline" onClick={handleBack}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-brand-orange hover:bg-brand-orange-dark">
                        <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left Col) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Basic Details */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Type className="w-5 h-5 text-brand-orange" /> Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Case Study Title</Label>
                                <Input
                                    placeholder="e.g. Mega-scale Warehouse Racking"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="dark:bg-slate-950 dark:border-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Client Name</Label>
                                    <Input
                                        placeholder="e.g. Amazon India"
                                        value={formData.client_name}
                                        onChange={(e) => handleChange('client_name', e.target.value)}
                                        className="dark:bg-slate-950 dark:border-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry Category</Label>
                                    <Select value={formData.industry} onValueChange={(val) => handleChange('industry', val)}>
                                        <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800">
                                            <SelectValue placeholder="Select Industry" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                            <SelectItem value="Corporate">Corporate Offices</SelectItem>
                                            <SelectItem value="Hospitality">Hospitality</SelectItem>
                                            <SelectItem value="Education">Educational Institutions</SelectItem>
                                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                                            <SelectItem value="Logistics">Logistics & Warehousing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Project Location</Label>
                                    <Input
                                        placeholder="e.g. Bhiwandi, Mumbai"
                                        value={formData.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="dark:bg-slate-950 dark:border-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Duration</Label>
                                    <Input
                                        placeholder="e.g. 3 Months"
                                        value={formData.duration}
                                        onChange={(e) => handleChange('duration', e.target.value)}
                                        className="dark:bg-slate-950 dark:border-slate-800"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Project Overview */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5 text-brand-orange" /> Project Narratives
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Client Requirement</Label>
                                <Textarea
                                    className="min-h-[100px] dark:bg-slate-950 dark:border-slate-800"
                                    placeholder="Describe what the client needed..."
                                    value={formData.overview}
                                    onChange={(e) => handleChange('overview', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Challenges Faced</Label>
                                <Textarea
                                    className="min-h-[100px] dark:bg-slate-950 dark:border-slate-800"
                                    placeholder="Obstacles, constraints, specialized needs..."
                                    value={formData.challenges}
                                    onChange={(e) => handleChange('challenges', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>AiRS Solution</Label>
                                <Textarea
                                    className="min-h-[100px] dark:bg-slate-950 dark:border-slate-800"
                                    placeholder="How we solved it..."
                                    value={formData.solution}
                                    onChange={(e) => handleChange('solution', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Results */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart className="w-5 h-5 text-brand-orange" /> Results & Impact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Label>Key Results</Label>
                            {formData.key_results.map((result, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={result}
                                        onChange={(e) => updateKeyResult(index, e.target.value)}
                                        placeholder="e.g. 50% increase in storage capacity"
                                        className="dark:bg-slate-950 dark:border-slate-800"
                                    />
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeKeyResult(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addKeyResult} className="w-full border-dashed">
                                <Plus className="w-4 h-4 mr-2" /> Add Key Result
                            </Button>
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar Content (Right Col) */}
                <div className="space-y-8">

                    {/* Technical Details */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-md">
                                <Settings className="w-4 h-4 text-brand-orange" /> Technical Specs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Materials Used (comma separated)</Label>
                                <Input
                                    placeholder="e.g. SS 304, Mild Steel"
                                    value={formData.materials}
                                    onChange={(e) => handleChange('materials', e.target.value)}
                                    className="dark:bg-slate-950 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Fabrication Process</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['CNC Cutting', 'Welding', 'Powder Coating', 'Assembly', 'Bending', 'Polishing'].map(proc => (
                                        <div key={proc} className="flex items-center space-x-2">
                                            <Switch
                                                id={`proc-${proc}`}
                                                checked={formData.processes.includes(proc)}
                                                onCheckedChange={() => toggleProcess(proc)}
                                            />
                                            <Label htmlFor={`proc-${proc}`} className="cursor-pointer font-normal">{proc}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Customization Level</Label>
                                <Select value={formData.customization_level} onValueChange={(val) => handleChange('customization_level', val)}>
                                    <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                                        <SelectItem value="Low">Low (Standard)</SelectItem>
                                        <SelectItem value="Medium">Medium (Modified)</SelectItem>
                                        <SelectItem value="High">High (Fully Custom)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-md">
                                <ImageIcon className="w-4 h-4 text-brand-orange" /> Media
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-orange dark:hover:border-brand-orange hover:bg-brand-orange/5 transition-all">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-orange/10 transition-colors">
                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-orange" />
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Featured Image</p>
                                <p className="text-xs text-slate-500">Drag & drop or update (Coming Soon)</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-md">
                                <Globe className="w-4 h-4 text-brand-orange" /> SEO Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Slug URL</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => handleChange('slug', e.target.value)}
                                    className="font-mono text-xs dark:bg-slate-950 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Title</Label>
                                <Input
                                    value={formData.meta_title}
                                    onChange={(e) => handleChange('meta_title', e.target.value)}
                                    className="dark:bg-slate-950 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Description</Label>
                                <Textarea
                                    className="h-20 text-xs dark:bg-slate-950 dark:border-slate-800"
                                    value={formData.meta_description}
                                    onChange={(e) => handleChange('meta_description', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default AdminCaseStudyForm;
