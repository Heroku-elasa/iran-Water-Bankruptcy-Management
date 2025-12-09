
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const WPDashboard: React.FC = () => {
  const { t, direction } = useLanguage();
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Sidebar States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRTL = direction === 'rtl';

  const menuItems = [
    { label: t('wp_dashboard'), icon: 'dashboard', active: true },
    { label: t('wp_posts'), icon: 'pin', active: false },
    { label: t('wp_media'), icon: 'images', active: false },
    { label: t('wp_pages'), icon: 'page', active: false },
    { label: t('wp_comments'), icon: 'bubble', active: false },
    { label: t('wp_appearance'), icon: 'brush', active: false, sep: true },
    { label: t('wp_plugins'), icon: 'plug', active: false },
    { label: t('wp_users'), icon: 'users', active: false },
    { label: t('wp_tools'), icon: 'tools', active: false },
    { label: t('wp_settings'), icon: 'settings', active: false },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f0f1] font-sans text-[#3c434a] relative overflow-hidden" dir={direction}>
      
      {/* --- WP ADMIN TOP BAR --- */}
      <div className="h-[46px] md:h-[32px] bg-[#1d2327] text-[#c3c4c7] flex items-center justify-between px-0 md:px-3 text-[13px] z-50 sticky top-0 w-full shrink-0 shadow-md md:shadow-none">
        <div className="flex items-center h-full">
            
            {/* Mobile Menu Toggle */}
            <div 
                className="w-12 h-full flex md:hidden items-center justify-center text-white hover:bg-[#2c3338] cursor-pointer transition-colors border-r border-[#2c3338] rtl:border-r-0 rtl:border-l"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                 <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
            </div>

            <div className="w-10 md:w-8 flex items-center justify-center hover:text-[#72aee6] hover:bg-[#2c3338] h-full cursor-pointer transition-colors">
                {/* WordPress "W" Icon */}
                <svg className="w-6 h-6 md:w-5 md:h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0004 0.0512695C5.40141 0.0512695 0.0512695 5.40141 0.0512695 12C0.0512695 18.5986 5.40141 23.9487 12.0004 23.9487C18.5986 23.9487 23.9487 18.5986 23.9487 12C23.9487 5.40141 18.5986 0.0512695 12.0004 0.0512695ZM10.2224 18.9959L7.30459 10.3735L5.43285 16.425C6.96929 18.4231 9.42398 19.6644 12.0004 19.6644C12.3364 19.6644 12.6669 19.6482 12.9922 19.6174L10.2224 18.9959ZM19.3496 16.5746L16.2796 7.42588H17.8967C18.1566 7.42588 18.3672 7.21526 18.3672 6.95543C18.3672 6.6956 18.1566 6.48498 17.8967 6.48498H14.1294C13.8696 6.48498 13.659 6.6956 13.659 6.95543C13.659 7.21526 13.8696 7.42588 14.1294 7.42588H15.2289L13.1557 14.3916L10.9995 7.42588H12.1643C12.4241 7.42588 12.6347 7.21526 12.6347 6.95543C12.6347 6.6956 12.4241 6.48498 12.1643 6.48498H8.53724C8.27741 6.48498 8.06679 6.6956 8.06679 6.95543C8.06679 7.21526 8.27741 7.42588 8.53724 7.42588H9.68958L6.44421 17.8465C4.30006 16.4947 2.87321 14.1037 2.87321 12C2.87321 9.43265 3.93297 7.12458 5.62939 5.51737L10.4636 18.6659L12.0004 22.1154L13.7827 17.7513L19.3496 16.5746ZM19.6957 16.0964L16.8296 6.48498C19.3039 7.49301 21.1276 9.87355 21.1276 12C21.1276 13.5186 20.6121 14.9318 19.6957 16.0964Z"/></svg>
            </div>
            
            {/* Site Name */}
            <div className="hidden md:flex items-center gap-2 px-3 h-full hover:text-[#72aee6] hover:bg-[#2c3338] cursor-pointer transition-colors border-r border-[#2c3338] border-l-0 rtl:border-r-0 rtl:border-l">
                <svg className="w-4 h-4 text-[#9ca2a7]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                <span className="font-semibold">{t('app_title')}</span>
            </div>

            {/* Updates - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-2 px-3 h-full hover:text-[#72aee6] hover:bg-[#2c3338] cursor-pointer transition-colors">
                <svg className="w-4 h-4 text-[#9ca2a7]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                <span>3</span>
            </div>

             {/* Comments - Hidden on small Mobile */}
            <div className="hidden sm:flex items-center gap-2 px-3 h-full hover:text-[#72aee6] hover:bg-[#2c3338] cursor-pointer transition-colors">
                 <svg className="w-4 h-4 text-[#9ca2a7]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                 <span>0</span>
            </div>
             
             {/* New (+ New) */}
            <div className="flex items-center gap-1 px-3 h-full hover:text-[#72aee6] hover:bg-[#2c3338] cursor-pointer transition-colors">
                 <svg className="w-4 h-4 text-[#9ca2a7]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                 <span className="font-bold hidden md:inline">New</span>
            </div>
        </div>

        <div className="flex items-center h-full px-3 hover:text-[#72aee6] hover:bg-[#2c3338] cursor-pointer transition-colors">
            <span className="mr-2 ml-2 text-xs md:text-[13px] whitespace-nowrap hidden sm:inline">{t('role_manager')}</span>
            <div className="w-6 h-6 md:w-5 md:h-5 bg-gray-500 rounded-sm"></div> {/* Avatar Placeholder */}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- MOBILE OVERLAY --- */}
        {mobileMenuOpen && (
            <div 
                className="absolute inset-0 bg-black/60 z-30 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
            />
        )}

        {/* --- WP SIDEBAR --- */}
        <div 
            className={`
                bg-[#23282d] text-white flex-col text-[13px] z-40
                md:flex md:relative
                ${mobileMenuOpen ? 'fixed inset-y-0 left-0 w-[200px] flex shadow-2xl z-[60]' : 'hidden'}
                ${collapsed ? 'md:w-[36px]' : 'md:w-[160px]'}
                transition-all duration-200 shrink-0
            `}
        >
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-3">
                {menuItems.map((item, idx) => (
                    <div key={idx} className={`${item.sep ? 'mt-3' : ''}`}>
                        <div className={`
                            flex items-center px-3 py-2 cursor-pointer transition-colors relative
                            ${item.active ? 'bg-[#2271b1] text-white font-bold' : 'text-[#f0f0f1] hover:bg-[#191e23] hover:text-[#72aee6]'}
                            ${collapsed ? 'justify-center px-2' : 'gap-2'}
                        `} title={collapsed ? item.label : ''}>
                            {item.active && <div className={`absolute w-1 h-full bg-[#72aee6] top-0 ${isRTL ? 'right-[-4px]' : 'left-[-4px]'}`}></div>}
                            
                            {/* Icons */}
                            <div className={`w-5 h-5 flex items-center justify-center opacity-70 ${item.active ? 'opacity-100' : ''} shrink-0`}>
                                {item.icon === 'dashboard' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/></svg>}
                                {item.icon === 'pin' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>}
                                {item.icon === 'images' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>}
                                {item.icon === 'page' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>}
                                {item.icon === 'bubble' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>}
                                {item.icon === 'brush' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/></svg>}
                                {item.icon === 'plug' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-2.5 2.5a1 1 0 11-1.414-1.414l.793-.793-1.028-3.205-2.518 1.259V17a1 1 0 11-2 0v-4.577L6 11.237 4.97 14.442l.794.793a1 1 0 01-1.414 1.414l-2.5-2.5a1 1 0 01.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z"/></svg>}
                                {item.icon === 'users' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>}
                                {item.icon === 'tools' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 3.05a7 7 0 109.9 9.9L10 7.95 5.05 3.05zM6.45 6.45l2.475 2.475-1.06 1.06L5.39 7.51a5.5 5.5 0 011.06-1.06zm9.155 3.595a5.464 5.464 0 01-1.343 1.343L11.72 8.9l2.475-2.475 1.41 1.62zM3 17a1 1 0 011-1h2.5a1 1 0 01.707.293l2.5 2.5a1 1 0 010 1.414l-1.5 1.5a1 1 0 01-1.414 0l-2.5-2.5A1 1 0 014 19.5V17z" clipRule="evenodd"/></svg>}
                                {item.icon === 'settings' && <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>}
                            </div>
                            
                            {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                            {item.active && !collapsed && <div className={`absolute border-[8px] border-transparent top-1/2 -translate-y-1/2 ${isRTL ? 'border-r-[#f0f0f1] right-full mr-[-1px]' : 'border-l-[#f0f0f1] left-full ml-[-1px]'}`}></div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Collapse Menu - Desktop Only */}
            <div 
                className={`mt-auto px-3 py-3 text-[#a0a5aa] hover:text-[#72aee6] cursor-pointer hidden md:flex items-center gap-2 border-t border-[#2c3338] ${collapsed ? 'justify-center' : ''}`}
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className={`w-5 h-5 rounded-full border border-current flex items-center justify-center`}>
                    <svg className={`w-3 h-3 fill-current ${isRTL ? (collapsed ? 'rotate-0' : 'rotate-180') : (collapsed ? 'rotate-180' : 'rotate-0')}`} viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </div>
                {!collapsed && <span>Collapse menu</span>}
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-[#f0f0f1]">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h1 className="text-2xl font-normal text-[#1d2327]">{t('wp_dashboard')}</h1>
                <button className="hidden sm:block bg-white border border-[#c3c4c7] text-[#3c434a] px-3 py-1 text-[13px] rounded hover:border-[#8c8f94] hover:text-[#2271b1]">Screen Options ▼</button>
            </div>

            {/* Welcome Panel */}
            {showWelcome && (
                <div className="bg-white border border-[#c3c4c7] p-4 md:p-6 mb-6 relative shadow-sm">
                    <button onClick={() => setShowWelcome(false)} className="absolute top-2 right-2 md:top-4 md:right-4 text-[#787c82] hover:text-[#b32d2e] font-bold p-2">✕</button>
                    <h2 className="text-[18px] md:text-[21px] font-normal mb-2 text-[#1d2327] pr-6">{t('wp_welcome_title')}</h2>
                    <p className="text-[14px] md:text-[16px] text-[#3c434a] mb-6">{t('wp_welcome_subtitle')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Get Started</h3>
                            <button className="bg-[#2271b1] text-white px-4 py-2 rounded text-[14px] font-medium hover:bg-[#135e96] mb-4 w-full md:w-auto">Customize Your Site</button>
                            <p className="text-[#646970]">or, <a href="#" className="text-[#2271b1] hover:underline">change your theme completely</a></p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Next Steps</h3>
                            <ul className="space-y-1 text-[#2271b1]">
                                <li><a href="#" className="hover:underline flex items-center gap-1"><span className="text-[#646970]">✎</span> Write your first blog post</a></li>
                                <li><a href="#" className="hover:underline flex items-center gap-1"><span className="text-[#646970]">+</span> Add an About page</a></li>
                                <li><a href="#" className="hover:underline flex items-center gap-1"><span className="text-[#646970]">👁</span> View your site</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">More Actions</h3>
                             <ul className="space-y-1 text-[#2271b1]">
                                <li><a href="#" className="hover:underline flex items-center gap-1"><span className="text-[#646970]">W</span> Manage widgets or menus</a></li>
                                <li><a href="#" className="hover:underline flex items-center gap-1"><span className="text-[#646970]">💬</span> Turn comments on or off</a></li>
                                <li><a href="#" className="hover:underline flex items-center gap-1"><span className="text-[#646970]">📖</span> Learn more about getting started</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                
                {/* At a Glance */}
                <div className="bg-white border border-[#c3c4c7] shadow-sm">
                    <div className="p-3 border-b border-[#dcdcde] flex justify-between items-center cursor-move bg-gray-50 md:bg-white">
                        <h3 className="font-semibold text-[14px]">{t('wp_at_a_glance')}</h3>
                        <button className="text-[#787c82]">▲</button>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 text-[#2271b1] text-[14px]">
                            <div className="flex items-center gap-1 cursor-pointer hover:underline">
                                <span className="font-bold text-[#3c434a]">1402</span> {t('wp_posts')}
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:underline">
                                <span className="font-bold text-[#3c434a]">12</span> {t('wp_pages')}
                            </div>
                             <div className="flex items-center gap-1 cursor-pointer hover:underline">
                                <span className="font-bold text-[#3c434a]">0</span> {t('wp_comments')}
                            </div>
                        </div>
                        <p className="text-[13px] text-[#646970]">Running <span className="font-semibold">HesabrasYar Audit Core v2.5</span></p>
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-white border border-[#c3c4c7] shadow-sm">
                     <div className="p-3 border-b border-[#dcdcde] flex justify-between items-center cursor-move bg-gray-50 md:bg-white">
                        <h3 className="font-semibold text-[14px]">{t('wp_activity')}</h3>
                        <button className="text-[#787c82]">▲</button>
                    </div>
                    <div className="p-0">
                        <div className="p-3 border-b border-[#f0f0f1]">
                             <p className="text-[#646970] text-[13px] mb-1">Recently Published</p>
                             <ul className="space-y-2">
                                 <li className="flex justify-between items-start text-[13px]">
                                     <div>
                                         <span className="text-[#a7aaad] block text-xs">Nov 14, 10:30 AM</span>
                                         <a href="#" className="text-[#2271b1] hover:underline">Audit Report: Q3 Financials</a>
                                     </div>
                                 </li>
                                  <li className="flex justify-between items-start text-[13px]">
                                     <div>
                                         <span className="text-[#a7aaad] block text-xs">Nov 13, 04:15 PM</span>
                                         <a href="#" className="text-[#2271b1] hover:underline">Fraud Detection Alert #442</a>
                                     </div>
                                 </li>
                             </ul>
                        </div>
                        <div className="p-3">
                             <p className="text-[#646970] text-[13px] mb-1">Recent Comments</p>
                             <p className="text-[13px] text-[#646970] italic">No comments yet.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Draft */}
                <div className="bg-white border border-[#c3c4c7] shadow-sm">
                     <div className="p-3 border-b border-[#dcdcde] flex justify-between items-center cursor-move bg-gray-50 md:bg-white">
                        <h3 className="font-semibold text-[14px]">{t('wp_quick_draft')}</h3>
                        <button className="text-[#787c82]">▲</button>
                    </div>
                    <div className="p-4">
                        <div className="mb-3">
                            <label className="block text-[#646970] text-[13px] mb-1">{t('wp_title_placeholder')}</label>
                            <input 
                                type="text" 
                                value={draftTitle}
                                onChange={(e) => setDraftTitle(e.target.value)}
                                className="w-full border border-[#8c8f94] p-1.5 rounded-sm text-[13px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" 
                            />
                        </div>
                         <div className="mb-3">
                            <label className="block text-[#646970] text-[13px] mb-1">{t('wp_content_placeholder')}</label>
                            <textarea 
                                value={draftContent}
                                onChange={(e) => setDraftContent(e.target.value)}
                                rows={4}
                                className="w-full border border-[#8c8f94] p-1.5 rounded-sm text-[13px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" 
                            />
                        </div>
                        <button className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-3 py-1.5 rounded text-[13px] hover:bg-[#f0f0f1] font-medium transition-colors">
                            {t('wp_save_draft')}
                        </button>
                    </div>
                </div>

                {/* Teamyar News */}
                <div className="bg-white border border-[#c3c4c7] shadow-sm">
                     <div className="p-3 border-b border-[#dcdcde] flex justify-between items-center cursor-move bg-gray-50 md:bg-white">
                        <h3 className="font-semibold text-[14px]">{t('wp_news')}</h3>
                        <button className="text-[#787c82]">▲</button>
                    </div>
                    <div className="p-4">
                         <ul className="space-y-3">
                             <li>
                                 <a href="#" className="text-[#2271b1] font-medium text-[13px] hover:underline">Teamyar ERP v15 Released</a>
                                 <p className="text-[#646970] text-[12px] mt-0.5">New modules for advanced manufacturing and AI auditing integration available now.</p>
                             </li>
                             <li>
                                 <a href="#" className="text-[#2271b1] font-medium text-[13px] hover:underline">HesabrasYar Standard 1404 Update</a>
                                 <p className="text-[#646970] text-[12px] mt-0.5">Full compliance with the latest Iranian tax laws.</p>
                             </li>
                             <li className="pt-2 border-t border-[#f0f0f1]">
                                 <a href="#" className="text-[#2271b1] text-[13px] hover:underline flex items-center gap-1">
                                    Meet us at Tehran Gitex 2025 <span className="text-[#646970]">→</span>
                                 </a>
                             </li>
                         </ul>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 border-t border-[#dcdcde] pt-3 text-[13px] text-[#646970] flex flex-wrap gap-4 pb-20 md:pb-0">
                <p>Thank you for creating with <a href="#" className="text-[#2271b1] hover:underline">Teamyar & WordPress</a>.</p>
                <p>Version 6.4.2</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WPDashboard;
