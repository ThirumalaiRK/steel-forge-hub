import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Settings,
  ShoppingCart,
  Tag,
  ChevronLeft,
  ChevronRight,
  FileText,
  ScrollText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminTopBar } from "./AdminTopBar";
import logo from "/airs_log.png";

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth/login");
  };

  // Grouped navigation
  const navGroups = [
    {
      title: "Dashboard",
      items: [
        { icon: LayoutDashboard, label: "Overview", path: "/admin" },
      ],
    },
    {
      title: "E-commerce",
      items: [
        { icon: ShoppingCart, label: "Orders", path: "/admin/orders", badge: 0 },
        { icon: ScrollText, label: "FaaS Quotations", path: "/admin/faas-quotations" },
      ],
    },
    {
      title: "Inventory",
      items: [
        { icon: Package, label: "Products", path: "/admin/products" },
        { icon: FolderTree, label: "Categories", path: "/admin/categories" },
        { icon: FolderTree, label: "Sub-Categories", path: "/admin/sub-categories" },
      ],
    },
    {
      title: "Content",
      items: [
        { icon: Image, label: "Hero Banners", path: "/admin/hero-banners" },
        { icon: Tag, label: "Offers", path: "/admin/offers" },
        { icon: FolderTree, label: "Case Studies", path: "/admin/case-studies" },
        { icon: FileText, label: "Resources", path: "/admin/resources" },
      ],
    },
    {
      title: "Customer",
      items: [
        { icon: MessageSquare, label: "Enquiries", path: "/admin/enquiries", badge: 0 },
      ],
    },
    {
      title: "System",
      items: [
        { icon: Settings, label: "Settings", path: "/admin/settings" },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile header */}
      <div className={`lg:hidden fixed top-0 w-full z-50 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="AIRS Logo" className="h-8 w-auto" />
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>Admin</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
        >
          {sidebarOpen ? <X size={24} className={darkMode ? 'text-white' : ''} /> : <Menu size={24} className={darkMode ? 'text-white' : ''} />}
        </button>
      </div>

      {/* Enhanced Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 z-40
        transition-all duration-300 shadow-2xl
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Collapse toggle - Desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full shadow-lg items-center justify-center hover:scale-110 transition-transform z-50"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} border-b border-white/10`}>
          <img src={logo} alt="AIRS Logo" className="h-10 w-auto" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-lg font-bold leading-tight text-white">AiRS</h1>
                <p className="text-xs text-white/60">Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-6 overflow-y-auto h-[calc(100vh-200px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navGroups.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? "mt-6" : ""}>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-3 mb-2 flex items-center gap-2"
                  >
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      {group.title}
                    </span>
                    <div className="h-px bg-white/10 flex-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative
                      ${isActive(item.path)
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >


                    <item.icon size={24} className="flex-shrink-0" />

                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex items-center justify-between flex-1 overflow-hidden"
                        >
                          <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white hover:bg-red-600">{item.badge}</Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-3 px-3"
              >
                <p className="text-xs text-white/40">Logged in as:</p>
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            className={`w-full border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 ${sidebarCollapsed ? 'px-0' : ''}`}
            onClick={handleLogout}
          >
            <LogOut size={16} className={sidebarCollapsed ? '' : 'mr-2'} />
            {!sidebarCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`min-h-screen pt-16 lg:pt-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Bar - Desktop only */}
        <div className="hidden lg:block">
          <AdminTopBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>

        <div className="p-6">
          <Outlet context={{ darkMode }} />
        </div>
      </main>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;