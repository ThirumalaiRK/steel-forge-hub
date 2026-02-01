import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; isAdmin: boolean }>;
  signUp: (email: string, password: string, role: string) => Promise<any>; // Merged: Added role parameter
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = (currentUser: User | null) => {
    if (currentUser) {

      const userIsAdmin =
        currentUser.user_metadata?.role === "admin" ||
        currentUser.app_metadata?.role === "admin" ||
        (Array.isArray(currentUser.app_metadata?.roles) &&
          currentUser.app_metadata.roles.includes("admin"));
      setIsAdmin(userIsAdmin);
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("Auth session check timed out. Assuming unauthenticated.");
        setLoading(false);
      }
    }, 8000);

    async function getInitialSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        if (!isMounted) return;

        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        checkAdminStatus(currentUser);
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setIsAdmin(false);
      return { error: error as any, isAdmin: false };
    }

    const currentUser = data.user;
    const userIsAdmin =
      currentUser.user_metadata?.role === "admin" ||
      currentUser.app_metadata?.role === "admin" ||
      (Array.isArray(currentUser.app_metadata?.roles) &&
        currentUser.app_metadata.roles.includes("admin"));

    setIsAdmin(userIsAdmin);
    setUser(currentUser);
    setSession(data.session);

    return { error: null, isAdmin: userIsAdmin };
  };

  const signUp = async (email: string, password: string, role: string) => {
    const redirectUrl = `${window.location.origin}/`;
    // Merged: Now passing role into options.data
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: role,
        },
      },
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  // Removed blocking loading UI to prevent FOUC / Splash screen conflict.
  // The loading state is still exposed via context for components that need it.


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};