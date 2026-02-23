"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io } from 'socket.io-client';
import { AlertTriangle, Activity, Droplets, Layers, Radio, Shield, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { fetchRiskPrediction, fetchBulkRisk, type RiskPrediction, type BulkRiskResult } from '@/lib/api';
import { STATES_DATA } from '@/data/statesData';

// Indian flood-prone monitoring points
const MONITORING_POINTS = STATES_DATA.flatMap(state =>
    state.districts.map(d => ({
        name: d.name,
        state: state.name,
        lat: state.lat + (Math.random() - 0.5) * 2,
        lon: state.lng + (Math.random() - 0.5) * 2,
    }))
);

export default function MapDashboard({ onLogout }: { onLogout?: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'terrain'>('dark');
    const [showRiskZones, setShowRiskZones] = useState(true);
    const [ndfrStatus] = useState('ACTIVE');
    const [sensorCount, setSensorCount] = useState(0);
    const [zoneCount, setZoneCount] = useState(0);
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [riskData, setRiskData] = useState<BulkRiskResult[]>([]);

    const tileStyles: Record<string, string> = {
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        terrain: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    };

    // Fetch bulk risk data for all monitoring points
    const loadBulkRisk = useCallback(async () => {
        setLoadingBulk(true);
        try {
            const locations = MONITORING_POINTS.slice(0, 30).map(p => ({
                lat: p.lat,
                lon: p.lon,
                district_name: p.name,
                state_name: p.state,
            }));
            const results = await fetchBulkRisk(locations);
            setRiskData(results);
            setSensorCount(results.length);
            setZoneCount(results.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'SEVERE').length);

            // Add to telemetry log
            results.forEach(r => {
                if(r.risk_level === 'HIGH' || r.risk_level === 'SEVERE') {
                    setAlerts(prev => [
                        `[${new Date().toLocaleTimeString()}] ${r.district}, ${r.state} → ${r.risk_level} (${r.risk_score})`,
                        ...prev.slice(0, 49)
                    ]);
                }
            });
        } catch(e) {
            console.error('Bulk risk fetch failed:', e);
        } finally {
            setLoadingBulk(false);
        }
    }, []);

    // Map initialization
    useEffect(() => {
        if(!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: tileStyles[mapStyle],
            center: [82.5, 23.0], // Center of India
            zoom: 5,
        });

        const m = map.current;
        m.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        m.addControl(new maplibregl.ScaleControl({}), 'bottom-left');

        // Click anywhere on map to get live prediction
        m.on('click', async (e) => {
            const { lat, lng } = e.lngLat;
            const popup = new maplibregl.Popup({ maxWidth: '320px' })
                .setLngLat(e.lngLat)
                .setHTML(`<div style="font-family:monospace;font-size:12px;color:#94a3b8;padding:8px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="width:14px;height:14px;border:2px solid #3b82f6;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
                        Analyzing ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E...
                    </div>
                    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
                </div>`)
                .addTo(m);

            try {
                const data = await fetchRiskPrediction(lat, lng);
                const riskColor = data.riskLevel === 'HIGH' || data.riskLevel === 'SEVERE' ? '#ef4444' :
                    data.riskLevel === 'MODERATE' ? '#f59e0b' : '#22c55e';

                popup.setHTML(`
                    <div style="font-family:system-ui;font-size:12px;min-width:240px;">
                        <div style="background:${riskColor}22;border:1px solid ${riskColor}44;border-radius:8px;padding:10px;margin-bottom:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <strong style="color:${riskColor};font-size:14px;">${data.riskLevel} RISK</strong>
                                <span style="color:${riskColor};font-size:16px;font-weight:bold;">${data.riskScore}/10</span>
                            </div>
                            <div style="color:#94a3b8;font-size:10px;margin-top:4px;">
                                Flood probability: ${((data.probability || 0) * 100).toFixed(0)}%
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                            <div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center;">
                                <div style="color:#64748b;font-size:9px;">RAIN 24H</div>
                                <div style="color:#60a5fa;font-weight:bold;">${data.weather?.rainfall_24h || 0}mm</div>
                            </div>
                            <div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center;">
                                <div style="color:#64748b;font-size:9px;">TEMP</div>
                                <div style="color:#fbbf24;font-weight:bold;">${data.weather?.temperature || 0}°C</div>
                            </div>
                            <div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center;">
                                <div style="color:#64748b;font-size:9px;">SOIL MOIST</div>
                                <div style="color:#34d399;font-weight:bold;">${((data.weather?.soil_moisture || 0) * 100).toFixed(0)}%</div>
                            </div>
                            <div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center;">
                                <div style="color:#64748b;font-size:9px;">DISCHARGE</div>
                                <div style="color:#a78bfa;font-weight:bold;">${data.discharge?.current_discharge?.toFixed(1) || 0} m³/s</div>
                            </div>
                        </div>
                        <div style="color:#475569;font-size:9px;margin-top:6px;text-align:right;">
                            📡 ${data.model === 'trained' ? 'ML Model' : 'AI Analysis'} · ${data.weather?.source || 'Open-Meteo'}
                        </div>
                    </div>
                `);

                // Log to telemetry
                setAlerts(prev => [
                    `[${new Date().toLocaleTimeString()}] Click ${lat.toFixed(2)},${lng.toFixed(2)} → ${data.riskLevel} (${data.riskScore})`,
                    ...prev.slice(0, 49)
                ]);
            } catch(err) {
                popup.setHTML(`<div style="font-family:monospace;font-size:12px;color:#ef4444;padding:8px;">
                    ⚠️ Failed to fetch data for this location
                </div>`);
            }
        });

        m.on('mouseenter', 'risk-markers', () => { m.getCanvas().style.cursor = 'pointer'; });
        m.on('mouseleave', 'risk-markers', () => { m.getCanvas().style.cursor = ''; });

        return () => { m.remove(); map.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Add risk markers when data changes
    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded() || riskData.length === 0) return;
        const m = map.current;

        // Remove existing source/layers
        try {
            if(m.getLayer('risk-markers-circle')) m.removeLayer('risk-markers-circle');
            if(m.getLayer('risk-markers-label')) m.removeLayer('risk-markers-label');
            if(m.getSource('risk-markers')) m.removeSource('risk-markers');
        } catch { /* ignore */ }

        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: riskData.filter(r => !r.error).map(r => ({
                type: 'Feature' as const,
                properties: {
                    risk_level: r.risk_level,
                    risk_score: r.risk_score,
                    name: r.district || '',
                    rainfall: r.rainfall_24h,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [r.lon, r.lat]
                }
            }))
        };

        m.addSource('risk-markers', { type: 'geojson', data: geojson });

        m.addLayer({
            id: 'risk-markers-circle',
            type: 'circle',
            source: 'risk-markers',
            paint: {
                'circle-radius': [
                    'interpolate', ['linear'], ['get', 'risk_score'],
                    0, 6, 5, 10, 10, 18
                ],
                'circle-color': [
                    'match', ['get', 'risk_level'],
                    'SEVERE', '#dc2626',
                    'HIGH', '#ef4444',
                    'MODERATE', '#f59e0b',
                    '#22c55e'
                ],
                'circle-opacity': 0.7,
                'circle-stroke-width': 2,
                'circle-stroke-color': [
                    'match', ['get', 'risk_level'],
                    'SEVERE', '#fca5a5',
                    'HIGH', '#fca5a5',
                    'MODERATE', '#fde68a',
                    '#86efac'
                ],
                'circle-stroke-opacity': 0.9,
            }
        });

        m.addLayer({
            id: 'risk-markers-label',
            type: 'symbol',
            source: 'risk-markers',
            layout: {
                'text-field': ['get', 'name'],
                'text-size': 10,
                'text-offset': [0, 1.8],
                'text-anchor': 'top',
            },
            paint: {
                'text-color': '#94a3b8',
                'text-halo-color': '#0f172a',
                'text-halo-width': 1,
            }
        });
    }, [riskData]);

    // Load bulk data on mount
    useEffect(() => {
        loadBulkRisk();
        const interval = setInterval(loadBulkRisk, 10 * 60 * 1000); // refresh every 10min
        return () => clearInterval(interval);
    }, [loadBulkRisk]);

    // Toggle risk zone visibility
    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded()) return;
        const visibility = showRiskZones ? 'visible' : 'none';
        try {
            if(map.current.getLayer('risk-markers-circle'))
                map.current.setLayoutProperty('risk-markers-circle', 'visibility', visibility);
            if(map.current.getLayer('risk-markers-label'))
                map.current.setLayoutProperty('risk-markers-label', 'visibility', visibility);
        } catch { /* not ready */ }
    }, [showRiskZones]);

    // WebSocket connection
    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
        socket.emit('subscribe_telemetry', 'ALL');
        socket.on('risk_update', (data) => {
            setAlerts(prev => [
                `[${new Date(data.timestamp).toLocaleTimeString()}] ${data.districtId} → ${data.riskLevel} (${data.riskScore})`,
                ...prev.slice(0, 49)
            ]);
        });
        return () => { socket.disconnect(); };
    }, []);

    // Change map style
    const switchStyle = (style: 'dark' | 'satellite' | 'terrain') => {
        setMapStyle(style);
        if(map.current) {
            map.current.setStyle(tileStyles[style]);
            // Reload markers after style change
            map.current.once('style.load', () => {
                if(riskData.length > 0) setRiskData([...riskData]);
            });
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-900 text-slate-100 font-sans">
            {/* Sidebar */}
            <div className="w-80 bg-slate-800/95 backdrop-blur-md flex flex-col shadow-2xl z-10 border-r border-slate-700/50">
                {/* Header */}
                <div className="p-5 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Droplets className="text-blue-400 w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-wide text-blue-100">FloodSense</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">NDRF Command Station</p>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="p-4">
                    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 rounded-xl border border-slate-600/30">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> System Status
                            </h2>
                            <div className={`flex items-center gap-1.5 ${ndfrStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-mono font-bold">{ndfrStatus}</span>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                                <div className="text-slate-500">Monitoring</div>
                                <div className="font-mono font-bold text-blue-300">{sensorCount || '...'}</div>
                            </div>
                            <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                                <div className="text-slate-500">High Risk</div>
                                <div className="font-mono font-bold text-red-400">{zoneCount || '0'}</div>
                            </div>
                        </div>
                        <button onClick={loadBulkRisk} disabled={loadingBulk}
                            className="mt-2 w-full text-[10px] uppercase font-bold py-1.5 rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                            {loadingBulk ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            {loadingBulk ? 'Analyzing...' : 'Refresh Live Data'}
                        </button>
                    </div>
                </div>

                {/* Map Style Controls */}
                <div className="px-4 pb-3">
                    <h2 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Map View
                    </h2>
                    <div className="flex gap-1.5">
                        {(['dark', 'satellite', 'terrain'] as const).map(s => (
                            <button key={s} onClick={() => switchStyle(s)}
                                className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${mapStyle === s ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'}`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Risk Toggle */}
                    <button onClick={() => setShowRiskZones(!showRiskZones)}
                        className={`mt-2 w-full text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${showRiskZones ? 'bg-red-600/80 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'}`}>
                        {showRiskZones ? '🔴 Risk Markers: ON' : '⚪ Risk Markers: OFF'}
                    </button>
                </div>

                {/* Live Telemetry */}
                <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
                    <h2 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" /> Live Telemetry
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                <Activity className="w-8 h-8 mb-2 animate-pulse" />
                                <p className="text-xs font-mono">Click map or wait for live data...</p>
                            </div>
                        ) : null}
                        {alerts.map((msg, i) => (
                            <div key={i} className="text-[10px] font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-700/40 truncate hover:border-blue-500/30 transition-colors" title={msg}>
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-700/50 space-y-2">
                    {onLogout && (
                        <button onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    )}
                    <p className="text-[9px] text-slate-600 font-mono text-center">FloodSense AI v2.0 • NDRF Ops • Real Data</p>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <div ref={mapContainer} className="w-full h-full" />

                {/* Loading overlay */}
                {loadingBulk && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-500/30 flex items-center gap-2 z-20">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-300 font-mono">Fetching live weather data...</span>
                    </div>
                )}

                {/* Legend Overlay */}
                <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-xl">
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Risk Legend (Live)</h3>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-[11px] text-slate-300">High/Severe Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-[11px] text-slate-300">Moderate Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-[11px] text-slate-300">Low Risk</span>
                        </div>
                    </div>
                    <hr className="border-slate-700/50 my-2" />
                    <div className="text-[9px] text-slate-500 space-y-0.5">
                        <p>📡 Source: Open-Meteo API</p>
                        <p>🖱️ Click anywhere for prediction</p>
                        <p>🔄 Auto-refresh: 10 min</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
