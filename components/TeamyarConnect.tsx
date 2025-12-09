
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface TelemetryLog {
    id: string;
    description: string;
    date: string;
    amount: number;
    status: string;
}

const MOCK_LOGS: TelemetryLog[] = [
    { id: 'WELL-3022', description: 'دشت ورامین - ذرت علوفه‌ای', date: '10:15', amount: 450, status: 'Active' },
    { id: 'WELL-4412', description: 'دشت قزوین - باغ پسته', date: '10:30', amount: 120, status: 'Warning' },
    { id: 'DAM-1102', description: 'خروجی سد امیرکبیر', date: '10:45', amount: 12500, status: 'Normal' },
];

const TeamyarConnect: React.FC = () => {
  const { t, direction } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = () => {
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); setIsConnected(true); }, 1500);
  };

  if (!isConnected) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-[#f0f9ff] p-4" dir={direction}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md text-center">
                  <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-6">📡</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('erp_title')}</h2>
                  <p className="text-gray-500 text-sm mb-8">{t('erp_subtitle')}</p>
                  <button onClick={handleConnect} disabled={isLoading} className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold">
                      {isLoading ? t('erp_loading') : t('erp_btn_connect')}
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full min-h-screen bg-[#f0f9ff] p-8 pb-32 font-sans" dir={direction}>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{t('erp_title')}</h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">{t('erp_status_connected')}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="px-6 py-3">{t('erp_col_id')}</th>
                        <th className="px-6 py-3">{t('erp_col_desc')}</th>
                        <th className="px-6 py-3">{t('erp_col_date')}</th>
                        <th className="px-6 py-3">{t('erp_col_amount')}</th>
                        <th className="px-6 py-3">{t('erp_col_status')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {MOCK_LOGS.map((log) => (
                        <tr key={log.id}>
                            <td className="px-6 py-4 font-mono">{log.id}</td>
                            <td className="px-6 py-4">{log.description}</td>
                            <td className="px-6 py-4">{log.date}</td>
                            <td className="px-6 py-4 font-bold" dir="ltr">{log.amount} m³</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${log.status === 'Warning' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default TeamyarConnect;
