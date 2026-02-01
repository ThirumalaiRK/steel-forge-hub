import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, CheckCircle2, MessageSquare, Package, ShoppingCart, Trash2, Bell, Filter, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";

const AdminNotifications = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    // Helper to delete notification
    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        toast({ title: "Notification deleted" });
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case "order": return <ShoppingCart className="h-5 w-5 text-blue-500" />;
            case "enquiry": return <MessageSquare className="h-5 w-5 text-green-500" />;
            case "product": return <Package className="h-5 w-5 text-purple-500" />;
            case "system": return <Bell className="h-5 w-5 text-orange-500" />;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesType = filterType === "all" ? true : n.type === filterType;
        const matchesStatus = filterStatus === "all" ? true : (filterStatus === "unread" ? !n.is_read : n.is_read);
        const matchesSearch = searchQuery === "" ? true :
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all system alerts and updates.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => markAllAsRead()} className="dark:bg-slate-800 dark:text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark all read
                    </Button>
                </div>
            </div>

            <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardHeader className="pb-3 border-b dark:border-slate-800">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex-1 w-full md:w-auto relative">
                            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[140px] dark:bg-slate-800 dark:border-slate-700">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="order">Orders</SelectItem>
                                    <SelectItem value="enquiry">Enquiries</SelectItem>
                                    <SelectItem value="product">Products</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[140px] dark:bg-slate-800 dark:border-slate-700">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="unread">Unread</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredNotifications.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No notifications found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y dark:divide-slate-800">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 flex items-start gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notification.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="mt-1 p-2 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-medium text-sm ${!notification.is_read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1 ml-2">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 break-words">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Check className="h-3 w-3 mr-1" /> Mark as read
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(notification.id)}
                                                className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminNotifications;
