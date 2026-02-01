import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface FilterState {
    priceRange: [number, number];
    materials: string[];
    sizes: string[];
    colors: string[];
    finishes: string[];
    sortBy: string;
}

interface AdvancedFiltersProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onClearFilters: () => void;
}

const materialOptions = ['Steel', 'Stainless Steel', 'Aluminum', 'Iron', 'Brass'];
const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large', 'Custom'];
const colorOptions = ['Black', 'Silver', 'White', 'Bronze', 'Gold', 'Custom'];
const finishOptions = ['Powder Coated', 'Polished', 'Matte', 'Brushed', 'Galvanized'];
const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    filters,
    onFiltersChange,
    onClearFilters,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handlePriceChange = (value: number[]) => {
        onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
    };

    const handleMaterialToggle = (material: string) => {
        const newMaterials = filters.materials.includes(material)
            ? filters.materials.filter((m) => m !== material)
            : [...filters.materials, material];
        onFiltersChange({ ...filters, materials: newMaterials });
    };

    const handleSizeToggle = (size: string) => {
        const newSizes = filters.sizes.includes(size)
            ? filters.sizes.filter((s) => s !== size)
            : [...filters.sizes, size];
        onFiltersChange({ ...filters, sizes: newSizes });
    };

    const handleColorToggle = (color: string) => {
        const newColors = filters.colors.includes(color)
            ? filters.colors.filter((c) => c !== color)
            : [...filters.colors, color];
        onFiltersChange({ ...filters, colors: newColors });
    };

    const handleFinishToggle = (finish: string) => {
        const newFinishes = filters.finishes.includes(finish)
            ? filters.finishes.filter((f) => f !== finish)
            : [...filters.finishes, finish];
        onFiltersChange({ ...filters, finishes: newFinishes });
    };

    const handleSortChange = (value: string) => {
        onFiltersChange({ ...filters, sortBy: value });
    };

    const activeFilterCount =
        filters.materials.length +
        filters.sizes.length +
        filters.colors.length +
        filters.finishes.length +
        (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

    const removeFilter = (type: string, value?: string) => {
        switch (type) {
            case 'material':
                onFiltersChange({ ...filters, materials: filters.materials.filter((m) => m !== value) });
                break;
            case 'size':
                onFiltersChange({ ...filters, sizes: filters.sizes.filter((s) => s !== value) });
                break;
            case 'color':
                onFiltersChange({ ...filters, colors: filters.colors.filter((c) => c !== value) });
                break;
            case 'finish':
                onFiltersChange({ ...filters, finishes: filters.finishes.filter((f) => f !== value) });
                break;
            case 'price':
                onFiltersChange({ ...filters, priceRange: [0, 10000] });
                break;
        }
    };

    return (
        <div className="space-y-4">
            {/* Top Bar with Sort and Filter Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <SlidersHorizontal size={18} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge variant="default" className="ml-1 bg-brand-orange">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Filter Products</SheetTitle>
                                <SheetDescription>
                                    Refine your search with advanced filters
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Price Range */}
                                <div>
                                    <Label className="text-base font-semibold mb-4 block">Price Range</Label>
                                    <div className="px-2">
                                        <Slider
                                            min={0}
                                            max={10000}
                                            step={100}
                                            value={filters.priceRange}
                                            onValueChange={handlePriceChange}
                                            className="mb-4"
                                        />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>${filters.priceRange[0]}</span>
                                            <span>${filters.priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Materials */}
                                <div>
                                    <Label className="text-base font-semibold mb-4 block">Material</Label>
                                    <div className="space-y-3">
                                        {materialOptions.map((material) => (
                                            <div key={material} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`material-${material}`}
                                                    checked={filters.materials.includes(material)}
                                                    onCheckedChange={() => handleMaterialToggle(material)}
                                                />
                                                <label
                                                    htmlFor={`material-${material}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {material}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Sizes */}
                                <div>
                                    <Label className="text-base font-semibold mb-4 block">Size</Label>
                                    <div className="space-y-3">
                                        {sizeOptions.map((size) => (
                                            <div key={size} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`size-${size}`}
                                                    checked={filters.sizes.includes(size)}
                                                    onCheckedChange={() => handleSizeToggle(size)}
                                                />
                                                <label
                                                    htmlFor={`size-${size}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {size}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Colors */}
                                <div>
                                    <Label className="text-base font-semibold mb-4 block">Color</Label>
                                    <div className="space-y-3">
                                        {colorOptions.map((color) => (
                                            <div key={color} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`color-${color}`}
                                                    checked={filters.colors.includes(color)}
                                                    onCheckedChange={() => handleColorToggle(color)}
                                                />
                                                <label
                                                    htmlFor={`color-${color}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {color}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Finishes */}
                                <div>
                                    <Label className="text-base font-semibold mb-4 block">Finish</Label>
                                    <div className="space-y-3">
                                        {finishOptions.map((finish) => (
                                            <div key={finish} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`finish-${finish}`}
                                                    checked={filters.finishes.includes(finish)}
                                                    onCheckedChange={() => handleFinishToggle(finish)}
                                                />
                                                <label
                                                    htmlFor={`finish-${finish}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {finish}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Clear Filters */}
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        onClearFilters();
                                        setIsOpen(false);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={onClearFilters}>
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</Label>
                    <Select value={filters.sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Active Filter Chips */}
            <AnimatePresence>
                {activeFilterCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                    >
                        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
                            <Badge variant="secondary" className="gap-1">
                                ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                <button onClick={() => removeFilter('price')} className="ml-1 hover:text-destructive">
                                    <X size={14} />
                                </button>
                            </Badge>
                        )}
                        {filters.materials.map((material) => (
                            <Badge key={material} variant="secondary" className="gap-1">
                                {material}
                                <button onClick={() => removeFilter('material', material)} className="ml-1 hover:text-destructive">
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))}
                        {filters.sizes.map((size) => (
                            <Badge key={size} variant="secondary" className="gap-1">
                                {size}
                                <button onClick={() => removeFilter('size', size)} className="ml-1 hover:text-destructive">
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))}
                        {filters.colors.map((color) => (
                            <Badge key={color} variant="secondary" className="gap-1">
                                {color}
                                <button onClick={() => removeFilter('color', color)} className="ml-1 hover:text-destructive">
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))}
                        {filters.finishes.map((finish) => (
                            <Badge key={finish} variant="secondary" className="gap-1">
                                {finish}
                                <button onClick={() => removeFilter('finish', finish)} className="ml-1 hover:text-destructive">
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
