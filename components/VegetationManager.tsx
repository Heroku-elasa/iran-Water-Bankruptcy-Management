import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendMessageToGemini, analyzeImageWithGemini } from '../services/geminiService';
import { getWeatherData } from '../services/weatherService';
import { HYDROMAP_SYSTEM_INSTRUCTION } from '../constants';
import { DailyWeather } from '../types';
import AuditReportRenderer from './AuditReportRenderer';
import HydroAnalysisDashboard from './HydroAnalysisDashboard';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, LayersControl, Circle, Polygon, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- MOCK BASIN DATA (GeoPandas Simulation) ---
const BASINS = [
    {
        name: 'حوضه دریاچه ارومیه',
        color: '#ef4444', // Red for critical
        path: [
            [37.0, 45.0], [38.5, 45.0], [38.5, 46.5], [37.0, 46.5] 
        ] as [number, number][]
    },
    {
        name: 'حوضه زاینده‌رود (گاوخونی)',
        color: '#f59e0b', // Amber for warning
        path: [
            [32.0, 51.5], [32.8, 51.5], [32.8, 53.0], [32.0, 53.0]
        ] as [number, number][]
    },
    {
        name: 'دشت قزوین',
        color: '#10b981', // Green
        path: [
            [35.8, 49.5], [36.5, 49.5], [36.5, 50.8], [35.8, 50.8]
        ] as [number, number][]
    }
];

const LocationMarker: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        // When the map tab becomes active, the container might not have its final size yet.
        // A small delay and invalidateSize() tells Leaflet to re-check its container's dimensions.
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => clearTimeout(timer);
    }, [map]);

    return position === null ? null : (
        <>
            <Circle 
                center={position} 
                radius={5000} 
                pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.15, dashArray: '5, 10' }} 
            />
            <CircleMarker center={position} radius={6} pathOptions={{ color: '#0ea5e9', fillColor: '#fff', fillOpacity: 1, weight: 3 }}>
                <Popup>
                    <div className="text-right font-sans">
                        <span className="font-bold block mb-1">نقطه تحلیل</span>
                        <span className="text-xs text-gray-500">Lat: {position.lat.toFixed(4)}</span><br/>
                        <span className="text-xs text-gray-500">Lng: {position.lng.toFixed(4)}</span>
                    </div>
                </Popup>
            </CircleMarker>
        </>
    );
};

