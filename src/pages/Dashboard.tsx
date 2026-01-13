import React, { useState, useMemo } from 'react';
// Imports removed for preview compatibility. In your actual project, uncomment these:
import { api } from '../api/api';
import { useAsync } from '../hooks/useAsync';
import { formatCurrency } from '../utils/currency';
import { 
  TrendingUp, 
  Users, 
  Bed, 
  Utensils, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  FileText,
  AlertCircle,
  Sparkles,
  Bot,
  X,
  Copy,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Internal Hook Definition (for Preview) ---
// In your project, this would be in ../hooks/useAsync.ts


// --- Mock API Definition (for Preview) ---
// This simulates the data your backend SQL queries would return.


// --- Types & Interfaces (Aligned with Backend SQL) ---

interface RevenueData {
  date: string;
  receipts: number;
  refunds: number;
  net: number;
}

interface OccupancyData {
  room_number?: string;
  stays?: number;
  date?: string; 
  revenue?: number;
  occupancy_percentage?: number;
}

interface RoomData {
  id: number;
  room_number: string;
  guest_id: number | null; 
  guest_name: string | null;
  room_type: string;
  is_active: number;
  status?: string; 
}

interface CheckInData {
  id: number;
  guest_id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  check_in_time: string;
}

interface BillData {
  id: number;
  bill_no: string;
  net_amount: number;
  payment_status: string; 
  table_no: string;
  waiter_name: string;
  status?: string; 
}

interface ApiData {
  revenue: RevenueData | null;
  occupancy: OccupancyData[];
  rooms: RoomData[];
  activeCheckins: CheckInData[];
  bills: BillData[];
}

interface ChartData {
  name: string;
  revenue: number;
  occupancy: number;
}

interface RoomStatusData {
  name: string;
  value: number;
}

interface DashboardStats {
  occupancy: number;
  dailyRevenue: number;
  activeGuests: number;
  pendingKOTs: number;
  revenueData: ChartData[];
  roomStatusData: RoomStatusData[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  colorClass: string;
}

// Mock data generator for initial state
const generateMockStats = (): DashboardStats => ({
  occupancy: 0,
  dailyRevenue: 0,
  activeGuests: 0,
  pendingKOTs: 0,
  revenueData: [],
  roomStatusData: [],
});

const Dashboard = () => {
  // AI State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<'analysis' | 'email'>('analysis');

  // --- Data Fetching with useAsync ---
  const { data: rawData, loading, error, reload } = useAsync<ApiData>(async () => {
    // In preview, 'api' is always defined locally. In prod, check imports.
    if (!api) throw new Error("API not initialized");

    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Parallel execution with error swallowing for individual failures
    const [revenueRes, occupancyRes, roomsRes, activeCheckinsRes, restaurantBillsRes] = await Promise.all([
      api.report.dailyRevenue(today).catch(() => null),
      api.report.occupancy(lastWeek, today).catch(() => []), 
      api.room.list().catch(() => []),
      api.checkin.active().catch(() => []),
      api.restaurant_bill.list().catch(() => [])
    ]);

    // Normalize responses
    return {
      revenue: (revenueRes as any)?.data || revenueRes || null,
      occupancy: (occupancyRes as any)?.data || occupancyRes || [],
      rooms: (roomsRes as any)?.data || roomsRes || [],
      activeCheckins: (activeCheckinsRes as any)?.data || activeCheckinsRes || [],
      bills: (restaurantBillsRes as any)?.data || restaurantBillsRes || []
    };
  }, []);

  // --- Compute Stats from Raw Data ---
  const stats = useMemo((): DashboardStats => {
    if (!rawData) return generateMockStats();

    // 1. Revenue
    const dailyRevenue = rawData.revenue?.net || 0;

    // 2. Active Guests
    const activeGuests = rawData.activeCheckins?.length || 0;

    // 3. Pending KOTs
    const pendingKOTs = rawData.bills.filter(b => {
      const status = (b.payment_status || b.status || '').toLowerCase();
      return status === 'pending' || status === 'unpaid';
    }).length;

    // 4. Room Status Distribution
    const roomStats = rawData.rooms.reduce((acc: Record<string, number>, room) => {
      let status = 'Available';
      if (room.guest_id) {
        status = 'Occupied';
      } else if (!room.is_active) {
        status = 'Maintenance';
      } else if (room.status) {
        status = room.status; 
      }
      
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const roomStatusData = Object.entries(roomStats).map(([name, value]) => ({ name, value }));

    // 5. Occupancy/Revenue Trend
    const revenueData: ChartData[] = rawData.occupancy
      .filter(item => item.date) 
      .map(item => ({
        name: item.date || '',
        revenue: item.revenue || 0,
        occupancy: item.occupancy_percentage || 0
      }));
    
    // 6. Current Occupancy %
    const totalRooms = rawData.rooms.length;
    const occupiedRooms = rawData.rooms.filter(r => r.guest_id).length;
    const currentOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      dailyRevenue,
      activeGuests,
      pendingKOTs,
      revenueData, 
      roomStatusData,
      occupancy: currentOccupancy
    };
  }, [rawData]);

  // --- Gemini API Integration ---
  // const generateAiInsight = async (mode: 'analysis' | 'email' = 'analysis') => {
  //   setAiMode(mode);
  //   setShowAiModal(true);
  //   setIsAiLoading(true);
  //   setAiInsight(null);
  //   setCopied(false);

  //   const apiKey = ""; 
    
  //   const contextData = `
  //     Daily Revenue: $${stats.dailyRevenue}
  //     Occupancy Rate: ${stats.occupancy}%
  //     Active Guests: ${stats.activeGuests}
  //     Pending Kitchen Orders: ${stats.pendingKOTs}
  //     Room Statuses: ${stats.roomStatusData.map(d => `${d.name}: ${d.value}`).join(', ')}
  //     Date: ${new Date().toLocaleDateString()}
  //   `;

  //   let prompt = "";
  //   if (mode === 'analysis') {
  //     prompt = `Act as a senior Hotel Operations Manager. Analyze the following daily data and provide a concise 'Executive Summary' and 3 specific, actionable bullet points to improve revenue or operations for the rest of the day. Be professional but encouraging. Data: ${contextData}`;
  //   } else {
  //     prompt = `Act as a Hotel Manager. Draft a professional "End of Shift" email report to the owner based on the following daily data. The tone should be formal and concise. Highlight the revenue and occupancy clearly. Data: ${contextData}`;
  //   }

  //   try {
  //     const response = await fetch(
  //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           contents: [{ parts: [{ text: prompt }] }]
  //         })
  //       }
  //     );
      
  //     const resData = await response.json();
      
  //     if (resData.error) {
  //        throw new Error(resData.error.message);
  //     }
      
  //     const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  //     setAiInsight(text || "Could not generate insight. Please try again.");
  //   } catch (e) {
  //     console.error("AI Generation Error:", e);
  //     setAiInsight("Unable to connect to AI service. Please check your internet connection.");
  //   } finally {
  //     setIsAiLoading(false);
  //   }
  // };

  const handleCopy = () => {
    if (aiInsight) {
      navigator.clipboard.writeText(aiInsight);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="bg-bg-primary dark:bg-slate-800 p-6 rounded-sm border border-gray dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
          {trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {Math.abs(trend)}% from yesterday
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-900">
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-6 rounded-sm mb-4 max-w-md border border-rose-100 dark:border-rose-800/50">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-80" />
          <h2 className="font-bold text-lg mb-1">Data Load Error</h2>
          <p className="text-sm opacity-90">{String(error)}</p>
        </div>
        <button onClick={reload} className="flex items-center px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl hover:opacity-90 transition-all font-medium">
          <RefreshCw size={18} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-6  dark:bg-slate-900 min-h-screen space-y-6 animate-in fade-in duration-500">
      
      {/* AI Modal Overlay */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600">
              <div className="flex items-center text-white">
                <Sparkles size={20} className="mr-2" />
                <h3 className="font-bold">{aiMode === 'analysis' ? 'Smart Business Analysis' : 'Draft Daily Report'}</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Bot size={48} className="text-indigo-500 animate-bounce" />
                  <p className="text-slate-500 animate-pulse">Consulting Gemini AI...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {aiInsight}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={handleCopy}
                disabled={isAiLoading || !aiInsight}
                className="flex items-center px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                {copied ? <Check size={16} className="mr-2 text-emerald-500" /> : <Copy size={16} className="mr-2" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          {/* <p className="text-slate-500 text-xs dark:text-slate-400">Welcome back. Here's what's happening today.</p> */}
        </div>
        <div className="flex flex-wrap justify-end gap-3 w-full xl:w-auto">
          {/* Gemini Features */}
          {/* <div className="flex gap-2 w-full sm:w-auto">
             <button 
              onClick={() => generateAiInsight('analysis')}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-none disabled:opacity-50"
            >
              <Sparkles size={16} className="mr-2" /> Insights ✨
            </button>
            <button 
              onClick={() => generateAiInsight('email')}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all shadow-md shadow-purple-200 dark:shadow-none disabled:opacity-50"
            >
              <Bot size={16} className="mr-2" /> Draft Report ✨
            </button>
          </div> */}

          <div className="w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

          {/* <button 
            onClick={() => api.pdfExport.export({ type: 'daily-summary', date: new Date().toISOString() })}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800  border-slate-200 dark:border-slate-700 rounded-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-gray text-slate-700 dark:text-slate-200"
          >
            <FileText size={16} className="mr-2" /> Export
          </button> */}
          <button 
            onClick={reload}
            disabled={loading}
            className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Revenue" 
          value={`${formatCurrency(stats.dailyRevenue)}`} 
          icon={DollarSign} 
          trend={12.5}
          colorClass="bg-indigo-500"
        />
        <StatCard 
          title="Room Occupancy" 
          value={`${stats.occupancy}%`} 
          icon={Bed} 
          trend={-2.4} 
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Active Guests" 
          value={stats.activeGuests} 
          icon={Users} 
          trend={5.1}
          colorClass="bg-amber-500"
        />
        <StatCard 
          title="Pending Restaurant Orders" 
          value={stats.pendingKOTs} 
          icon={Utensils} 
          colorClass="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-sm  shadow-sm border border-gray dark:border-slate-700 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
              <TrendingUp size={20} className="mr-2 text-indigo-500" /> Revenue & Occupancy Trend
            </h3>
            <div className="flex items-center gap-4 text-[10px] sm:text-xs font-medium">
              <span className="flex items-center"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-1"></span> Revenue</span>
              <span className="flex items-center"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full mr-1"></span> Occupancy</span>
            </div>
          </div>
          <div className="h-80 w-full">
            {stats.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                 Not enough historical data to display trends.
              </div>
            )}
          </div>
        </div>

        {/* Room Status Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-sm shadow-sm border border-gray dark:border-slate-700 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Room Availability</h3>
          <div className="h-64">
            {stats.roomStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" >
                <PieChart>
                  <Pie
                    data={stats.roomStatusData as any[]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.roomStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                No room data available
              </div>
            )}
          </div>
          <div className="space-y-3 mt-4">
            {stats.roomStatusData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="capitalize">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray dark:border-slate-700 overflow-hidden min-w-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Active Hotel Guests</h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
            {stats.activeGuests > 0 && rawData?.rooms ? (
              /* Map actual occupied rooms if available */
              rawData.rooms.filter(r => r.guest_id).slice(0, 5).map((room, i) => (
                <div key={room.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 font-bold">
                      {room.room_number.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{room.guest_name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">Room {room.room_number} • {room.room_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Occupied</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 text-sm italic">No active guests at the moment</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray dark:border-slate-700 overflow-hidden min-w-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Restaurant Orders</h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline">Full List</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
             {stats.pendingKOTs > 0 && rawData?.bills ? (
               rawData.bills
                 .filter(b => (b.payment_status || b.status || '').toLowerCase().includes('pending'))
                 .slice(0, 5)
                 .map((bill, i) => (
                <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Order #{bill.bill_no}</p>
                      <p className="text-xs text-slate-500">{bill.table_no} • {bill.waiter_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-bold text-amber-600">${bill.net_amount}</p>
                  </div>
                </div>
              ))
             ) : (
               <div className="p-10 text-center text-slate-400 text-sm italic">No pending orders in the kitchen</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;