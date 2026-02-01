import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Download, Upload } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: ReactNode;
    };
    secondaryActions?: Array<{
        label: string;
        onClick: () => void;
        icon?: ReactNode;
        variant?: "default" | "outline" | "ghost";
    }>;
}

export const PageHeader = ({ title, description, action, secondaryActions }: PageHeaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {secondaryActions?.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || "outline"}
                            onClick={action.onClick}
                            className="gap-2"
                        >
                            {action.icon}
                            {action.label}
                        </Button>
                    ))}
                    {action && (
                        <Button
                            onClick={action.onClick}
                            className="bg-brand-orange hover:bg-brand-orange/90 gap-2"
                        >
                            {action.icon || <Plus size={18} />}
                            {action.label}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFilterClick?: () => void;
    filterCount?: number;
}

export const SearchBar = ({
    value,
    onChange,
    placeholder = "Search...",
    onFilterClick,
    filterCount,
}: SearchBarProps) => {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10 h-11 dark:bg-slate-800 dark:border-slate-700"
                />
            </div>
            {onFilterClick && (
                <Button
                    variant="outline"
                    onClick={onFilterClick}
                    className="gap-2 h-11 dark:bg-slate-800 dark:border-slate-700"
                >
                    <Filter size={18} />
                    Filters
                    {filterCount !== undefined && filterCount > 0 && (
                        <Badge className="ml-1 bg-brand-orange">{filterCount}</Badge>
                    )}
                </Button>
            )}
        </div>
    );
};

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
}

export const StatsCard = ({ title, value, icon, trend, color = "blue" }: StatsCardProps) => {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
        purple: "from-purple-500 to-purple-600",
        red: "from-red-500 to-red-600",
    };

    return (
        <Card className="border-0 shadow-md dark:bg-slate-800">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-3xl font-bold mt-2 dark:text-white">{value}</p>
                        {trend && (
                            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
                            </p>
                        )}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} flex items-center justify-center shadow-lg`}>
                        <div className="text-white">{icon}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface StatusBadgeProps {
    status: boolean | string;
    activeLabel?: string;
    inactiveLabel?: string;
}

export const StatusBadge = ({
    status,
    activeLabel = "Active",
    inactiveLabel = "Inactive",
}: StatusBadgeProps) => {
    const isActive = typeof status === 'boolean' ? status : status === 'active';

    return (
        <Badge
            className={`${isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
        >
            {isActive ? activeLabel : inactiveLabel}
        </Badge>
    );
};

interface EmptyStateProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: ReactNode;
}

export const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => {
    return (
        <Card className="border-2 border-dashed dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
                {icon && (
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
                    {description}
                </p>
                {action && (
                    <Button onClick={action.onClick} className="bg-brand-orange hover:bg-brand-orange/90">
                        <Plus size={18} className="mr-2" />
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

interface DataTableCardProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export const DataTableCard = ({ children, title, description }: DataTableCardProps) => {
    return (
        <Card className="border-0 shadow-md dark:bg-slate-800">
            {(title || description) && (
                <CardHeader>
                    {title && <CardTitle className="dark:text-white">{title}</CardTitle>}
                    {description && <CardDescription className="dark:text-gray-400">{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    {children}
                </div>
            </CardContent>
        </Card>
    );
};

interface ActionButtonsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onDuplicate?: () => void;
    customActions?: Array<{
        label: string;
        onClick: () => void;
        icon: ReactNode;
        variant?: "default" | "outline" | "ghost" | "destructive";
    }>;
}

export const ActionButtons = ({
    onEdit,
    onDelete,
    onView,
    onDuplicate,
    customActions,
}: ActionButtonsProps) => {
    return (
        <div className="flex items-center gap-2">
            {onView && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onView}
                    className="h-8 w-8 p-0"
                    title="View"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </Button>
            )}
            {onEdit && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                    title="Edit"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </Button>
            )}
            {onDuplicate && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDuplicate}
                    className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950"
                    title="Duplicate"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </Button>
            )}
            {customActions?.map((action, index) => (
                <Button
                    key={index}
                    variant={action.variant || "ghost"}
                    size="sm"
                    onClick={action.onClick}
                    className="h-8 w-8 p-0"
                    title={action.label}
                >
                    {action.icon}
                </Button>
            ))}
            {onDelete && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    title="Delete"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </Button>
            )}
        </div>
    );
};
