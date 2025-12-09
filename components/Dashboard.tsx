
import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine, ScatterChart, Scatter, ZAxis, BarChart,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LIVE_SENSOR_DATA, CHART_COLORS, WATER_USAGE_DATA, INFRASTRUCTURE_STATUS_DATA, 
  DAILY_CONSUMPTION_DATA, REGIONAL_STRESS_DATA, COMPLAINT_DATA, MAP_ZONES_DATA,
  MOCK_WATER_STATS
} from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const { t, direction } = useLanguage();
  const [activeTab, setActiveTab] = useState<'live' | 'static' | 'planning' | 'executive'>('live');

  return (
    <div className="w-full h-full bg-[#f0f9ff] flex flex-col font-sans relative" dir={direction}>
      
      {/* Toggle Header */}
      <div className="w-full bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-wrap gap-4 items-center justify-between sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           <span className="hidden md:inline">
             {activeTab === 'live' && t('dash_live')}
             {activeTab === 'static' && t('dash_static')}
             {activeTab === 'planning' && t('dash_planning')}
             {activeTab === 'executive' && t('dash_executive')}
           </span>
           <span className="md:hidden">
              {t('nav_dashboard')}
           </span>
        </h1>
        
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
           <button 
             onClick={() => setActiveTab('live')}
             className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'live' ? 'bg-sky-900 text-sky-400 shadow' : 'text-gray-500 hover:text-gray-900'}`}
           >
             <span className={`w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-sky-400 animate-pulse' : 'bg-gray-400'}`}></span>
             {t('dash_live')}
           </button>
           <button 
             onClick={() => setActiveTab('static')}
             className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'static' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
           >
             {t('dash_static')}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {activeTab === 'live' && <LiveDashboard />}
        {activeTab === 'static' && <StaticDashboard />}
        {activeTab === 'planning' && <PlanningDashboard />}
        {activeTab === 'executive' && <LiveDashboard />} {/* Reusing Live for Executive in this demo */}
      </div>
    </div>
  );
};

