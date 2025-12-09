import React, { useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { DailyWeather } from '../types';
import { 
    ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface Props {
  content: string;
  weatherData: DailyWeather | null;
}

// Helper to parse markdown tables from the AI response
const parseMarkdownTable = (text: string) => {
    const rows = text.split('\n').map(row => row.split('|').map(cell => cell.trim()).filter(Boolean));
    if (rows.length < 2) return { headers: [], data: [] }; // Need at least header and separator
    const headers = rows[0];
    const data = rows.slice(2);
    return { headers, data };
};

const HydroAnalysisDashboard: React.FC<Props> = ({ content, weatherData }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'climate' | 'hydro' | 'recs'>('climate');
  const [showRaw, setShowRaw] = useState(false);

  const parsedReport = useMemo(() => {
    const sections = {
        mainAnalysis: '',
        hydroStatus: '',
        recommendations: '',
        stressTable: { headers: [] as string[], data: [] as string[][] },
        meterTable: { headers: [] as string[], data: [] as string[][] },
        urgentWarning: '',
    };

    if (!content || content === "Analysis Pending...") return sections;

    // Split by major sections (numbered points and === blocks)
    const mainSplit = content.split(/\n(?=\*\*۱\.|\*\*۲\.|\*\*۳\.|\*\*۴\.|===)/);
    
    sections.mainAnalysis = mainSplit[0] || '';

    const findSection = (header: string) => mainSplit.find(s => s.startsWith(header)) || '';

    sections.hydroStatus = `${findSection('**۲.')}\n${findSection('**۳.')}`;
    sections.recommendations = findSection('**۴.');

    const tableBlocks = content.split('===');
    const findTableBlock = (header: string) => tableBlocks.find(b => b.includes(header)) || '';

    const stressBlock = findTableBlock('پیش‌بینی تنش آبی');
    if (stressBlock) sections.stressTable = parseMarkdownTable(stressBlock);
    
    const meterBlock = findTableBlock('پایش کنتورهای هوشمند');
    if (meterBlock) sections.meterTable = parseMarkdownTable(meterBlock);

    const warningMatch = content.match(/\*\*هشدار فوری:\*\*\s*(.*)/);
    sections.urgentWarning = warningMatch ? warningMatch[1] : '';

    return sections;
  }, [content]);

  const weatherChartData = useMemo(() => {
    if (!weatherData) return [];
    return weatherData.time.map((time, index) => ({
      name: new Date(time).toLocaleDateString('fa-IR', { weekday: 'short' }),
      'Max Temp (°C)': weatherData.temperature_2m_max[index],
      'بارش (mm)': weatherData.precipitation_sum[index],
    }));
  }, [weatherData]);

  const renderTable = (tableData: { headers: string[], data: string[][] }, key: string) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-slate-600 bg-slate-900/50" key={key}>
          <table className="min-w-full text-sm text-right text-slate-300">
              <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                  <tr>
                      {tableData.headers.map((h, i) => <th key={i} className="px-4 py-2">{h}</th>)}
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                  {tableData.data.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/50">
                          {row.map((cell, j) => <td key={j} className="px-4 py-3">{cell}</td>)}
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  return (
    <div className="w-full bg-slate-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-slate-700 text-white font-sans">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-700 mb-6">
            <button onClick={() => setActiveTab('climate')} className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'climate' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>🌩️ {t('hydro_tab_climate')}</button>
            <button onClick={() => setActiveTab('hydro')} className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'hydro' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>📊 {t('hydro_tab_hydro')}</button>
            <button onClick={() => setActiveTab('recs')} className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'recs' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>🌱 {t('hydro_tab_recs')}</button>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
            {activeTab === 'climate' && (
                weatherChartData.length > 0 ? (
                    <div className="h-64 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={weatherChartData}>
                                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: '°C', position: 'insideTopLeft', fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'mm', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Legend wrapperStyle={{fontSize: '12px'}} />
                                <Area yAxisId="left" type="monotone" dataKey="Max Temp (°C)" fill="#f97316" stroke="#f97316" fillOpacity={0.2} />
                                <Bar yAxisId="right" dataKey="بارش (mm)" barSize={20} fill="#3b82f6" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : <p className="text-slate-400 text-center py-10">No weather data available.</p>
            )}

            {activeTab === 'hydro' && (
                <div className="space-y-4 prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-sky-400">
                    <div dangerouslySetInnerHTML={{ __html: parsedReport.hydroStatus.replace(/\n/g, '<br />') }} />
                    {parsedReport.stressTable.data.length > 0 && renderTable(parsedReport.stressTable, 'stress')}
                    {parsedReport.meterTable.data.length > 0 && renderTable(parsedReport.meterTable, 'meter')}
                    {parsedReport.urgentWarning && (
                        <div className="p-4 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300">
                            <strong className="text-red-400 block mb-2">هشدار فوری!</strong>
                            {parsedReport.urgentWarning}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'recs' && (
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-emerald-400">
                    {parsedReport.recommendations ? 
                        <div dangerouslySetInnerHTML={{ __html: parsedReport.recommendations.replace(/\n/g, '<br />') }} /> :
                        <p className="text-slate-400 text-center py-10">Processing recommendations...</p>
                    }
                </div>
            )}
        </div>
        
        {/* Raw Text Toggle */}
        <div className="mt-6 pt-4 border-t border-slate-700">
            <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-slate-400 hover:text-white">
                {showRaw ? '▼' : '▶'} مشاهده متن خام
            </button>
            {showRaw && (
                <pre className="mt-2 text-xs bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-slate-300 max-h-96">
                    {content}
                </pre>
            )}
        </div>
    </div>
  );
};

export default HydroAnalysisDashboard;
