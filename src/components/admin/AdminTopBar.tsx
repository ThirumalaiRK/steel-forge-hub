import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    Bell,
    Sun,
    Moon,
    User,
    Settings,
    LogOut,
    ChevronRight,
    Package,
    MessageSquare,
    ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface AdminTopBarProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const AdminTopBar = ({ darkMode, toggleDarkMode }: AdminTopBarProps) => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Generate breadcrumbs from current path
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split("/").filter(Boolean);
        const breadcrumbs = [{ label: "Admin", path: "/admin" }];

        paths.forEach((path, index) => {
            if (index > 0) {
                const label = path
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                breadcrumbs.push({
                    label,
                    path: `/admin/${paths.slice(1, index + 1).join("/")}`,
                });
            }
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Real-time notifications
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case "order": return { icon: ShoppingCart, color: "text-blue-500" };
            case "enquiry": return { icon: MessageSquare, color: "text-green-500" };
            case "product": return { icon: Package, color: "text-purple-500" };
            default: return { icon: Bell, color: "text-gray-500" };
        }
    };

    const handleNotificationClick = (id: string, isRead: boolean) => {
        if (!isRead) markAsRead(id);
    };

    return (
        <div className={`h-16 border-b ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm`}>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center gap-2">
                        {index > 0 && (
                            <ChevronRight size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                        )}
                        <Link
                            to={crumb.path}
                            className={`text-sm font-medium transition-colors ${index === breadcrumbs.length - 1
                                ? darkMode ? 'text-white' : 'text-gray-900'
                                : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {crumb.label}
                        </Link>
                    </div>
                ))}
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative w-64 hidden md:block">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-10 ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-gray-500' : ''}`}
                    />
                </div>

                {/* Notifications */}
                <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell size={20} className={darkMode ? 'text-gray-300' : ''} />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 dark:bg-slate-900 dark:border-slate-800">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span className="dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <div className="flex gap-2">
                                    <span
                                        className="text-xs text-blue-500 cursor-pointer hover:underline"
                                        onClick={() => markAllAsRead()}
                                    >
                                        Mark all read
                                    </span>
                                    <Badge variant="destructive">
                                        {unreadCount} new
                                    </Badge>
                                </div>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-slate-800" />
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const { icon: Icon, color } = getNotificationStyle(notification.type);
                                    return (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                                            className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                                                <Icon size={20} className={color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
                            )}
                        </div>
                        <DropdownMenuSeparator className="dark:bg-slate-800" />
                        <Link to="/admin/notifications">
                            <DropdownMenuItem className="text-center justify-center text-sm text-blue-600 dark:text-blue-400 cursor-pointer focus:bg-transparent">
                                View all notifications
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Dark Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="relative overflow-hidden"
                >
                    <AnimatePresence mode="wait">
                        {darkMode ? (
                            <motion.div
                                key="moon"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Moon size={20} className="text-gray-300" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sun"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sun size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-brand-orange text-white text-sm">
                                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <span className={`text-sm font-medium hidden lg:block ${darkMode ? 'text-gray-300' : ''}`}>
                                {user?.email?.split('@')[0] || 'Admin'}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">My Account</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/admin/settings" className="cursor-pointer w-full flex items-center">
                                <User className="mr-2" size={16} />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/admin/settings" className="cursor-pointer w-full flex items-center">
                                <Settings className="mr-2" size={16} />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400 cursor-pointer w-full flex items-center">
                            <LogOut className="mr-2" size={16} />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