// --- LIVE DASHBOARD (IoT & Infrastructure) ---
const LiveDashboard: React.FC = () => {
  const { direction } = useLanguage();
  const [data, setData] = useState(LIVE_SENSOR_DATA);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        const lastItem = currentData[currentData.length - 1];
        const [hour, minute] = lastItem.time.split(':').map(Number);
        
        let newMinute = minute + 1;
        let newHour = hour;
        if (newMinute >= 60) {
          newMinute = 0;
          newHour = (newHour + 1) % 24;
        }

        const timeLabel = `${newHour}:${newMinute < 10 ? '0' + newMinute : newMinute}`;
        // Simulation: Aquifer level fluctuating (meters depth)
        const baseLevel = Math.max(100, Math.min(150, lastItem.fillLevel + (Math.random() - 0.45) * 0.5));
        
        const newItem = {
          time: timeLabel,
          fillLevel: Number(baseLevel.toFixed(1)),
          pressure: Math.floor(Math.random() * 10),
          isCritical: baseLevel > 130 ? 1 : 0, // Critical drawdown depth
          EC: 1500 + Math.random() * 100,
        };

        return [...currentData.slice(1), newItem];
      });
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 w-full bg-[#0f172a] min-h-full font-sans" dir={direction}>
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700 pb-6">
        <div>
           <h1 className="text-xl md:text-2xl font-bold text-white mb-1">پایش لحظه‌ای آبخوان‌ها و سدها</h1>
           <p className="text-xs text-slate-400 font-mono">
             منابع داده: پیزومترها • دیتالاگرهای سد • کنتورهای فهام
           </p>
        </div>
        <div className="flex gap-4">
             <div className="bg-slate-800 px-3 py-1 rounded text-xs text-sky-400 border border-sky-900/50 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                 Telemetry Active
             </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {MOCK_WATER_STATS.map((stat, idx) => (
             <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold">{stat.label}</h3>
                <div className="flex items-baseline gap-2 mt-2" dir="ltr">
                    <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
                    <span className="text-slate-500 text-xs">{stat.unit}</span>
                </div>
            </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
             <h3 className="text-white font-bold text-lg mb-4">عمق سطح ایستابی (Piezometer Depth)</h3>
             <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <defs>
                            <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} reversed={true} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                        <Area type="monotone" dataKey="fillLevel" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorFill)" name="عمق برخورد (متر)" />
                        <Bar dataKey="isCritical" barSize={3} fill="#ef4444" name="هشدار فرونشست" />
                    </ComposedChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col">
             <h3 className="text-white font-bold text-lg mb-4">وضعیت چاه‌های کشاورزی</h3>
             <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={INFRASTRUCTURE_STATUS_DATA} 
                            cx="50%" cy="50%" 
                            innerRadius={60} outerRadius={80} 
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {INFRASTRUCTURE_STATUS_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold text-white">100%</span>
                     <span className="text-xs text-slate-400">Total Wells</span>
                </div>
             </div>
          </div>
      </div>

       {/* Logs */}
       <div className="bg-black border border-slate-700 rounded-xl p-4 font-mono text-xs overflow-hidden h-[200px]">
            <div className="border-b border-slate-800 pb-2 mb-2 flex justify-between">
                <span className="text-slate-400">پیام‌های سیستمی (Telemetry Logs)</span>
                <span className="text-sky-500">● Connected</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-slate-300" dir="ltr">
                <p><span className="text-slate-500">[{lastUpdate.toLocaleTimeString()}]</span> <span className="text-blue-400">INFO</span> Well #420 Meter reading: 12 m3/h.</p>
                <p><span className="text-slate-500">[{lastUpdate.toLocaleTimeString()}]</span> <span className="text-blue-400">INFO</span> Dam gate 4 open at 20%.</p>
                {data[data.length - 1].fillLevel > 130 && (
                     <p className="bg-red-900/30 text-red-400 p-1"><span className="text-slate-500">[{lastUpdate.toLocaleTimeString()}]</span> <span className="text-red-500 font-bold">CRITICAL</span> Water Table Drop Warning! Plain: Qazvin.</p>
                )}
            </div>
        </div>
    </div>
  );
};

// --- STATIC DASHBOARD (Reports) ---
const StaticDashboard: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="p-4 md:p-6 pb-32 space-y-6">
            <h1 className="text-2xl font-bold text-brand-black">گزارشات آماری منابع آب</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                
                {/* Water Usage */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px]">
                     <h3 className="font-bold text-gray-800 mb-4">مصرف آب به تفکیک بخش‌ها</h3>
                     <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                             <Pie data={WATER_USAGE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                 {WATER_USAGE_DATA.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.fill} />
                                 ))}
                             </Pie>
                             <Tooltip />
                             <Legend />
                         </PieChart>
                     </ResponsiveContainer>
                </div>

                {/* Daily Consumption */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px]">
                    <h3 className="font-bold text-gray-800 mb-4">روند مصرف روزانه (MCM)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DAILY_CONSUMPTION_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Legend />
                            <Bar dataKey="surface" name="آب سطحی" fill="#0ea5e9" stackId="a" />
                            <Bar dataKey="ground" name="آب زیرزمینی" fill="#64748b" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Regional Stress */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px]">
                    <h3 className="font-bold text-gray-800 mb-4">شاخص تنش آبی منطقه‌ای</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REGIONAL_STRESS_DATA} layout="vertical">
                             <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                             <XAxis type="number" />
                             <YAxis dataKey="name" type="category" width={80} />
                             <Tooltip />
                             <Legend />
                             <Bar dataKey="reality" name="شاخص فعلی" fill="#ef4444" barSize={15} />
                             <Bar dataKey="target" name="حد نرمال" fill="#cbd5e1" barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                 {/* Map Placeholder */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px] relative overflow-hidden">
                     <h3 className="font-bold text-gray-800 mb-4">نقشه ریسک فرونشست (Heatmap)</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="x" name="Long" unit="" hide />
                            <YAxis type="number" dataKey="y" name="Lat" unit="" hide />
                            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Risk" unit="%" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Plains" data={MAP_ZONES_DATA}>
                                {MAP_ZONES_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        * دایره بزرگتر = ریسک بالاتر
                    </div>
                 </div>
            </div>
        </div>
    );
};

// --- PLANNING DASHBOARD (Placeholder) ---
const PlanningDashboard: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">برنامه‌ریزی تخصیص آب</h1>
            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">ماژول تخصیص حوضه آبریز (WEAP) در حال بارگذاری...</p>
            </div>
        </div>
    );
};

export default Dashboard;
