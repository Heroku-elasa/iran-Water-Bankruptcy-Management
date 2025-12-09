import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendMessageToGemini } from '../services/geminiService';
import { getWeatherData } from '../services/weatherService';
import { HYDROMAP_SYSTEM_INSTRUCTION } from '../constants';
import HydroAnalysisDashboard from './HydroAnalysisDashboard';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, LayersControl, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DailyWeather, BasinData } from '../types';

// Helper to generate a mock basin polygon around a center point (Simulating watershed delineation)
const generateBasinPolygon = (lat: number, lng: number): [number, number][] => {
    const points: [number, number][] = [];
    const radius = 0.05; // approx 5km
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * (Math.PI / 180);
        // Add some irregularity to simulate natural borders
        const r = radius * (0.8 + Math.random() * 0.4);
        points.push([
            lat + r * Math.cos(angle),
            lng + r * Math.sin(angle)
        ]);
    }
    return points;
};

const MapController: React.FC<{ 
    mode: 'point' | 'basin';
    onSelect: (lat: number, lng: number) => void 
}> = ({ mode, onSelect }) => {
    const map = useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

const HydroMapManager: React.FC = () => {
    const { t, direction } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    
    // Analysis Mode
    const [analysisMode, setAnalysisMode] = useState<'point' | 'basin'>('point');

    // Map State
    const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);
    const [mapResult, setMapResult] = useState<string | null>(null);
    const [historicalData, setHistoricalData] = useState<any[] | null>(null);
    
    // New Scientific Data
    const [weatherData, setWeatherData] = useState<DailyWeather | null>(null);
    const [basinData, setBasinData] = useState<BasinData | null>(null);

    const handleMapClick = async (lat: number, lng: number) => {
        setMapCoords({ lat, lng });
        setMapResult(null);
        setHistoricalData(null);
        setWeatherData(null);
        setBasinData(null);
        
        let calculatedBasin: BasinData | null = null;

        // 1. Generate Geospatial Data (Simulating Geopandas)
        if (analysisMode === 'basin') {
            const polygon = generateBasinPolygon(lat, lng);
            calculatedBasin = {
                id: `BSN-${Math.floor(Math.random()*1000)}`,
                area: Number((15 + Math.random() * 10).toFixed(2)), // Mock km2
                perimeter: Number((12 + Math.random() * 5).toFixed(2)), // Mock km
                name: `Catchment Zone ${String.fromCharCode(65+Math.floor(Math.random()*26))}`,
                coordinates: polygon
            };
            setBasinData(calculatedBasin);
        }

        setIsLoading(true);

        try {
            // 2. Fetch Real Scientific Data (Open-Meteo)
            const weather = await getWeatherData(lat, lng);
            setWeatherData(weather);

            // 3. Simulate Historical Data Fetch (NDWI Trend)
            const data = [];
            const startYear = 2021;
            for (let i = 0; i < 48; i++) {
                const date = new Date(startYear, 0);
                date.setMonth(i);
                const month = date.getMonth(); 
                const year = date.getFullYear();
                
                // Seasonal: Water levels drop in late summer (Month 8-9)
                const isDrySeason = month >= 6 && month <= 9;
                const base = isDrySeason ? 150 : 280; 
                const trend = (year - startYear) * 15;
                const noise = (Math.random() * 20) - 10;
                let val = base - trend + noise;
                val = Math.max(50, val);

                data.push({
                    date: `${year}-${String(month + 1).padStart(2, '0')}`,
                    area: Number(val.toFixed(1))
                });
            }
            setHistoricalData(data);

            // 4. Construct Scientific Context Block for AI
            const currentArea = calculatedBasin ? calculatedBasin.area : 236.6; // Mock if point
            const maxArea5Y = currentArea * (1.2 + Math.random() * 0.3);
            const precipTotal = weather?.precipitation_sum.reduce((a, b) => a + b, 0).toFixed(1) || 'NA';
            const tempMax = weather?.temperature_2m_max.reduce((a, b) => a + b, 0) / (weather?.temperature_2m_max.length || 1);
            
            let contextBlock = `
[HYDRO_CONTEXT]
MODE: ${analysisMode === 'basin' ? 'WATERSHED_VEGETATION' : 'SURFACE_WATER'}
`;
            if (calculatedBasin) {
                contextBlock += `
BASIN_ID: ${calculatedBasin.id}
BASIN_NAME: "${calculatedBasin.name}"
BASIN_PERIMETER_KM: ${calculatedBasin.perimeter}
`;
            }
            contextBlock += `
LAT: ${lat.toFixed(4)}
LON: ${lng.toFixed(4)}
CURRENT_SURFACE_AREA_KM2: ${currentArea}
MAX_SURFACE_AREA_KM2_LAST_5Y: ${maxArea5Y.toFixed(2)}
RESERVOIR_STORAGE_MCM: ${Math.floor(Math.random() * 500) + 100}
RESERVOIR_DEFICIT_MCM: ${Math.floor(Math.random() * 200)}
GROUNDWATER_DEFICIT_MCM: ${Math.floor(Math.random() * 1000) + 500}
NDWI_TREND_5Y: "DECLINING"
NDVI_TREND_5Y: "STABLE"
CLIMATE_7D_TOTAL_PRECIP_MM: ${precipTotal}
CLIMATE_7D_MEAN_TMAX_C: ${tempMax.toFixed(1)}
[/HYDRO_CONTEXT]
            `;

            const response = await sendMessageToGemini(contextBlock, HYDROMAP_SYSTEM_INSTRUCTION);
            setMapResult(response);

        } catch (error) {
            console.error(error);
            setMapResult("Error connecting to HydroMap AI server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#0f172a] text-white p-4 md:p-8 pb-32 font-sans" dir={direction}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-end border-b border-slate-700 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-sky-400 mb-2 flex items-center gap-3">
                            <span className="text-4xl">🛰️</span>
                            {t('hydro_title')} <span className="text-white text-lg opacity-50 font-normal">| Scientific Edition</span>
                        </h1>
                        <p className="text-slate-400 text-lg">{t('hydro_subtitle')}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <div className="bg-slate-800 p-1 rounded-lg border border-slate-600 flex">
                            <button 
                                onClick={() => setAnalysisMode('point')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${analysisMode === 'point' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                📍 {t('hydro_mode_point')}
                            </button>
                            <button 
                                onClick={() => setAnalysisMode('basin')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${analysisMode === 'basin' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                ⬡ {t('hydro_mode_basin')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Col: Map */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-2xl border border-slate-600 relative z-0">
                            <MapContainer 
                                center={[34.3279, 52.6880]} // Central Iran
                                zoom={6} 
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                            >
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="Satellite (Esri)">
                                        <TileLayer
                                            attribution='Tiles &copy; Esri'
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="Terrain (Google)">
                                        <TileLayer
                                            url="http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}"
                                            attribution="Google"
                                        />
                                    </LayersControl.BaseLayer>
                                </LayersControl>
                                
                                <MapController mode={analysisMode} onSelect={handleMapClick} />

                                {mapCoords && (
                                    <>
                                        <CircleMarker center={[mapCoords.lat, mapCoords.lng]} radius={6} pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}>
                                            <Popup>Target: {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}</Popup>
                                        </CircleMarker>
                                        {analysisMode === 'basin' && basinData && (
                                            <Polygon 
                                                positions={basinData.coordinates}
                                                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 2, dashArray: '5,5' }}
                                            />
                                        )}
                                    </>
                                )}
                            </MapContainer>
                            
                            {/* Overlay UI on Map */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400]">
                                {isLoading && (
                                    <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-slate-600 flex items-center gap-2 text-sky-400 text-sm font-bold animate-pulse">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        {t('hydro_loading_analysis')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Analysis & Stats */}
                    <div className="space-y-6 overflow-y-auto max-h-[800px] custom-scrollbar">
                        
                        {mapCoords && (
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                                <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold">COORDINATES</h3>
                                <p className="text-lg font-mono text-white mt-1">{mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}</p>
                            </div>
                        )}

                        {/* 1. Historical Chart */}
                        {historicalData ? (
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                                <h3 className="text-sky-400 font-bold mb-4 text-sm uppercase tracking-wider flex justify-between">
                                    {t('hydro_chart_title')}
                                    <span className="bg-slate-700 text-white px-2 py-0.5 rounded text-xs">xarray / rasterio</span>
                                </h3>
                                <div className="h-[180px] w-full" dir="ltr">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historicalData}>
                                            <defs>
                                                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                            <XAxis dataKey="date" tick={{fontSize: 9, fill: '#94a3b8'}} tickLine={false} axisLine={false} minTickGap={30} />
                                            <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#60a5fa' }}
                                            />
                                            <Area type="monotone" dataKey="area" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" name="Surface Area (km²)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                           !mapCoords && (
                                <div className="bg-slate-800 h-[250px] rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-8 text-center border-dashed">
                                    <div className="text-4xl mb-4 opacity-30">📉</div>
                                    <p>Select a location on the map to trigger Geospatial & Climate Analysis.</p>
                                </div>
                           )
                        )}

                        {/* 2. Analysis Report & Weather */}
                        {(mapResult || weatherData) && (
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                                    <span className="text-xl">📝</span>
                                    <h3 className="font-bold text-white">Advanced Hydro-Analytics</h3>
                                </div>
                                
                                <HydroAnalysisDashboard 
                                    content={mapResult || "Analysis Pending..."} 
                                    weatherData={weatherData}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HydroMapManager;