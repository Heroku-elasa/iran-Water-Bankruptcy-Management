
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  REGIONAL_STRESS_DATA, 
  WATER_USAGE_DATA, 
  MOCK_WATER_STATS,
  INFRASTRUCTURE_STATUS_DATA,
  DAILY_CONSUMPTION_DATA
} from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell 
} from 'recharts';


interface Props {
    onNavigate: (view: any) => void;
}

const Landing: React.FC<Props> = ({ onNavigate }) => {
  const { t, direction } = useLanguage();

  return (
    <div className="w-full h-full bg-[#f0f9ff] font-sans text-brand-black overflow-y-auto" dir={direction}>
        
        {/* Hero Section */}
        <div className="relative bg-[#0284c7] text-white py-20 px-6 md:px-12 overflow-hidden min-h-[600px] flex items-center">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-1 space-y-8 text-center lg:text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 text-xs font-medium border border-sky-500/30 mx-auto lg:mx-0">
                        <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse"></span>
                        Iran Water Security v2.0
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                        {t('landing_hero_title')}
                    </h1>
                    <p className="text-lg text-sky-100 max-w-xl leading-relaxed mx-auto lg:mx-0">
                        {t('landing_hero_desc')}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                        <button 
                            onClick={() => onNavigate('dashboard')}
                            className="px-8 py-4 bg-white hover:bg-gray-100 text-sky-700 font-bold rounded-xl shadow-lg shadow-sky-900/20 transition-all transform hover:-translate-y-1"
                        >
                            {t('landing_cta_start')}
                        </button>
                    </div>
                </div>
                
                {/* Code Block Visual - Hydrology Data */}
                <div className="flex-1 w-full max-w-lg hidden md:block">
                    <div className="rounded-xl overflow-hidden shadow-2xl border border-sky-800 bg-[#0c4a6e] transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center justify-between px-4 py-3 bg-[#082f49] border-b border-sky-800">
                             <div className="flex gap-2">
                                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                             </div>
                             <span className="text-xs text-sky-300 font-mono">piezometer_analysis.py</span>
                        </div>
                        <div className="p-6 overflow-x-auto" dir="ltr">
                            <pre className="text-sm font-mono leading-relaxed text-sky-100">
<code className="language-python">
<span className="text-purple-400">import</span> hydro_tools <span className="text-purple-400">as</span> ht

<span className="text-gray-400"># Check aquifer levels in Critical Plains</span>
<span className="text-purple-400">for</span> well <span className="text-purple-400">in</span> ht.get_piezometers(plain=<span className="text-green-400">"Qazvin"</span>):
    current_level = well.read_depth()
    
    <span className="text-purple-400">if</span> current_level &gt; well.critical_threshold:
        ht.alert_manager(
            well_id=well.id, 
            risk=<span className="text-red-400">"SUBSIDENCE_DANGER"</span>
        )

<span className="text-yellow-400">print</span>("Artificial Recharge Plan Activated")
</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* National Water Status Dashboard Section */}
        <div className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">وضعیت لحظه‌ای منابع آب کشور</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        نمای کلی از شاخص‌های کلیدی، مصرف بخش‌ها و تنش آبی در حوضه‌های آبریز اصلی کشور.
                    </p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {MOCK_WATER_STATS.map((stat, idx) => (
                        <div key={idx} className="bg-sky-50/50 p-6 rounded-2xl border-2 border-sky-100 text-center flex flex-col items-center justify-center">
                            <p className="text-sm font-medium text-sky-800 mb-2">{stat.label}</p>
                            <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-sky-600 mt-1">{stat.unit}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Consumption Pie Chart */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">تفکیک مصرف آب</h3>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={WATER_USAGE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {WATER_USAGE_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '8px' }}/>
                                    <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Vazirmatn' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Infrastructure Status Pie Chart */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">وضعیت چاه‌های کشاورزی</h3>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={INFRASTRUCTURE_STATUS_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {INFRASTRUCTURE_STATUS_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '8px' }}/>
                                    <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Vazirmatn' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Regional Stress Bar Chart */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">شاخص تنش آبی منطقه‌ای</h3>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={REGIONAL_STRESS_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fontFamily: 'Vazirmatn' }} />
                                    <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '8px' }}/>
                                    <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Vazirmatn' }} />
                                    <Bar dataKey="reality" name="شاخص فعلی" fill="#ef4444" barSize={15} />
                                    <Bar dataKey="target" name="حد نرمال" fill="#cbd5e1" barSize={15} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Daily Consumption Trend Bar Chart */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">روند مصرف روزانه (MCM)</h3>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DAILY_CONSUMPTION_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Vazirmatn' }} />
                                    <YAxis tick={{ fontSize: 10, fontFamily: 'Vazirmatn' }} />
                                    <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '8px' }} cursor={{ fill: 'transparent' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Vazirmatn' }} />
                                    <Bar dataKey="surface" name="آب سطحی" fill="#0ea5e9" stackId="a" />
                                    <Bar dataKey="ground" name="آب زیرزمینی" fill="#64748b" stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">ویژگی‌های آب‌بان</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 mb-6 text-2xl">💧</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing_feat_1_title')}</h3>
                    <p className="text-gray-500 leading-relaxed">{t('landing_feat_1_desc')}</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 text-2xl">📡</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing_feat_2_title')}</h3>
                    <p className="text-gray-500 leading-relaxed">{t('landing_feat_2_desc')}</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6 text-2xl">📉</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing_feat_3_title')}</h3>
                    <p className="text-gray-500 leading-relaxed">{t('landing_feat_3_desc')}</p>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1e293b] text-gray-400 py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-600 rounded flex items-center justify-center text-white font-bold text-lg">A</div>
                    <span className="text-white font-bold text-lg">AbBaan</span>
                 </div>
                 <div className="text-sm">
                     © 2025 Ministry of Energy - Water Crisis Division.
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Landing;
