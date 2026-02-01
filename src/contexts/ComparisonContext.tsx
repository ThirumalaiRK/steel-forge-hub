import React, { createContext, useContext, useState, useEffect } from 'react';

interface ComparisonProduct {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
    specifications?: any;
    category?: string;
    metal_type?: string;
    finish_type?: string;
}

interface ComparisonContextType {
    comparisonList: ComparisonProduct[];
    addToComparison: (product: ComparisonProduct) => boolean;
    removeFromComparison: (id: string) => void;
    isInComparison: (id: string) => boolean;
    clearComparison: () => void;
    comparisonCount: number;
    maxComparison: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const maxComparison = 4;
    const [comparisonList, setComparisonList] = useState<ComparisonProduct[]>(() => {
        const saved = localStorage.getItem('comparison');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('comparison', JSON.stringify(comparisonList));
    }, [comparisonList]);

    const addToComparison = (product: ComparisonProduct): boolean => {
        if (comparisonList.length >= maxComparison) {
            return false;
        }
        if (comparisonList.some((p) => p.id === product.id)) {
            return false;
        }
        setComparisonList((prev) => [...prev, product]);
        return true;
    };

    const removeFromComparison = (id: string) => {
        setComparisonList((prev) => prev.filter((product) => product.id !== id));
    };

    const isInComparison = (id: string) => {
        return comparisonList.some((product) => product.id === id);
    };

    const clearComparison = () => {
        setComparisonList([]);
    };

    return (
        <ComparisonContext.Provider
            value={{
                comparisonList,
                addToComparison,
                removeFromComparison,
                isInComparison,
                clearComparison,
                comparisonCount: comparisonList.length,
                maxComparison,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within ComparisonProvider');
    }
    return context;
};
