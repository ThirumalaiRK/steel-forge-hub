import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Zap, Box, Activity, Settings, RotateCw, ShoppingCart } from "lucide-react";

// Mock Data for Options
const CONFIG_OPTIONS = {
    models: [
        { id: 'arm-light', name: 'AIRS Light Arm', price: 12000, description: 'Payload: 5kg | Reach: 900mm', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80' },
        { id: 'arm-heavy', name: 'AIRS Heavy Duty', price: 25000, description: 'Payload: 20kg | Reach: 1500mm', image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=300&q=80' },
    ],
    endEffectors: [
        { id: 'grip-claw', name: 'Precision Claw', price: 1500, description: 'Variable force gripper', icon: <Box className="w-6 h-6" /> },
        { id: 'grip-mag', name: 'Magnetic Mount', price: 2100, description: 'Electromagnetic engagement', icon: <Zap className="w-6 h-6" /> },
        { id: 'grip-weld', name: 'Welding Torch', price: 4500, description: 'MIG/TIG compatible', icon: <Activity className="w-6 h-6" /> },
    ],
    vision: [
        { id: 'vis-none', name: 'No Vision', price: 0, description: 'Standard blind operation', icon: <Settings className="w-6 h-6" /> },
        { id: 'vis-2d', name: '2D Guidance', price: 3000, description: 'Integrated camera for pick & place', icon: <Settings className="w-6 h-6" /> },
        { id: 'vis-3d', name: '3D Mapping', price: 8500, description: 'Full depth sensing & collision evasion', icon: <Settings className="w-6 h-6" /> },
    ],
    base: [
        { id: 'base-fixed', name: 'Fixed Mount', price: 0, description: 'Standard bolt-down', icon: <Settings className="w-6 h-6" /> },
        { id: 'base-rail', name: 'Linear Rail (2m)', price: 5000, description: 'Extends reach by 2 meters', icon: <Settings className="w-6 h-6" /> },
        { id: 'base-mobile', name: 'AGV Mobile Base', price: 15000, description: 'Fully autonomous mobility', icon: <RotateCw className="w-6 h-6" /> },
    ]
};

const ConfiguratorPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [config, setConfig] = useState({
        model: CONFIG_OPTIONS.models[0],
        endEffector: CONFIG_OPTIONS.endEffectors[0],
        vision: CONFIG_OPTIONS.vision[0],
        base: CONFIG_OPTIONS.base[0],
    });

    const steps = [
        { id: 'model', title: 'Select Core Model', options: CONFIG_OPTIONS.models },
        { id: 'endEffector', title: 'Choose End Effector', options: CONFIG_OPTIONS.endEffectors },
        { id: 'vision', title: 'Vision System', options: CONFIG_OPTIONS.vision },
        { id: 'base', title: 'Mounting & Mobility', options: CONFIG_OPTIONS.base },
    ];

    const handleSelection = (option: any) => {
        const stepKey = steps[currentStep].id;
        setConfig({ ...config, [stepKey]: option });
    };

    const nextStep = () => setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

    const totalPrice = config.model.price + config.endEffector.price + config.vision.price + config.base.price;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 font-sans">
            <div className="container mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        BUILD YOUR <span className="text-brand-orange">ROBOT</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Design a custom automation solution tailored to your factory needs using our modular configurator.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT: Configurator Controls */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Steps Progress */}
                        <div className="flex justify-between items-center mb-6 px-2">
                            {steps.map((step, idx) => (
                                <div
                                    key={step.id}
                                    className={`flex flex-col items-center gap-2 cursor-pointer transition-colors ${idx === currentStep ? 'text-brand-orange' : idx < currentStep ? 'text-slate-800' : 'text-slate-300'}`}
                                    onClick={() => setCurrentStep(idx)}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${idx === currentStep ? 'border-brand-orange bg-brand-orange/10' :
                                            idx < currentStep ? 'border-slate-800 bg-slate-100' : 'border-slate-300'
                                        }`}>
                                        {idx < currentStep ? <Check size={14} /> : idx + 1}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:block">{step.title.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Selection Cards */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{steps[currentStep].title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {steps[currentStep].options.map((option: any) => (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelection(option)}
                                        className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md ${(config as any)[steps[currentStep].id].id === option.id
                                                ? 'border-brand-orange bg-brand-orange/5'
                                                : 'border-slate-100 hover:border-slate-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900">{option.name}</h3>
                                            {(config as any)[steps[currentStep].id].id === option.id && (
                                                <Check className="text-brand-orange w-5 h-5 bg-white rounded-full p-0.5" />
                                            )}
                                        </div>
                                        {option.image && (
                                            <div className="h-32 mb-4 overflow-hidden rounded-lg bg-slate-100">
                                                <img src={option.image} alt={option.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                        <p className="text-sm text-slate-500 mb-3">{option.description}</p>
                                        <p className="font-mono text-sm font-bold text-slate-800">
                                            {option.price === 0 ? 'Included' : `+₹${option.price.toLocaleString()}`}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800 disabled:opacity-30 transition-colors"
                                >
                                    Back
                                </button>
                                <div className="flex gap-4">
                                    {currentStep < steps.length - 1 ? (
                                        <button
                                            onClick={nextStep}
                                            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-10 group"
                                        >
                                            Next Step <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => alert("Proceeding to checkout with custom config!")} // Wire up later
                                            className="flex items-center gap-2 px-8 py-3 bg-brand-orange text-white rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
                                        >
                                            Complete Build <ShoppingCart size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Live Preview & Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">

                            {/* Visual Preview */}
                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden min-h-[300px] flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150"></div>
                                <div className="relative z-10 text-center">
                                    {/* Placeholder for Dynamic 3D Model logic */}
                                    <img
                                        src={config.model.image || "/placeholder-robot.png"}
                                        alt="Robot Preview"
                                        className="w-64 h-auto mx-auto drop-shadow-2xl filter brightness-110 mb-4"
                                    />
                                    <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                        <p className="text-sm font-bold tracking-widest uppercase">{config.model.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Configuration Summary</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Core</span>
                                        <span className="font-medium">₹{config.model.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">End Effector</span>
                                        <span className="font-medium">+{config.endEffector.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Vision</span>
                                        <span className="font-medium">+{config.vision.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Mounting</span>
                                        <span className="font-medium">+{config.base.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-900">Total Estimate</span>
                                    <span className="text-2xl font-black text-brand-orange">₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    *Estimated price. Final quote may vary based on shipping & tax.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConfiguratorPage;
