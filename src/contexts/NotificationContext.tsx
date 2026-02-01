import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
    id: string;
    type: "order" | "enquiry" | "product" | "system";
    title: string;
    message: string;
    reference_id?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    createNotification: (type: Notification["type"], title: string, message: string, referenceId?: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { toast } = useToast();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        // Only connect if user is logged in
        if (!user) {
            setNotifications([]);
            return;
        }

        // 1. Fetch initial notifications
        const fetchNotifications = async () => {
            // Cast to any to bypass 'notifications' table not being in generated types yet
            const { data, error } = await supabase
                .from("notifications" as any)
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching notifications:", error);
                return;
            }

            setNotifications((data as any) || []);
        };

        fetchNotifications();

        // 2. Subscribe to Supabase Realtime
        const channel = supabase
            .channel("public:notifications")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newNotification = payload.new as Notification;
                        setNotifications((prev) => [newNotification, ...prev]);

                        toast({
                            title: newNotification.title,
                            description: newNotification.message,
                            className: "border-l-4 border-l-brand-orange",
                        });
                    } else if (payload.eventType === 'DELETE') {
                        const deletedId = payload.old.id;
                        setNotifications((prev) => prev.filter(n => n.id !== deletedId));
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedNotification = payload.new as Notification;
                        setNotifications((prev) => prev.map(n => n.id === updatedNotification.id ? updatedNotification : n));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, toast]);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

        const { error } = await supabase
            .from("notifications" as any)
            .update({ is_read: true })
            .eq("id", id);

        if (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        const { error } = await supabase
            .from("notifications" as any)
            .update({ is_read: true })
            .in("id", unreadIds);

        if (error) console.error("Error marking all read:", error);
    };

    const createNotification = async (type: Notification["type"], title: string, message: string, referenceId?: string) => {
        const { error } = await supabase.from("notifications" as any).insert({
            type,
            title,
            message,
            reference_id: referenceId,
            is_read: false
        });

        if (error) console.error("Error sending notification:", error);
    };

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        const { error } = await supabase
            .from("notifications" as any)
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting notification:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, createNotification, deleteNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
