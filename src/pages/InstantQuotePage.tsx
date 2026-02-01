import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowRight, DollarSign, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const InstantQuotePage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [quoteResult, setQuoteResult] = useState<any>(null);
    const [specs, setSpecs] = useState({
        material: "aluminum-6061",
        process: "cnc-machining",
        quantity: 1,
        finish: "standard"
    });

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleAnalyze = () => {
        if (!file) {
            toast.error("Please upload a CAD or PDF file first.");
            return;
        }

        setIsAnalyzing(true);
        // Simulate AI Analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            const basePrice = Math.floor(Math.random() * (5000 - 1500) + 1500);
            setQuoteResult({
                pricePerUnit: basePrice,
                total: basePrice * specs.quantity,
                leadTime: "3-5 Days",
                confidence: "98%"
            });
            toast.success("AI Analysis Complete!");
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 font-sans">
            <div className="container mx-auto px-4 py-8 max-w-5xl">

                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                        <Calculator size={14} /> Beta Feature
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        INSTANT <span className="text-brand-orange">AI QUOTE</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Upload your CAD files (STEP, IGES, STL) or PDFs. Our AI analyzes geometry in seconds to generate a distinct manufacturing estimate.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* LEFT: Upload & Config */}
                    <div className="space-y-6">
                        {/* File Upload Zone */}
                        <div
                            onDrop={handleFileDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${file ? 'border-brand-orange bg-orange-50/50' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
                        >
                            <input
                                type="file"
                                className="hidden"
                                id="file-upload"
                                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                                </div>
                                {file ? (
                                    <div>
                                        <p className="font-bold text-slate-900">{file.name}</p>
                                        <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <Button variant="link" className="text-red-500 h-auto p-0 mt-2" onClick={(e) => { e.preventDefault(); setFile(null); }}>Remove</Button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">Click to Upload or Drag & Drop</p>
                                        <p className="text-sm text-slate-500 mt-1">Supports STEP, STL, DXF, PDF (Max 50MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Specs Form */}
                        <Card className="p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText size={18} /> Fabrication Specs
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Material</label>
                                    <select
                                        className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                                        value={specs.material}
                                        onChange={(e) => setSpecs({ ...specs, material: e.target.value })}
                                    >
                                        <option value="aluminum-6061">Aluminum 6061</option>
                                        <option value="steel-crud">Stainless Steel 304</option>
                                        <option value="abs">ABS Plastic</option>
                                        <option value="titanium">Titanium Grade 5</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Process</label>
                                    <select
                                        className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                                        value={specs.process}
                                        onChange={(e) => setSpecs({ ...specs, process: e.target.value })}
                                    >
                                        <option value="cnc-machining">CNC Machining</option>
                                        <option value="3d-printing">3D Printing (FDM)</option>
                                        <option value="sheet-metal">Sheet Metal</option>
                                        <option value="injection-mold">Injection Molding</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                                        value={specs.quantity}
                                        onChange={(e) => setSpecs({ ...specs, quantity: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Finish</label>
                                    <select
                                        className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                                        value={specs.finish}
                                        onChange={(e) => setSpecs({ ...specs, finish: e.target.value })}
                                    >
                                        <option value="standard">Standard (As Machined)</option>
                                        <option value="anodized">Anodized (Black)</option>
                                        <option value="powder-coat">Powder Coat</option>
                                        <option value="polished">Polished</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        <Button
                            className="w-full py-6 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-xl"
                            onClick={handleAnalyze}
                            disabled={!file || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Geometry...</>
                            ) : (
                                "Generate Quote Now"
                            )}
                        </Button>
                    </div>

                    {/* RIGHT: Results */}
                    <div className="relative">
                        {!quoteResult && !isAnalyzing && (
                            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <DollarSign size={32} className="opacity-20" />
                                </div>
                                <p className="font-bold">Waiting for input...</p>
                                <p className="text-sm">Upload a file and click Generate to see AI cost estimation.</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="h-full min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-orange-50 opacity-50 animate-pulse"></div>
                                <Loader2 size={48} className="text-brand-orange animate-spin mb-4 relative z-10" />
                                <h3 className="text-xl font-bold text-slate-800 relative z-10">AI is crunching the numbers</h3>
                                <p className="text-slate-500 mt-2 relative z-10">Analyzing volume, complexity, and tolerance...</p>
                            </div>
                        )}

                        {quoteResult && !isAnalyzing && (
                            <div className="h-full min-h-[400px] bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-slate-900 text-white p-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-1">Quote Ready</p>
                                    <h2 className="text-3xl font-black">₹{(quoteResult.total).toLocaleString()}</h2>
                                    <p className="text-slate-400 text-sm">Estimated Total (Excl. Tax)</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Unit Price</p>
                                            <p className="text-lg font-bold text-slate-800">₹{quoteResult.pricePerUnit.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Est. Lead Time</p>
                                            <p className="text-lg font-bold text-slate-800">{quoteResult.leadTime}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                            <span className="text-slate-500">Material Cost</span>
                                            <span className="font-medium">₹{(quoteResult.total * 0.3).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                            <span className="text-slate-500">Machining Labor</span>
                                            <span className="font-medium">₹{(quoteResult.total * 0.5).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                            <span className="text-slate-500">Post-Processing</span>
                                            <span className="font-medium">₹{(quoteResult.total * 0.2).toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 text-green-800 p-3 rounded-md text-xs font-bold flex items-center gap-2">
                                        <CheckCircle2 size={14} /> High Manufacturability Score ({quoteResult.confidence})
                                    </div>

                                    <Button className="w-full bg-brand-orange hover:bg-orange-600 font-bold">
                                        Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                    <p className="text-xs text-center text-slate-400">Valid for 24 hours.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstantQuotePage;
