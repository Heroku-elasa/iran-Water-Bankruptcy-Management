

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FineTuning from './components/FineTuning';
import Resources from './components/Resources';
import WPDashboard from './components/WPDashboard';
import Landing from './components/Landing';
import TeamyarConnect from './components/TeamyarConnect';
import ChecklistManager from './components/ChecklistManager';
import VegetationManager from './components/VegetationManager';
import HydroMapManager from './components/HydroMapManager';
import AuditReportRenderer from './components/AuditReportRenderer';
import AuditChart from './components/AuditChart';
import { sendMessageToGemini } from './services/geminiService';
import { Message, MessageRole } from './types';
import { useLanguage } from './contexts/LanguageContext';

const STORAGE_KEY = 'hesabrasyar_chat_history';

type ViewState = 'landing' | 'dashboard' | 'chat' | 'finetuning' | 'resources' | 'wp_dashboard' | 'teamyar_erp' | 'checklists' | 'vegetation' | 'hydromap';

const App: React.FC = () => {
  const { t, direction } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView === 'chat') {
        scrollToBottom();
    }
  }, [messages, currentView]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (currentView !== 'chat') setCurrentView('chat');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(input);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        content: responseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.SYSTEM,
        content: "متاسفانه ارتباط با سرور برقرار نشد. لطفاً تنظیمات API Key را بررسی کنید.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen bg-sage-1 text-brand-black font-sans h-screen overflow-hidden" dir={direction}>
      
      {/* Desktop Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} variant="desktop" />

      {/* Mobile Sidebar (Overlay) */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        variant="mobile" 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-screen relative w-full transition-all duration-300">
        
        {/* Mobile Header (Hidden in WP Dashboard view to avoid double headers, or keep if preferred) */}
        {currentView !== 'wp_dashboard' && (
          <div className="lg:hidden bg-brand-black text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0 z-30">
              <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-1 text-white hover:bg-white/10 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-high rounded text-brand-black font-bold flex items-center justify-center text-xs">T</div>
                      <h1 className="font-bold text-white text-sm">{t('app_title')}</h1>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                      onClick={() => setCurrentView(currentView === 'chat' ? 'dashboard' : 'chat')} 
                      className="text-white text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
                  >
                      {currentView === 'chat' ? t('nav_dashboard') : t('nav_chat')}
                  </button>
              </div>
          </div>
        )}

        {/* Main Content Area - Switched based on View */}
        <div className="flex-1 relative overflow-hidden">
            
            {/* Landing View */}
            {currentView === 'landing' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <Landing onNavigate={setCurrentView} />
                </div>
            )}

            {/* Dashboard View */}
            {currentView === 'dashboard' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <Dashboard />
                </div>
            )}

            {/* Fine-Tuning View */}
            {currentView === 'finetuning' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <FineTuning />
                </div>
            )}

            {/* Vegetation Manager View */}
            {currentView === 'vegetation' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <VegetationManager />
                </div>
            )}

            {/* HydroMap Manager View */}
            {currentView === 'hydromap' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <HydroMapManager />
                </div>
            )}

            {/* Resources View */}
            {currentView === 'resources' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <Resources />
                </div>
            )}

             {/* WP Dashboard View */}
             {currentView === 'wp_dashboard' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <WPDashboard />
                </div>
            )}

            {/* Teamyar ERP View */}
            {currentView === 'teamyar_erp' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <TeamyarConnect />
                </div>
            )}

            {/* Checklists View */}
            {currentView === 'checklists' && (
                <div className="absolute inset-0 overflow-y-auto">
                    <ChecklistManager />
                </div>
            )}

            {/* Chat View */}
            {currentView === 'chat' && (
                <div className="absolute inset-0 overflow-y-auto p-4 lg:p-10 pb-40 z-20 bg-sage-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{t('nav_chat')}</h2>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleClearHistory}
                                className="text-sm text-red-high hover:text-red-500 flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                {t('chat_clear')}
                            </button>
                        </div>
                    </div>

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50">
                            <div className="w-16 h-16 bg-sage-2 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">👋</span>
                            </div>
                            <p>{t('chat_welcome')}</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full mb-6 ${msg.role === MessageRole.USER ? 'justify-start' : 'justify-end'}`}>
                        {msg.role === MessageRole.USER ? (
                            <div className="max-w-[85%] lg:max-w-[60%] bg-brand-green text-white px-6 py-4 rounded-2xl rounded-tr-sm shadow-md">
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-4xl">
                                <div className="bg-white p-6 lg:p-10 rounded-2xl border border-sage-2 shadow-soft">
                                    <div className="flex items-center gap-3 mb-6 border-b border-sage-2 pb-4">
                                        <div className="w-8 h-8 bg-green-high/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <span className="font-bold text-brand-black text-sm">{t('chat_response')}</span>
                                    </div>
                                    <AuditReportRenderer content={msg.content} />
                                    {(msg.content.includes('نمودار') || msg.content.includes('ریسک')) && (
                                        <div className="h-72 w-full max-w-lg mx-auto mt-8">
                                            <AuditChart />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-end w-full">
                        <div className="bg-white border border-sage-2 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                            <div className="flex space-x-1 space-x-reverse">
                                <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-150"></div>
                            </div>
                            <span className="text-brand-black/60 text-sm font-medium">{t('chat_processing')}</span>
                        </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Floating Input Area (Visible except in specific views) */}
        {currentView !== 'finetuning' && currentView !== 'resources' && currentView !== 'wp_dashboard' && currentView !== 'landing' && currentView !== 'teamyar_erp' && currentView !== 'checklists' && currentView !== 'vegetation' && currentView !== 'hydromap' && (
            <div className="bg-white/90 backdrop-blur-md border-t border-sage-3 p-4 lg:px-12 lg:py-4 absolute bottom-0 w-full z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 bg-sage-1 rounded-xl flex items-center p-1.5 border border-sage-3 focus-within:border-brand-green focus-within:ring-1 focus-within:ring-brand-green/20 transition-all shadow-inner">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat_placeholder')}
                        className="w-full bg-transparent border-none focus:ring-0 text-brand-black placeholder:text-sage-5/60 resize-none max-h-32 min-h-[3rem] py-3 px-4 leading-relaxed"
                        rows={1}
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`p-3.5 rounded-xl flex items-center justify-center transition-all duration-300 ${input.trim() && !isLoading ? 'bg-brand-green text-white hover:bg-green-high hover:text-brand-black shadow-md transform hover:-translate-y-0.5' : 'bg-sage-2 text-sage-3 cursor-not-allowed'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform ${direction === 'rtl' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;