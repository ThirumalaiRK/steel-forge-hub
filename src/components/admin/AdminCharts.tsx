import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { TrendingUp, DollarSign, Eye, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

// Revenue Chart Component
export const RevenueChart = ({ darkMode = false, data = [] }: { darkMode?: boolean, data?: any[] }) => {
    // Fallback data if none provided
    const chartData = data.length > 0 ? data : [
        { date: "Jan 1", revenue: 0, orders: 0 },
        { date: "Jan 8", revenue: 0, orders: 0 },
    ];

    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const avgRevenue = Math.round(totalRevenue / (chartData.length || 1));

    return (
        <Card className={`border-0 shadow-lg ${darkMode ? 'bg-slate-800' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className={`text-xl ${darkMode ? 'text-white' : ''}`}>Revenue Overview</CardTitle>
                        <CardDescription className={darkMode ? 'text-gray-400' : ''}>
                            Last 7 weeks performance
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-green-500">
                        <TrendingUp size={20} />
                        <span className="text-sm font-semibold">+23.5%</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg per Week</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{avgRevenue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: darkMode ? '#ffffff' : '#000000',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Product Views Chart (Top Products)
export const ProductViewsChart = ({ darkMode = false, data = [] }: { darkMode?: boolean, data?: any[] }) => {
    return (
        <Card className={`border-0 shadow-lg ${darkMode ? 'bg-slate-800' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className={`text-xl ${darkMode ? 'text-white' : ''}`}>Top Products</CardTitle>
                        <CardDescription className={darkMode ? 'text-gray-400' : ''}>
                            Most sold this month
                        </CardDescription>
                    </div>
                    <Eye className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="product" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: darkMode ? '#ffffff' : '#000000',
                            }}
                        />
                        <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Order Status Chart
export const OrderStatusChart = ({ darkMode = false, data = [] }: { darkMode?: boolean, data?: any[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card className={`border-0 shadow-lg ${darkMode ? 'bg-slate-800' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className={`text-xl ${darkMode ? 'text-white' : ''}`}>Order Status</CardTitle>
                        <CardDescription className={darkMode ? 'text-gray-400' : ''}>
                            Distribution this month
                        </CardDescription>
                    </div>
                    <ShoppingBag className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                animationDuration={1500}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    color: darkMode ? '#ffffff' : '#000000',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {item.value}
                                    </span>
                                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Sales Trend Chart
export const SalesTrendChart = ({ darkMode = false, data = [] }: { darkMode?: boolean, data?: any[] }) => {
    return (
        <Card className={`border-0 shadow-lg ${darkMode ? 'bg-slate-800' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className={`text-xl ${darkMode ? 'text-white' : ''}`}>Sales vs Target</CardTitle>
                        <CardDescription className={darkMode ? 'text-gray-400' : ''}>
                            Last 7 months comparison
                        </CardDescription>
                    </div>
                    <DollarSign className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: darkMode ? '#ffffff' : '#000000',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', r: 5 }}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#6b7280"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#6b7280', r: 4 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
