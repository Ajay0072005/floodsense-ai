"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io } from 'socket.io-client';
import {
    AlertTriangle, Activity, Layers, Radio, Shield, LogOut, Loader2, RefreshCw,
    Droplets, Heart, Building, BarChart3, Play, Pause, RotateCcw
} from 'lucide-react';
import { fetchRiskPrediction, fetchBulkRisk, type BulkRiskResult } from '@/lib/api';
import { STATES_DATA, getAllDams, getDangerDams, getVulnerableDistricts, type DamData } from '@/data/statesData';

const MONITORING_POINTS = STATES_DATA.flatMap(state =>
    state.districts.map(d => ({
        name: d.name,
        state: state.name,
        lat: d.lat,
        lon: d.lng,
        vulnerability: d.vulnerability.vulnerability_score,
        drainageHealth: d.drainageHealth,
        embankmentRisk: d.embankmentRisk,
    }))
);

export default function MapDashboard({ onLogout }: { onLogout?: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('light');
    const [showRiskZones, setShowRiskZones] = useState(true);
    const [showDams, setShowDams] = useState(true);
    const [showVulnerability, setShowVulnerability] = useState(false);
    const [sensorCount, setSensorCount] = useState(0);
    const [zoneCount, setZoneCount] = useState(0);
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [riskData, setRiskData] = useState<BulkRiskResult[]>([]);
    const [activeTab, setActiveTab] = useState<'telemetry' | 'dams' | 'vulnerability' | 'simulation'>('telemetry');
    // Flood simulation state
    const [simRunning, setSimRunning] = useState(false);
    const [simHour, setSimHour] = useState(0);
    const [simScenario, setSimScenario] = useState<'rain' | 'dam' | 'surge'>('rain');
    // Evacuation progress
    const [evacProgress, setEvacProgress] = useState({ total: 12500, evacuated: 3200, inTransit: 1800, sheltered: 2800 });

    const tileStyles: Record<string, string> = {
        light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    };

    const allDams = getAllDams();
    const dangerDams = getDangerDams();
    const topVulnerable = getVulnerableDistricts().slice(0, 8);

    const loadBulkRisk = useCallback(async () => {
        setLoadingBulk(true);
        try {
            const locations = MONITORING_POINTS.slice(0, 30).map(p => ({
                lat: p.lat, lon: p.lon,
                district_name: p.name, state_name: p.state,
            }));
            const results = await fetchBulkRisk(locations);
            setRiskData(results);
            setSensorCount(results.length);
            setZoneCount(results.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'SEVERE').length);
            results.forEach(r => {
                if(r.risk_level === 'HIGH' || r.risk_level === 'SEVERE') {
                    setAlerts(prev => [`[${new Date().toLocaleTimeString()}] ${r.district}, ${r.state} → ${r.risk_level} (${r.risk_score})`, ...prev.slice(0, 49)]);
                }
            });
        } catch(e) {
            console.error('Bulk risk fetch failed:', e);
        } finally { setLoadingBulk(false); }
    }, []);

    useEffect(() => {
        if(!mapContainer.current || map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: tileStyles[mapStyle],
            center: [82.5, 23.0],
            zoom: 5,
        });
        const m = map.current;
        m.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        m.addControl(new maplibregl.ScaleControl({}), 'bottom-left');

        m.on('click', async (e) => {
            const { lat, lng } = e.lngLat;
            const popup = new maplibregl.Popup({ maxWidth: '300px' })
                .setLngLat(e.lngLat)
                .setHTML(`<div style="font-family:system-ui;font-size:12px;color:#4b5563;padding:6px;"><div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border:2px solid #1a237e;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>Analysing ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E...</div><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div>`)
                .addTo(m);
            try {
                const data = await fetchRiskPrediction(lat, lng);
                const riskColor = data.riskLevel === 'HIGH' || data.riskLevel === 'SEVERE' ? '#dc2626' : data.riskLevel === 'MODERATE' ? '#d97706' : '#16a34a';
                popup.setHTML(`
                    <div style="font-family:system-ui;font-size:12px;min-width:220px;">
                        <div style="background:${riskColor}15;border:1px solid ${riskColor}30;border-radius:4px;padding:8px;margin-bottom:6px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <strong style="color:${riskColor};font-size:13px;">${data.riskLevel} RISK</strong>
                                <span style="color:${riskColor};font-size:14px;font-weight:bold;">${data.riskScore}/10</span>
                            </div>
                            <div style="color:#6b7280;font-size:10px;margin-top:3px;">Probability: ${((data.probability || 0) * 100).toFixed(0)}%</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;"><div style="color:#9ca3af;font-size:9px;">RAIN 24H</div><div style="color:#1f2937;font-weight:bold;font-size:12px;">${data.weather?.rainfall_24h || 0}mm</div></div>
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;"><div style="color:#9ca3af;font-size:9px;">TEMP</div><div style="color:#1f2937;font-weight:bold;font-size:12px;">${data.weather?.temperature || 0}°C</div></div>
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;"><div style="color:#9ca3af;font-size:9px;">SOIL</div><div style="color:#1f2937;font-weight:bold;font-size:12px;">${((data.weather?.soil_moisture || 0) * 100).toFixed(0)}%</div></div>
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;"><div style="color:#9ca3af;font-size:9px;">DISCHARGE</div><div style="color:#1f2937;font-weight:bold;font-size:12px;">${data.discharge?.current_discharge?.toFixed(1) || 0} m³/s</div></div>
                        </div>
                        <div style="color:#9ca3af;font-size:9px;margin-top:5px;text-align:right;">📡 ${data.model === 'trained' ? 'ML Model' : 'AI Analysis'} · ${data.weather?.source || 'Open-Meteo'}</div>
                    </div>
                `);
                setAlerts(prev => [`[${new Date().toLocaleTimeString()}] ${lat.toFixed(2)},${lng.toFixed(2)} → ${data.riskLevel} (${data.riskScore})`, ...prev.slice(0, 49)]);
            } catch {
                popup.setHTML(`<div style="font-family:system-ui;font-size:12px;color:#dc2626;padding:8px;">⚠️ Failed to fetch data</div>`);
            }
        });

        return () => { m.remove(); map.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Risk markers layer
    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded() || riskData.length === 0) return;
        const m = map.current;
        try { if(m.getLayer('risk-circle')) m.removeLayer('risk-circle'); if(m.getLayer('risk-label')) m.removeLayer('risk-label'); if(m.getSource('risk-src')) m.removeSource('risk-src'); } catch { }
        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: riskData.filter(r => !r.error).map(r => ({
                type: 'Feature' as const,
                properties: { risk_level: r.risk_level, risk_score: r.risk_score, name: r.district || '' },
                geometry: { type: 'Point' as const, coordinates: [r.lon, r.lat] }
            }))
        };
        m.addSource('risk-src', { type: 'geojson', data: geojson });
        m.addLayer({
            id: 'risk-circle', type: 'circle', source: 'risk-src',
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['get', 'risk_score'], 0, 6, 5, 10, 10, 18],
                'circle-color': ['match', ['get', 'risk_level'], 'SEVERE', '#dc2626', 'HIGH', '#ef4444', 'MODERATE', '#d97706', '#16a34a'],
                'circle-opacity': 0.7, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.9,
            }
        });
        m.addLayer({
            id: 'risk-label', type: 'symbol', source: 'risk-src',
            layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-offset': [0, 1.8], 'text-anchor': 'top' },
            paint: { 'text-color': '#374151', 'text-halo-color': '#ffffff', 'text-halo-width': 1 }
        });
    }, [riskData]);

    // Dam markers layer
    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded()) return;
        const m = map.current;
        try { if(m.getLayer('dam-circle')) m.removeLayer('dam-circle'); if(m.getLayer('dam-label')) m.removeLayer('dam-label'); if(m.getSource('dam-src')) m.removeSource('dam-src'); } catch { }
        if(!showDams) return;
        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: allDams.map(d => ({
                type: 'Feature' as const,
                properties: { name: d.name, status: d.status, level: d.current_level_pct },
                geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] }
            }))
        };
        m.addSource('dam-src', { type: 'geojson', data: geojson });
        m.addLayer({
            id: 'dam-circle', type: 'circle', source: 'dam-src',
            paint: {
                'circle-radius': 10,
                'circle-color': ['match', ['get', 'status'], 'OVERFLOW', '#7c3aed', 'DANGER', '#dc2626', 'ALERT', '#d97706', '#16a34a'],
                'circle-opacity': 0.85, 'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff',
            }
        });
        m.addLayer({
            id: 'dam-label', type: 'symbol', source: 'dam-src',
            layout: { 'text-field': ['concat', ['get', 'name'], '\n', ['to-string', ['get', 'level']], '%'], 'text-size': 9, 'text-offset': [0, 2.2], 'text-anchor': 'top' },
            paint: { 'text-color': '#6b21a8', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 }
        });
    }, [showDams, allDams]);

    useEffect(() => {
        loadBulkRisk();
        const interval = setInterval(loadBulkRisk, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadBulkRisk]);

    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded()) return;
        const v = showRiskZones ? 'visible' : 'none';
        try {
            if(map.current.getLayer('risk-circle')) map.current.setLayoutProperty('risk-circle', 'visibility', v);
            if(map.current.getLayer('risk-label')) map.current.setLayoutProperty('risk-label', 'visibility', v);
        } catch { }
    }, [showRiskZones]);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
        socket.emit('subscribe_telemetry', 'ALL');
        socket.on('risk_update', (data) => {
            setAlerts(prev => [`[${new Date(data.timestamp).toLocaleTimeString()}] ${data.districtId} → ${data.riskLevel} (${data.riskScore})`, ...prev.slice(0, 49)]);
        });
        return () => { socket.disconnect(); };
    }, []);

    // Flood simulation
    useEffect(() => {
        if(!simRunning) return;
        const interval = setInterval(() => {
            setSimHour(prev => {
                if(prev >= 48) { setSimRunning(false); return 48; }
                // Simulate evacuation progress
                setEvacProgress(p => ({
                    total: p.total,
                    evacuated: Math.min(p.total, p.evacuated + Math.floor(Math.random() * 200 + 100)),
                    inTransit: Math.max(0, Math.floor(Math.random() * 500)),
                    sheltered: Math.min(p.total, p.sheltered + Math.floor(Math.random() * 150 + 50)),
                }));
                return prev + 1;
            });
        }, 800);
        return () => clearInterval(interval);
    }, [simRunning]);

    const switchStyle = (style: 'light' | 'dark' | 'satellite') => {
        setMapStyle(style);
        if(map.current) {
            map.current.setStyle(tileStyles[style]);
            map.current.once('style.load', () => { if(riskData.length > 0) setRiskData([...riskData]); });
        }
    };

    const damStatusBadge = (s: string) => {
        if(s === "OVERFLOW") return "bg-purple-100 text-purple-700 border-purple-200";
        if(s === "DANGER") return "bg-red-100 text-red-700 border-red-200";
        if(s === "ALERT") return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-green-100 text-green-700 border-green-200";
    };

    return (
        <div className="flex h-screen w-full bg-white font-sans">
            {/* Sidebar */}
            <div className="w-80 bg-white flex flex-col border-r border-gray-200 z-10">
                {/* Header */}
                <div className="border-b border-gray-200">
                    <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
                    <div className="bg-[#1a237e] text-white px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">🏛️</span>
                            <div>
                                <h1 className="text-sm font-bold">FloodSense AI — Command</h1>
                                <p className="text-[9px] text-blue-200">NDRF Authority Dashboard</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status + Controls */}
                <div className="p-3 space-y-2">
                    {/* System Status */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Shield className="w-3 h-3" /> System Status</h2>
                            <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                            <div className="bg-white border border-gray-100 rounded p-1.5 text-center"><div className="text-gray-400 text-[9px]">Monitoring</div><div className="font-bold text-[#1a237e]">{sensorCount || '...'}</div></div>
                            <div className="bg-white border border-gray-100 rounded p-1.5 text-center"><div className="text-gray-400 text-[9px]">High Risk</div><div className="font-bold text-red-600">{zoneCount || '0'}</div></div>
                            <div className="bg-white border border-gray-100 rounded p-1.5 text-center"><div className="text-gray-400 text-[9px]">Dams ⚠️</div><div className="font-bold text-purple-600">{dangerDams.length}</div></div>
                        </div>
                        <button onClick={loadBulkRisk} disabled={loadingBulk}
                            className="mt-2 w-full text-[10px] font-bold py-1.5 rounded bg-[#1a237e] text-white hover:bg-[#283593] flex items-center justify-center gap-1 disabled:opacity-50">
                            {loadingBulk ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            {loadingBulk ? 'Analysing...' : 'Refresh Live Data'}
                        </button>
                    </div>

                    {/* Map Controls */}
                    <div className="space-y-1.5">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Layers className="w-3 h-3" /> Layers & Controls</h2>
                        <div className="flex gap-1">
                            {(['light', 'dark', 'satellite'] as const).map(s => (
                                <button key={s} onClick={() => switchStyle(s)}
                                    className={`flex-1 text-[10px] font-bold py-1.5 rounded border capitalize ${mapStyle === s ? 'bg-[#1a237e] text-white border-[#1a237e]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a237e]'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => setShowRiskZones(!showRiskZones)}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded border ${showRiskZones ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                                {showRiskZones ? '🔴 Risk: ON' : '⚪ Risk: OFF'}
                            </button>
                            <button onClick={() => setShowDams(!showDams)}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded border ${showDams ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                                {showDams ? '🟣 Dams: ON' : '⚪ Dams: OFF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-3">
                    {([
                        { id: 'telemetry', icon: <Radio className="w-3 h-3" />, label: 'Telemetry' },
                        { id: 'dams', icon: <Droplets className="w-3 h-3" />, label: 'Dams' },
                        { id: 'vulnerability', icon: <Heart className="w-3 h-3" />, label: 'Vuln.' },
                        { id: 'simulation', icon: <BarChart3 className="w-3 h-3" />, label: 'Sim' },
                    ] as const).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-[10px] font-bold py-2 flex items-center justify-center gap-1 border-b-2 ${activeTab === tab.id ? 'border-[#1a237e] text-[#1a237e]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto px-3 py-2">
                    {activeTab === 'telemetry' && (
                        <div className="space-y-1">
                            {alerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                                    <Activity className="w-6 h-6 mb-2" />
                                    <p className="text-[10px]">Click map or wait for data...</p>
                                </div>
                            ) : alerts.map((msg, i) => (
                                <div key={i} className="text-[10px] font-mono bg-gray-50 border border-gray-100 p-1.5 rounded truncate" title={msg}>{msg}</div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'dams' && (
                        <div className="space-y-2">
                            {dangerDams.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 text-[10px] text-red-700">
                                    <strong>⚠️ {dangerDams.length} dam(s)</strong> in critical status
                                </div>
                            )}
                            {allDams.map((d, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded p-2">
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-[11px] font-semibold text-gray-800">{d.name}</p><p className="text-[9px] text-gray-400">{d.river} · {d.state}</p></div>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${damStatusBadge(d.status)}`}>{d.status}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full rounded-full ${d.current_level_pct > 90 ? "bg-red-500" : d.current_level_pct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                                                style={{ width: `${d.current_level_pct}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600">{d.current_level_pct}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'vulnerability' && (
                        <div className="space-y-2">
                            <div className="bg-[#fff3cd] border border-[#ffc107] rounded p-2 text-[10px] text-[#856404]">Prioritization based on elderly, children, disabled, and EWS populations.</div>
                            {topVulnerable.map((d, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded p-2">
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-[11px] font-semibold text-gray-800">{d.name}</p><p className="text-[9px] text-gray-400">{(d as any).stateName}</p></div>
                                        <span className="text-[11px] font-bold text-red-600">{d.vulnerability.vulnerability_score}/10</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-0.5 mt-1 text-[9px]">
                                        <div className="text-center text-gray-500">👴{d.vulnerability.elderly_pct}%</div>
                                        <div className="text-center text-gray-500">👶{d.vulnerability.children_pct}%</div>
                                        <div className="text-center text-gray-500">♿{d.vulnerability.disabled_pct}%</div>
                                        <div className="text-center text-gray-500">💰{d.vulnerability.ews_pct}%</div>
                                    </div>
                                    <div className="mt-1 bg-gray-200 rounded-full h-1.5"><div className="bg-red-500 rounded-full h-1.5" style={{ width: `${d.vulnerability.vulnerability_score * 10}%` }} /></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'simulation' && (
                        <div className="space-y-3">
                            {/* Scenario Selection */}
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Scenario</h3>
                                <div className="flex gap-1">
                                    {([
                                        { id: 'rain', label: '🌧️ Heavy Rain' },
                                        { id: 'dam', label: '🏗️ Dam Release' },
                                        { id: 'surge', label: '🌊 Storm Surge' },
                                    ] as const).map(s => (
                                        <button key={s.id} onClick={() => setSimScenario(s.id)}
                                            className={`flex-1 text-[10px] py-1.5 rounded border font-bold ${simScenario === s.id ? 'bg-[#1a237e] text-white border-[#1a237e]' : 'bg-white text-gray-600 border-gray-200'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Simulation Controls */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-gray-700">Hour: {simHour}/48</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setSimRunning(!simRunning); }} className={`p-1.5 rounded ${simRunning ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {simRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                        </button>
                                        <button onClick={() => { setSimRunning(false); setSimHour(0); setEvacProgress({ total: 12500, evacuated: 3200, inTransit: 1800, sheltered: 2800 }); }} className="p-1.5 rounded bg-gray-100 text-gray-600">
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#1a237e] h-full rounded-full transition-all" style={{ width: `${(simHour / 48) * 100}%` }} />
                                </div>
                                <div className="grid grid-cols-3 gap-1 mt-2 text-[9px] text-center">
                                    <div className="bg-white border border-gray-100 rounded p-1"><span className="text-gray-400">Rainfall</span><br /><span className="font-bold text-blue-600">{Math.min(400, simHour * 8)}mm</span></div>
                                    <div className="bg-white border border-gray-100 rounded p-1"><span className="text-gray-400">Water Rise</span><br /><span className="font-bold text-red-600">+{(simHour * 0.15).toFixed(1)}m</span></div>
                                    <div className="bg-white border border-gray-100 rounded p-1"><span className="text-gray-400">Zones hit</span><br /><span className="font-bold text-orange-600">{Math.min(12, Math.floor(simHour / 4))}</span></div>
                                </div>
                            </div>
                            {/* Evacuation Progress */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Evacuation Progress</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: "Evacuated", value: evacProgress.evacuated, color: "bg-green-500" },
                                        { label: "In Transit", value: evacProgress.inTransit, color: "bg-yellow-500" },
                                        { label: "Sheltered", value: evacProgress.sheltered, color: "bg-blue-500" },
                                    ].map(e => (
                                        <div key={e.label}>
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-gray-600">{e.label}</span>
                                                <span className="font-bold text-gray-800">{e.value.toLocaleString()}/{evacProgress.total.toLocaleString()}</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-full h-1.5 mt-0.5 overflow-hidden">
                                                <div className={`${e.color} h-full rounded-full`} style={{ width: `${(e.value / evacProgress.total) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-gray-200 space-y-1.5">
                    {onLogout && (
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-50">
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    )}
                    <p className="text-[8px] text-gray-400 text-center">FloodSense AI v2.0 · NDRF Command · Govt. of India</p>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <div ref={mapContainer} className="w-full h-full" />
                {loadingBulk && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center gap-2 z-20">
                        <Loader2 className="w-4 h-4 text-[#1a237e] animate-spin" />
                        <span className="text-xs text-gray-600">Fetching live weather data...</span>
                    </div>
                )}
                {/* Legend */}
                <div className="absolute top-3 right-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Legend (Live)</h3>
                    <div className="space-y-1">
                        {[
                            { color: '#ef4444', label: 'High / Severe Risk' },
                            { color: '#d97706', label: 'Moderate Risk' },
                            { color: '#16a34a', label: 'Low Risk' },
                            { color: '#7c3aed', label: 'Dam (Critical)' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                                <span className="text-[11px] text-gray-600">{l.label}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="my-2 border-gray-100" />
                    <div className="text-[9px] text-gray-400 space-y-0.5">
                        <p>📡 Source: Open-Meteo + CWC</p>
                        <p>🖱️ Click for prediction</p>
                        <p>🔄 Auto-refresh: 10 min</p>
                    </div>
                </div>
                {/* Simulation overlay */}
                {simRunning && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 rounded-lg px-6 py-3 border border-gray-200 shadow-md flex items-center gap-4 z-20">
                        <span className="text-xs font-bold text-[#1a237e]">🎬 Simulation Running</span>
                        <span className="text-xs text-gray-600">Hour {simHour}/48 · {simScenario === 'rain' ? '🌧️ Heavy Rain' : simScenario === 'dam' ? '🏗️ Dam Release' : '🌊 Storm Surge'}</span>
                        <span className="text-xs text-red-600 font-bold">+{(simHour * 0.15).toFixed(1)}m water</span>
                    </div>
                )}
            </div>
        </div>
    );
}
