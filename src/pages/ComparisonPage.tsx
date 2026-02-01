import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComparisonPage = () => {
    const { comparisonList, removeFromComparison, clearComparison } = useComparison();

    if (comparisonList.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center"
                    >
                        <span className="text-4xl">⚖️</span>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">No Products to Compare</h2>
                    <p className="text-muted-foreground mb-6">
                        Add products to comparison to see them side-by-side
                    </p>
                    <Link to="/products">
                        <Button className="bg-brand-orange hover:bg-brand-orange/90">
                            Browse Products
                            <ArrowRight className="ml-2" size={18} />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Get all unique specification keys
    const allSpecKeys = new Set<string>();
    comparisonList.forEach((product) => {
        if (product.specifications && typeof product.specifications === 'object') {
            Object.keys(product.specifications).forEach((key) => allSpecKeys.add(key));
        }
        if (product.metal_type) allSpecKeys.add('metal_type');
        if (product.finish_type) allSpecKeys.add('finish_type');
        if (product.category) allSpecKeys.add('category');
    });

    const specKeys = Array.from(allSpecKeys);

    const getSpecValue = (product: any, key: string) => {
        if (key === 'metal_type') return product.metal_type || '-';
        if (key === 'finish_type') return product.finish_type || '-';
        if (key === 'category') return product.category || '-';
        if (product.specifications && product.specifications[key]) {
            return product.specifications[key];
        }
        return '-';
    };

    // Check if values are different for highlighting
    const isDifferent = (key: string) => {
        const values = comparisonList.map((p) => getSpecValue(p, key));
        return new Set(values).size > 1;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
                        <p className="text-muted-foreground">
                            Comparing {comparisonList.length} {comparisonList.length === 1 ? 'product' : 'products'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={clearComparison} className="gap-2">
                        <X size={18} />
                        Clear Comparison
                    </Button>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-lg">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 text-left font-semibold bg-gray-50 sticky left-0 z-10">
                                    Specification
                                </th>
                                {comparisonList.map((product) => (
                                    <th key={product.id} className="p-4 min-w-[250px]">
                                        <div className="relative">
                                            <button
                                                onClick={() => removeFromComparison(product.id)}
                                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                                                <img
                                                    src={product.image_url || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
                                            <Link to={`/product/${product.slug}`}>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {specKeys.map((key, index) => (
                                <tr
                                    key={key}
                                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isDifferent(key) ? 'bg-yellow-50/50' : ''
                                        }`}
                                >
                                    <td className="p-4 font-medium capitalize sticky left-0 bg-inherit z-10">
                                        {key.replace(/_/g, ' ')}
                                        {isDifferent(key) && (
                                            <span className="ml-2 text-xs text-yellow-600">(Different)</span>
                                        )}
                                    </td>
                                    {comparisonList.map((product) => {
                                        const value = getSpecValue(product, key);
                                        const isBoolean = value === true || value === false;
                                        return (
                                            <td key={product.id} className="p-4 text-center">
                                                {isBoolean ? (
                                                    value ? (
                                                        <Check className="inline text-green-500" size={20} />
                                                    ) : (
                                                        <Minus className="inline text-gray-400" size={20} />
                                                    )
                                                ) : (
                                                    <span className={isDifferent(key) ? 'font-semibold' : ''}>
                                                        {String(value)}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden space-y-6">
                    <AnimatePresence>
                        {comparisonList.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden">
                                    <div className="relative">
                                        <div className="aspect-square bg-gray-100">
                                            <img
                                                src={product.image_url || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeFromComparison(product.id)}
                                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                        <div className="space-y-2">
                                            {specKeys.map((key) => {
                                                const value = getSpecValue(product, key);
                                                const isBoolean = value === true || value === false;
                                                return (
                                                    <div
                                                        key={key}
                                                        className={`flex justify-between py-2 border-b ${isDifferent(key) ? 'bg-yellow-50 -mx-4 px-4' : ''
                                                            }`}
                                                    >
                                                        <span className="text-sm text-muted-foreground capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {isBoolean ? (
                                                                value ? (
                                                                    <Check className="inline text-green-500" size={16} />
                                                                ) : (
                                                                    <Minus className="inline text-gray-400" size={16} />
                                                                )
                                                            ) : (
                                                                String(value)
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <Link to={`/product/${product.slug}`}>
                                            <Button className="w-full bg-brand-orange hover:bg-brand-orange/90">
                                                View Full Details
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
