
import React from 'react';
import { MOCK_WATER_STATS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: 'landing' | 'dashboard' | 'chat' | 'finetuning' | 'resources' | 'wp_dashboard' | 'teamyar_erp' | 'checklists' | 'vegetation';
  onViewChange: (view: 'landing' | 'dashboard' | 'chat' | 'finetuning' | 'resources' | 'wp_dashboard' | 'teamyar_erp' | 'checklists' | 'vegetation') => void;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
}

const SidebarContent: React.FC<SidebarProps & { isMobile?: boolean }> = ({ currentView, onViewChange, onClose, isMobile }) => {
  const { language, setLanguage, t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const getStatLabel = (index: number) => {
    const keys = ['stat_docs', 'stat_discrepancies', 'stat_fraud', 'stat_score'];
    return t(keys[index] || 'stat_docs');
  };

  const handleNavClick = (view: any) => {
    onViewChange(view);
    if (isMobile && onClose) onClose();
  };

  return (
    <>
      <div className="p-8 border-b border-white/10 flex justify-between items-start">
        <div className="cursor-pointer" onClick={() => handleNavClick('landing')}>
            <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-brand-black font-bold text-xl shrink-0">
                A
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t('app_title')}</h1>
            </div>
            <p className="text-gray-400 text-xs mt-1 opacity-80">
            {t('app_subtitle')}
            </p>
        </div>
        {isMobile && (
            <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
        )}
      </div>

      <nav className="px-4 py-4">
          <ul className="space-y-1">
              <li>
                  <button onClick={() => handleNavClick('landing')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'landing' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">🏠</span> {t('nav_home')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('dashboard')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'dashboard' ? 'bg-white/10 text-sky-400' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">💧</span> {t('nav_dashboard')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('vegetation')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'vegetation' ? 'bg-green-900/30 text-green-300' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">🌳</span> {t('nav_vegetation')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('chat')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'chat' ? 'bg-white/10 text-sky-400' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">🧠</span> {t('nav_chat')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('finetuning')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'finetuning' ? 'bg-purple-900/30 text-purple-300' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">📉</span> {t('nav_finetuning')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('resources')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'resources' ? 'bg-amber-900/30 text-amber-300' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">⚖️</span> {t('nav_resources')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('checklists')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'checklists' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">📋</span> {t('nav_checklists')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('teamyar_erp')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'teamyar_erp' ? 'bg-emerald-900/30 text-emerald-300' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">📡</span> {t('nav_erp')}
                  </button>
              </li>
              <li>
                  <button onClick={() => handleNavClick('wp_dashboard')} className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'wp_dashboard' ? 'bg-red-900/30 text-red-300' : 'text-gray-400 hover:text-white'}`}>
                      <span className="text-lg">📢</span> {t('nav_wp')}
                  </button>
              </li>
          </ul>
      </nav>

      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        <div>
          <h2 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-4">{t('stats_today')}</h2>
          <div className="grid grid-cols-1 gap-3">
            {MOCK_WATER_STATS.map((stat, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-sky-500/50 transition-colors">
                <p className="text-gray-400 text-xs mb-1">{getStatLabel(idx)}</p>
                <div className="flex justify-between items-end">
                    <p className={`text-xl font-medium ${stat.color.includes('red') ? 'text-red-400' : (stat.color.includes('amber') ? 'text-amber-400' : 'text-white')}`}>{stat.value}</p>
                    <span className="text-[10px] text-gray-500">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-black/20 border-t border-white/10 mt-auto">
        <div className="mb-4">
             <select 
               value={language} 
               onChange={(e) => setLanguage(e.target.value as any)}
               className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-white p-2 outline-none appearance-none cursor-pointer"
             >
                 <option value="fa" className="bg-brand-black">فارسی (Persian)</option>
                 <option value="en" className="bg-brand-black">English</option>
             </select>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-700 flex items-center justify-center text-white font-bold shadow-lg border border-white/20">
                M
            </div>
            <div>
                <p className="text-sm font-medium text-white">{t('role_manager')}</p>
                <p className="text-xs text-gray-400">Niroo Ministry</p>
            </div>
        </div>
      </div>
    </>
  );
};

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  if (props.variant === 'mobile') {
    return (
      <div className={`fixed inset-0 z-50 lg:hidden ${props.isOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={props.onClose}></div>
        <div className={`absolute inset-y-0 ${isRTL ? 'right-0' : 'left-0'} w-80 bg-[#1e293b] text-white flex flex-col shadow-2xl transform transition-transform duration-300 ${props.isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
             <SidebarContent {...props} isMobile={true} />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-[#1e293b] text-white flex-col hidden lg:flex h-screen sticky top-0 ${isRTL ? 'border-l' : 'border-r'} border-white/10 z-40 shrink-0`}>
      <SidebarContent {...props} isMobile={false} />
    </div>
  );
};

export default Sidebar;
