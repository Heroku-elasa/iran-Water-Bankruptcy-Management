
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Resources: React.FC = () => {
  const { t, direction } = useLanguage();

  return (
    <div className="p-6 w-full bg-[#f0f9ff] min-h-screen pb-32 font-sans" dir={direction}>
        <div className="mb-8 border-b border-gray-200 pb-4">
           <h1 className="text-2xl font-bold text-brand-black mb-1">{t('res_title')}</h1>
           <p className="text-gray-500 text-sm">{t('res_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('res_sec_templates')}</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between">
                        <span className="font-bold text-gray-800">{t('res_dl_excel')}</span>
                        <span>⬇️</span>
                    </div>
                    <div className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between">
                         <span className="font-bold text-gray-800">{t('res_dl_pdf')}</span>
                         <span>⬇️</span>
                    </div>
                </div>
            </div>
            <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-4">{t('res_sec_definitions')}</h3>
                 <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold mb-1">{t('res_def_balance')}</h4>
                        <p className="text-xs text-gray-500">{t('res_desc_balance')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold mb-1">{t('res_def_pl')}</h4>
                        <p className="text-xs text-gray-500">{t('res_desc_pl')}</p>
                    </div>
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold mb-1">{t('res_def_cash')}</h4>
                        <p className="text-xs text-gray-500">{t('res_desc_cash')}</p>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Resources;