const VegetationManager: React.FC = () => {
    const { t, direction } = useLanguage();
    const [activeTab, setActiveTab] = useState<'region' | 'vision' | 'map'>('map');
    const [isLoading, setIsLoading] = useState(false);

    // Region State
    const [regionInput, setRegionInput] = useState('');
    const [regionResult, setRegionResult] = useState<string | null>(null);

    // Vision State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string>('');
    const [visionPrompt, setVisionPrompt] = useState('');
    const [visionResult, setVisionResult] = useState<string | null>(null);

    // Map State
    const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);
    const [mapResult, setMapResult] = useState<string | null>(null);
    const [weatherData, setWeatherData] = useState<DailyWeather | null>(null);
    const [historicalData, setHistoricalData] = useState<any[] | null>(null);


    const handleRegionSubmit = async () => {
        if (!regionInput.trim()) return;
        setIsLoading(true);
        try {
            const prompt = `به عنوان متخصص آبخیزداری، برای منطقه «${regionInput}» چه برنامه پوشش گیاهی و درختکاری را جهت تعادل‌بخشی آبخوان، کاهش تبخیر و جلوگیری از فرونشست پیشنهاد می‌کنید؟ لطفا گونه‌های بومی مقاوم به خشکی را در قالب جدول معرفی کنید و اثر هر یک بر منابع آب زیرزمینی را توضیح دهید.`;
            const response = await sendMessageToGemini(prompt);
            setRegionResult(response);
        } catch (error) {
            console.error(error);
            setRegionResult("خطا در برقراری ارتباط با هوش مصنوعی.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedImage(result);
                setMimeType(file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVisionSubmit = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        try {
            const base64Data = selectedImage.split(',')[1];
            const defaultPrompt = "این تصویر ماهواره‌ای/محیطی از یک دشت یا منطقه حفاظت شده آبی است. لطفا با تحلیل بافت خاک، توپوگرافی و پوشش گیاهی موجود، پتانسیل‌های آبخیزداری و گونه‌های گیاهی مناسب برای کاشت جهت تقویت سفره‌های آب زیرزمینی را تحلیل کنید.";
            const finalPrompt = visionPrompt || defaultPrompt;
            
            const response = await analyzeImageWithGemini(base64Data, mimeType, finalPrompt);
            setVisionResult(response);
        } catch (error) {
            console.error(error);
            setVisionResult("خطا در تحلیل تصویر.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMapAnalysis = async () => {
        if (!mapCoords) return;
        setIsLoading(true);
        setMapResult(null);
        setWeatherData(null);

        try {
            const weather = await getWeatherData(mapCoords.lat, mapCoords.lng);
            setWeatherData(weather);

            const precipTotal = weather?.precipitation_sum.reduce((a, b) => a + b, 0).toFixed(1) || 'NA';
            const tempMax = weather?.temperature_2m_max.reduce((a, b) => a + b, 0) / (weather?.temperature_2m_max.length || 1);
            
            const contextBlock = `
[HYDRO_CONTEXT]
MODE: WATERSHED_VEGETATION
LAT: ${mapCoords.lat.toFixed(4)}
LON: ${mapCoords.lng.toFixed(4)}
CURRENT_SURFACE_AREA_KM2: ${Math.floor(Math.random() * 200) + 50} 
GROUNDWATER_DEFICIT_MCM: ${Math.floor(Math.random() * 1000) + 500}
NDWI_TREND_5Y: "STABLE"
NDVI_TREND_5Y: "DECLINING"
CLIMATE_7D_TOTAL_PRECIP_MM: ${precipTotal}
CLIMATE_7D_MEAN_TMAX_C: ${tempMax.toFixed(1)}
[/HYDRO_CONTEXT]
            `;

            const response = await sendMessageToGemini(contextBlock, HYDROMAP_SYSTEM_INSTRUCTION);
            setMapResult(response);
        } catch (error) {
            console.error(error);
            setMapResult("خطا در دریافت اطلاعات نقشه.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistoryAnalysis = () => {
        if (!mapCoords) return;
        setIsLoading(true);
        setHistoricalData(null); 
        
        setTimeout(() => {
            const data = [];
            const startYear = 2020;
            for (let i = 0; i < 60; i++) {
                const date = new Date(startYear, 0);
                date.setMonth(i);
                const month = date.getMonth(); 
                const year = date.getFullYear();
                
                const isSeason = month >= 2 && month <= 6;
                const base = isSeason ? 0.7 : 0.35;
                const trend = (year - startYear) * 0.05;
                const noise = (Math.random() * 0.1) - 0.05;
                let val = base - trend + noise;
                val = Math.max(0.1, Math.min(0.9, val)); 

                data.push({
                    date: `${year}-${String(month + 1).padStart(2, '0')}`,
                    ndvi: Number(val.toFixed(2))
                });
            }
            setHistoricalData(data);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="w-full min-h-screen bg-[#f0f9ff] p-4 md:p-8 pb-32 font-sans" dir={direction}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center md:text-right flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-black mb-2 flex items-center gap-3 justify-center md:justify-start">
                            <span className="text-green-600">🌳</span>
                            {t('veg_title')} <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full border border-sky-200">v2.1 AI-Powered</span>
                        </h1>
                        <p className="text-gray-500 text-lg">{t('veg_subtitle')}</p>
                    </div>
                    {activeTab === 'map' && (
                        <div className="mt-4 md:mt-0 flex gap-2">
                             <div className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Satellites Connected
                             </div>
                             <div className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Hydro-Model Ready
                             </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex justify-center md:justify-start gap-4 mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('region')} 
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'region' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {t('veg_tab_region')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('vision')} 
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'vision' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {t('veg_tab_vision')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('map')} 
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'map' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {t('veg_tab_map')} <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 rounded">NEW</span>
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 min-h-[500px] p-6 md:p-8 relative overflow-hidden">
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                            <div className="w-20 h-20 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-brand-green font-bold text-lg animate-pulse">{t('chat_processing')}</p>
                            <p className="text-gray-400 text-sm mt-2 font-mono">Running Geo-Spatial Analysis...</p>
                        </div>
                    )}

                    {activeTab === 'region' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    type="text" 
                                    value={regionInput}
                                    onChange={(e) => setRegionInput(e.target.value)}
                                    placeholder={t('veg_input_placeholder')}
                                    className="flex-1 bg-sage-1 border border-sage-3 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-brand-black"
                                />
                                <button 
                                    onClick={handleRegionSubmit}
                                    disabled={isLoading || !regionInput}
                                    className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-900/10 disabled:opacity-50"
                                >
                                    {t('veg_btn_analyze')}
                                </button>
                            </div>
                            {regionResult && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <AuditReportRenderer content={regionResult} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'vision' && (
                        <div className="animate-fade-in space-y-8">
                             <div className="border-2 border-dashed border-sage-3 rounded-xl p-8 text-center bg-sage-1/30 hover:bg-sage-1 transition-colors relative">
                                {!selectedImage ? (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-sky-500">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-gray-600 font-medium mb-2">{t('veg_upload_label')}</p>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </>
                                ) : (
                                    <div className="relative inline-block">
                                        <img src={selectedImage} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                                        <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600">✕</button>
                                    </div>
                                )}
                             </div>
                             <div className="flex flex-col gap-4">
                                <button onClick={handleVisionSubmit} disabled={isLoading || !selectedImage} className="w-full bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/10 disabled:opacity-50">
                                    {t('veg_btn_vision')}
                                </button>
                             </div>
                             {visionResult && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <AuditReportRenderer content={visionResult} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Col: Map Controls */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-sage-1 border border-sage-3 rounded-xl p-5">
                                    <button 
                                        onClick={handleMapAnalysis}
                                        disabled={isLoading || !mapCoords}
                                        className="w-full bg-sky-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span>⚡</span>
                                        اجرای تحلیل
                                    </button>
                                    {!mapCoords && <p className="text-xs text-red-400 mt-2 text-center">لطفا ابتدا یک نقطه روی نقشه انتخاب کنید.</p>}
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">مختصات انتخابی</h4>
                                     <div className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded flex justify-between">
                                         <span>Lat: {mapCoords ? mapCoords.lat.toFixed(4) : '--'}</span>
                                         <span>Lng: {mapCoords ? mapCoords.lng.toFixed(4) : '--'}</span>
                                     </div>
                                </div>
                            </div>

                            {/* Right Col: Map Area */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-[450px] w-full rounded-xl overflow-hidden shadow-md border border-gray-300 relative z-0">
                                    <MapContainer 
                                        center={[32.4279, 53.6880]} 
                                        zoom={5} 
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={true}
                                    >
                                        <LayersControl position="topright">
                                            <LayersControl.BaseLayer checked name="نقشه خیابان (OSM)">
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                            </LayersControl.BaseLayer>
                                            <LayersControl.BaseLayer name="تصویر ماهواره‌ای (Esri)">
                                                <TileLayer
                                                    attribution='Tiles &copy; Esri'
                                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                                />
                                            </LayersControl.BaseLayer>
                                       
                                            {/* Basin Layers (GeoPandas Simulation) */}
                                            <LayersControl.Overlay checked name="حوضه‌های آبریز (Basins)">
                                                <FeatureGroup>
                                                    {BASINS.map((basin, idx) => (
                                                        <Polygon 
                                                            key={idx} 
                                                            positions={basin.path} 
                                                            pathOptions={{ color: basin.color, fillOpacity: 0.2 }}
                                                        >
                                                            <Popup>{basin.name}</Popup>
                                                        </Polygon>
                                                    ))}
                                                </FeatureGroup>
                                            </LayersControl.Overlay>
                                        </LayersControl>

                                        <LocationMarker onSelect={(lat, lng) => setMapCoords({lat, lng})} />
                                    </MapContainer>
                                </div>

                                {mapResult && (
                                    <div className="animate-fade-in">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-6 h-6 rounded bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold">AI</span>
                                            <h3 className="font-bold text-lg text-brand-black">گزارش تحلیل هیدرولوژی</h3>
                                        </div>
                                        <HydroAnalysisDashboard content={mapResult} weatherData={weatherData} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VegetationManager;