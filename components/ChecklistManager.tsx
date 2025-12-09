
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChecklistItem {
    id: string;
    text: string;
    isMandatory: boolean;
}

interface Checklist {
    id: string;
    title: string;
    description: string;
    items: ChecklistItem[];
}

const ChecklistManager: React.FC = () => {
    const { t, direction } = useLanguage();
    const [checklists, setChecklists] = useState<Checklist[]>([
        {
            id: '1',
            title: 'بازرسی چاه‌های کشاورزی (Inspection)',
            description: 'لیست کنترل فنی برای پایش چاه‌های دارای پروانه بهره‌برداری',
            items: [
                { id: 'i1', text: 'کنترل پلمپ کنتور هوشمند', isMandatory: true },
                { id: 'i2', text: 'تطبیق کشت با پروانه بهره‌برداری', isMandatory: true },
                { id: 'i3', text: 'بررسی عدم اضافه برداشت', isMandatory: true },
                { id: 'i4', text: 'فاصله تا چاه مجاور', isMandatory: false },
            ]
        }
    ]);

    const [isEditing, setIsEditing] = useState(false);
    const [currentChecklist, setCurrentChecklist] = useState<Checklist | null>(null);
    const [newItemText, setNewItemText] = useState('');

    const handleCreateNew = () => {
        setCurrentChecklist({
            id: Date.now().toString(),
            title: '',
            description: '',
            items: []
        });
        setIsEditing(true);
    };

    const handleEdit = (checklist: Checklist) => {
        setCurrentChecklist({ ...checklist });
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        setChecklists(checklists.filter(c => c.id !== id));
    };

    const handleSave = () => {
        if (!currentChecklist) return;
        if (!currentChecklist.title.trim()) {
            alert('Title is required');
            return;
        }

        const index = checklists.findIndex(c => c.id === currentChecklist.id);
        if (index >= 0) {
            const updated = [...checklists];
            updated[index] = currentChecklist;
            setChecklists(updated);
        } else {
            setChecklists([...checklists, currentChecklist]);
        }
        setIsEditing(false);
        setCurrentChecklist(null);
    };

    const handleAddItem = () => {
        if (!newItemText.trim() || !currentChecklist) return;
        const newItem: ChecklistItem = {
            id: Date.now().toString(),
            text: newItemText,
            isMandatory: false
        };
        setCurrentChecklist({
            ...currentChecklist,
            items: [...currentChecklist.items, newItem]
        });
        setNewItemText('');
    };

    const toggleItemMandatory = (itemId: string) => {
        if (!currentChecklist) return;
        const updatedItems = currentChecklist.items.map(item => 
            item.id === itemId ? { ...item, isMandatory: !item.isMandatory } : item
        );
        setCurrentChecklist({ ...currentChecklist, items: updatedItems });
    };

    const deleteItem = (itemId: string) => {
        if (!currentChecklist) return;
        const updatedItems = currentChecklist.items.filter(item => item.id !== itemId);
        setCurrentChecklist({ ...currentChecklist, items: updatedItems });
    };

    const handleAssign = (id: string) => {
        alert("Checklist assigned to active patrol unit.");
    };

    if (isEditing && currentChecklist) {
        return (
            <div className="w-full min-h-screen bg-[#f0f9ff] p-4 md:p-8 pb-32 font-sans" dir={direction}>
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">{t('chk_modal_title')}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-red-500">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('chk_label_title')}</label>
                                <input 
                                    type="text" 
                                    value={currentChecklist.title}
                                    onChange={(e) => setCurrentChecklist({...currentChecklist, title: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600/20 focus:border-sky-600 outline-none"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('chk_label_desc')}</label>
                                <input 
                                    type="text" 
                                    value={currentChecklist.description}
                                    onChange={(e) => setCurrentChecklist({...currentChecklist, description: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600/20 focus:border-sky-600 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{t('chk_sec_items')}</h3>
                            
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    placeholder={t('chk_ph_item')}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600/20 focus:border-sky-600 outline-none"
                                />
                                <button 
                                    onClick={handleAddItem}
                                    className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                                >
                                    {t('chk_btn_add_item')}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {currentChecklist.items.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-sky-600/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-xs text-gray-500">{index + 1}</span>
                                            <span className="text-gray-800">{item.text}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.isMandatory}
                                                    onChange={() => toggleItemMandatory(item.id)}
                                                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-600"
                                                />
                                                <span className="text-xs text-gray-600">{t('chk_col_mandatory')}</span>
                                            </label>
                                            <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                             <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('chk_btn_cancel')}
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-lg shadow-sky-900/10"
                            >
                                {t('chk_btn_save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f0f9ff] p-4 md:p-8 pb-32 font-sans" dir={direction}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('chk_title')}</h1>
                    <p className="text-gray-500 text-sm">{t('chk_subtitle')}</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-900/10 hover:bg-sky-700 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t('chk_btn_create')}
                </button>
            </div>

            {checklists.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <p className="text-gray-500">{t('chk_list_empty')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {checklists.map(checklist => (
                        <div key={checklist.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => handleEdit(checklist)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-blue-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                     </button>
                                     <button onClick={() => handleDelete(checklist.id)} className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{checklist.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{checklist.description}</p>
                            
                            <div className="flex items-center gap-4 mb-6 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    {checklist.items.length} {t('chk_card_items')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {checklist.items.filter(i => i.isMandatory).length} Mandatory
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAssign(checklist.id)}
                                className="w-full py-2 border border-sky-600 text-sky-600 rounded-lg font-medium hover:bg-sky-600 hover:text-white transition-colors"
                            >
                                {t('chk_btn_assign')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChecklistManager;
