import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  FolderTree,
  MessageSquare,
  Repeat,
  TrendingUp,
  TrendingDown,
  Plus,
  Image,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { RippleButton } from "@/components/animations";
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/animations";
import { RevenueChart, ProductViewsChart, OrderStatusChart, SalesTrendChart } from "@/components/admin/AdminCharts";
import { useNotifications } from "@/contexts/NotificationContext";
import { format } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    faasProducts: 0,
    enquiriesThisWeek: 0,
  });

  // Chart Data State
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [salesTrendData, setSalesTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchDashboardData();

    // Real-time subscriptions
    const ordersChannel = supabase
      .channel('schema-db-changes-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Real-time order update:', payload);
          fetchDashboardData();
          fetchStats(); // Update stats too
        }
      )
      .subscribe();

    const enquiriesChannel = supabase
      .channel('schema-db-changes-enquiries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enquiries' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(enquiriesChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [productsRes, categoriesRes, faasProductsRes, enquiriesWeekRes] =
        await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("categories").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true).eq("is_faas_enabled", true),
          supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
        ]);

      setStats({
        products: productsRes.count || 0,
        categories: categoriesRes.count || 0,
        faasProducts: faasProductsRes.count || 0,
        enquiriesThisWeek: enquiriesWeekRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(now.getMonth() - 7);

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      // Fetch Orders for Revenue and Status
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', sevenMonthsAgo.toISOString());

      if (ordersError) throw ordersError;

      // 1. Process Revenue (Last 7 weeks)
      // We'll group by week (approx 7 days chunks)
      const weeklyRevenueMap = new Map();
      const weeksToShow = 7;

      // Initialize last 7 weeks
      for (let i = weeksToShow - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        const key = format(d, 'MMM d');
        weeklyRevenueMap.set(key, { date: key, revenue: 0, orders: 0, sortDate: d.getTime() });
      }

      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        // Find closest week key
        let closestKey = null;
        let minDiff = Infinity;

        for (const [key, data] of weeklyRevenueMap.entries()) {
          const diff = Math.abs(orderDate.getTime() - data.sortDate);
          // Only map if within 3.5 days (one week window)
          if (diff < 3.5 * 24 * 60 * 60 * 1000) {
            if (diff < minDiff) {
              minDiff = diff;
              closestKey = key;
            }
          }
        }

        if (closestKey) {
          const current = weeklyRevenueMap.get(closestKey);
          current.revenue += Number(order.total_amount || 0);
          current.orders += 1;
        }
      });

      setRevenueData(Array.from(weeklyRevenueMap.values()));

      // 2. Process Order Status
      const statusMap = {
        'completed': { value: 0, color: '#10b981' }, // green
        'processing': { value: 0, color: '#3b82f6' }, // blue
        'pending': { value: 0, color: '#f59e0b' },    // orange
        'cancelled': { value: 0, color: '#ef4444' }   // red
      };

      orders?.forEach(order => {
        const status = (order.status || 'pending').toLowerCase();
        if (statusMap[status as keyof typeof statusMap]) {
          statusMap[status as keyof typeof statusMap].value += 1;
        } else {
          // fallback for other statuses
          if (!statusMap['pending']) statusMap['pending'] = { value: 0, color: '#f59e0b' };
          statusMap['pending'].value += 1;
        }
      });

      setOrderStatusData(
        Object.entries(statusMap).map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: data.value,
          color: data.color
        })).filter(item => item.value > 0)
      );

      // 3. Process Sales vs Target (Last 7 months)
      const monthlySalesMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = format(d, 'MMM');
        monthlySalesMap.set(key, { month: key, sales: 0, target: 50000 }); // Example target 50k
      }

      orders?.forEach(order => {
        const key = format(new Date(order.created_at), 'MMM');
        if (monthlySalesMap.has(key)) {
          monthlySalesMap.get(key).sales += Number(order.total_amount || 0);
        }
      });
      setSalesTrendData(Array.from(monthlySalesMap.values()));


      // 4. Process Top Products (From Order Items - Last 30 days)
      try {
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('quantity, products(name)')
          .gte('created_at', oneMonthAgo.toISOString());

        if (!itemsError && orderItems) {
          const productSales: Record<string, number> = {};
          orderItems.forEach((item: any) => {
            const pName = item.products?.name || 'Unknown Product';
            productSales[pName] = (productSales[pName] || 0) + (item.quantity || 0);
          });

          const sortedProducts = Object.entries(productSales)
            .map(([product, sales]) => ({ product, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5); // Top 5

          setTopProductsData(sortedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch top products", err);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced stat cards with trends
  const statCards = [
    {
      title: "Total Products",
      value: stats.products,
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "from-blue-400 to-blue-500",
      path: "/admin/products",
      helper: "All products in your catalog",
      trend: 12, // Mock trend data
      sparklineData: [4, 6, 8, 5, 9, 7, 10],
    },
    {
      title: "Total Categories",
      value: stats.categories,
      icon: FolderTree,
      gradient: "from-orange-500 to-orange-600",
      iconBg: "from-orange-400 to-orange-500",
      path: "/admin/categories",
      helper: "Top-level navigation structure",
      trend: 8,
      sparklineData: [3, 4, 5, 4, 6, 5, 7],
    },
    // ... keep other stats same ...
    {
      title: "FaaS Products",
      value: stats.faasProducts,
      icon: Repeat,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "from-purple-400 to-purple-500",
      path: "/admin/products",
      helper: "Products available for rental",
      trend: 15,
      sparklineData: [2, 3, 4, 3, 5, 6, 8],
    },
    {
      title: "New Enquiries",
      value: stats.enquiriesThisWeek,
      icon: MessageSquare,
      gradient: "from-green-500 to-green-600",
      iconBg: "from-green-400 to-green-500",
      path: "/admin/enquiries",
      helper: "Last 7 days",
      trend: -5,
      sparklineData: [8, 7, 9, 6, 5, 7, 6],
    },
  ];

  const EnhancedStatCard = ({ stat, index }: any) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Card
          className="relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 border-0 dark:bg-slate-900"
          onClick={() => navigate(stat.path)}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.helper}
              </p>

              {/* Trend indicator */}
              <div className="flex items-center gap-1 mt-2">
                {stat.trend > 0 ? (
                  <TrendingUp className="text-green-500" size={16} />
                ) : (
                  <TrendingDown className="text-red-500" size={16} />
                )}
                <span className={`text-xs font-semibold ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stat.trend)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </div>

            {/* Icon with gradient */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="text-white" size={28} />
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-2">
              {inView ? (
                <CountUp end={stat.value} duration={2} separator="," />
              ) : (
                0
              )}
            </div>

            {/* Mini sparkline */}
            <div className="h-12 flex items-end gap-1">
              {stat.sparklineData.map((value: number, i: number) => (
                <motion.div
                  key={i}
                  className={`flex-1 bg-gradient-to-t ${stat.gradient} rounded-t opacity-30`}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(value / 10) * 100}%` } : {}}
                  transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const QuickActions = () => (
    <ScrollAnimation animation="slideUp" delay={0.4}>
      <Card className="border-0 shadow-lg dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-xl dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RippleButton
              variant="primary"
              onClick={() => navigate('/admin/products')}
              className="flex flex-col items-center justify-center gap-2 p-6 h-24 bg-gradient-to-br from-brand-orange to-brand-orange/80 hover:from-brand-orange/90 hover:to-brand-orange/70"
            >
              <Plus size={24} className="flex-shrink-0" />
              <span className="text-sm font-semibold text-center">Add Product</span>
            </RippleButton>

            <RippleButton
              variant="secondary"
              onClick={() => navigate('/admin/categories')}
              className="flex flex-col items-center justify-center gap-2 p-6 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <FolderTree size={24} className="flex-shrink-0" />
              <span className="text-sm font-semibold text-center">Add Category</span>
            </RippleButton>

            <RippleButton
              variant="secondary"
              onClick={() => navigate('/admin/enquiries')}
              className="flex flex-col items-center justify-center gap-2 p-6 h-24 bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <MessageSquare size={24} className="flex-shrink-0" />
              <span className="text-sm font-semibold text-center">View Enquiries</span>
            </RippleButton>

            <RippleButton
              variant="secondary"
              onClick={() => navigate('/admin/hero-banners')}
              className="flex flex-col items-center justify-center gap-2 p-6 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
            >
              <Image size={24} className="flex-shrink-0" />
              <span className="text-sm font-semibold text-center">Upload Banner</span>
            </RippleButton>
          </div>
        </CardContent>
      </Card>
    </ScrollAnimation>
  );

  const RecentActivity = () => {
    // Map real notifications to activity format
    const activities = notifications.slice(0, 5).map(n => {
      let icon = Package;
      let colorClass = "bg-blue-500";
      let title = n.title;
      let message = n.message;

      // Ensure we display some fallback if data is missing
      if (!title) title = "New Activity";
      if (!message) message = "A new event occurred.";

      switch (n.type) {
        case 'order':
          icon = ShoppingCart;
          colorClass = "bg-purple-500";
          break;
        case 'enquiry':
          icon = MessageSquare;
          colorClass = "bg-green-500";
          break;
        case 'product':
          icon = Package;
          colorClass = "bg-blue-500";
          break;
        default:
          icon = MessageSquare;
          colorClass = "bg-orange-500";
      }

      return {
        id: n.id,
        title: title,
        description: message,
        icon,
        colorClass,
        timeAgo: n.created_at ? format(new Date(n.created_at), 'MMM d, p') : 'Just now'
      };
    });

    return (
      <ScrollAnimation animation="slideUp" delay={0.5}>
        <Card className="border-0 shadow-lg dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl dark:text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <StaggerContainer staggerDelay={0.1}>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <StaggerItem key={activity.id}>
                      <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-full ${activity.colorClass} flex items-center justify-center flex-shrink-0`}>
                          <activity.icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.timeAgo}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                )}
              </div>
            </StaggerContainer>
          </CardContent>
        </Card>
      </ScrollAnimation>
    );
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-gray-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.h1
        className="text-3xl font-bold dark:text-white"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Dashboard
      </motion.h1>

      {/* Enhanced Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <EnhancedStatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Analytics Charts */}
      <ScrollAnimation animation="slideUp" delay={0.6}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart darkMode={darkMode} data={revenueData} />
          <ProductViewsChart darkMode={darkMode} data={topProductsData} />
        </div>
      </ScrollAnimation>

      <ScrollAnimation animation="slideUp" delay={0.7}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <OrderStatusChart darkMode={darkMode} data={orderStatusData} />
          <SalesTrendChart darkMode={darkMode} data={salesTrendData} />
        </div>
      </ScrollAnimation>
    </div>
  );
};

export default AdminDashboard;