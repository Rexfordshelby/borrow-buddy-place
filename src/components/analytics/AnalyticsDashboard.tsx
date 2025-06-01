
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Star, 
  Calendar,
  Users,
  Package,
  MessageSquare
} from "lucide-react";

interface AnalyticsData {
  totalEarnings: number;
  totalBookings: number;
  totalViews: number;
  averageRating: number;
  activeListings: number;
  totalMessages: number;
  earningsData: any[];
  bookingsData: any[];
  categoryData: any[];
  popularItems: any[];
}

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          items(title, category_id, categories:category_id(name))
        `)
        .eq('owner_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Fetch user items
      const { data: items } = await supabase
        .from('items')
        .select(`
          *,
          categories:category_id(name)
        `)
        .eq('user_id', user.id);

      // Fetch messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', user.id);

      // Calculate analytics
      const totalEarnings = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
      const totalBookings = bookings?.length || 0;
      const totalViews = items?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
      const averageRating = reviews?.length ? 
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
      const activeListings = items?.filter(item => item.is_available).length || 0;
      const totalMessages = messages?.length || 0;

      // Generate charts data
      const earningsData = generateTimeSeriesData(bookings || [], 'total_price', startDate, endDate);
      const bookingsData = generateTimeSeriesData(bookings || [], 'count', startDate, endDate);
      
      const categoryData = items?.reduce((acc: any[], item) => {
        const categoryName = item.categories?.name || 'Other';
        const existing = acc.find(c => c.name === categoryName);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: categoryName, value: 1 });
        }
        return acc;
      }, []) || [];

      const popularItems = items?.slice(0, 5).map(item => ({
        name: item.title,
        views: item.view_count || 0,
        bookings: bookings?.filter(b => b.item_id === item.id).length || 0
      })) || [];

      setAnalytics({
        totalEarnings,
        totalBookings,
        totalViews,
        averageRating,
        activeListings,
        totalMessages,
        earningsData,
        bookingsData,
        categoryData,
        popularItems
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (data: any[], field: string, startDate: Date, endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const result = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      let value = 0;
      if (field === 'count') {
        value = data.filter(item => 
          item.created_at.split('T')[0] === dateStr
        ).length;
      } else {
        value = data
          .filter(item => item.created_at.split('T')[0] === dateStr)
          .reduce((sum, item) => sum + (item[field] || 0), 0);
      }

      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value
      });
    }

    return result;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">${analytics.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{analytics.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold">{analytics.activeListings}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{analytics.totalMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.bookingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.views} views</p>
                  </div>
                  <Badge variant="outline">{item.bookings} bookings</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
