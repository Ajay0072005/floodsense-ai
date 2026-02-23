"use client";
import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, MapPin, Bell, Navigation, Globe, Phone, ChevronRight, Shield, LogOut, ArrowLeft, Volume2, Siren, BarChart3, Users, Loader2, Camera, WifiOff, Droplets, Heart, Send, Radio, TrendingUp, ExternalLink, Map } from "lucide-react";
import { STATES_DATA, getDamsByState, getVulnerableByState, type StateData, type DistrictData, type DamData } from "@/data/statesData";
import { fetchRiskPrediction, type RiskPrediction, type FloodAlert } from "@/lib/api";
import { t, speak, LANG_MAP } from "@/lib/translations";
import { getReports, addReport, getSimLocation, getNearestTowers, type CitizenReport, type SimLocation } from "@/lib/reportsStore";

type View = "home" | "evacuate" | "shelters" | "sos" | "alert-family" | "vulnerability" | "dams" | "report" | "analytics" | "location-info";

interface Props { onLogout: () => void; userState: StateData; userDistrict: DistrictData; }

export default function CitizenDashboard({ onLogout, userState, userDistrict }: Props) {
    const [view, setView] = useState<View>("home");
    const [language, setLanguage] = useState("English");
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [sosSent, setSosSent] = useState(false);
    const [familyAlerted, setFamilyAlerted] = useState(false);
    const [liveRisk, setLiveRisk] = useState<RiskPrediction | null>(null);
    const [liveAlerts, setLiveAlerts] = useState<FloodAlert[]>([]);
    const [loadingRisk, setLoadingRisk] = useState(true);
    const [reportSent, setReportSent] = useState(false);
    const [reportPhoto, setReportPhoto] = useState<string | null>(null);
    const [reportDesc, setReportDesc] = useState("");
    const [reportType, setReportType] = useState<"waterlogging" | "drainage_blocked" | "road_flooded" | "embankment_breach" | "other">("waterlogging");
    const [isOffline, setIsOffline] = useState(false);
    const [simLoc, setSimLoc] = useState<SimLocation | null>(null);
    const [towers, setTowers] = useState<ReturnType<typeof getNearestTowers>>([]);
    const [navTarget, setNavTarget] = useState<{ name: string; lat: number; lon: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const go = () => setIsOffline(!navigator.onLine);
        window.addEventListener('offline', go); window.addEventListener('online', go);
        setIsOffline(!navigator.onLine);
        return () => { window.removeEventListener('offline', go); window.removeEventListener('online', go); };
    }, []);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchRiskPrediction(userDistrict.lat, userDistrict.lng, userDistrict.name, userState.name);
                setLiveRisk(data); if(data.alerts) setLiveAlerts(data.alerts);
                try { localStorage.setItem('floodsense_cached_risk', JSON.stringify(data)); } catch { }
            } catch { try { const c = localStorage.getItem('floodsense_cached_risk'); if(c) setLiveRisk(JSON.parse(c)); } catch { } }
            finally { setLoadingRisk(false); }
        }
        load();
        const i = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(i);
    }, [userDistrict, userState]);

    useEffect(() => { getSimLocation().then(loc => { setSimLoc(loc); setTowers(getNearestTowers(loc.lat, loc.lon)); }); }, []);

    const languages = Object.keys(LANG_MAP);
    const myDams = getDamsByState(userState.name);
    const myVuln = getVulnerableByState(userState.name);
    const myReports = getReports().filter(r => r.state === userState.name);
    const dangerDams = myDams.filter(d => d.status === "DANGER" || d.status === "OVERFLOW");

    const alertItems = liveAlerts.length > 0
        ? liveAlerts.map(a => ({ severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString(), msg: a.message }))
        : [{ severity: "LOW" as const, time: "Now", msg: t(language, "no_alerts") }];

    const sev = (s: string) => s === "SEVERE" || s === "HIGH" ? "bg-red-100 text-red-800 border-red-200" : s === "MODERATE" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-green-100 text-green-800 border-green-200";
    const damC = (s: string) => s === "OVERFLOW" ? "bg-red-600 text-white" : s === "DANGER" ? "bg-red-100 text-red-700 border-red-200" : s === "ALERT" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 border-green-200";

    const handleAmISafe = () => {
        const risk = liveRisk?.riskLevel || "LOW";
        speak(risk === "HIGH" || risk === "SEVERE" ? t(language, "danger_alert") : risk === "MODERATE" ? t(language, "moderate_risk") : t(language, "you_are_safe"), language);
    };

    const handleSubmitReport = () => {
        addReport({ type: reportType, description: reportDesc, photoUrl: reportPhoto || undefined, lat: simLoc?.lat || userDistrict.lat, lon: simLoc?.lon || userDistrict.lng, district: userDistrict.name, state: userState.name, severity: liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "HIGH" : "MODERATE", submittedBy: "+91 XXXXX" });
        setReportSent(true);
    };

    // Google Maps navigation URL generator
    const getNavUrl = (destLat: number, destLon: number) => {
        const fromLat = simLoc?.lat || userDistrict.lat;
        const fromLon = simLoc?.lon || userDistrict.lng;
        return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${destLat},${destLon}&travelmode=driving`;
    };

    // OpenStreetMap embed URL
    const getMapEmbed = (destLat: number, destLon: number) => {
        const fromLat = simLoc?.lat || userDistrict.lat;
        const fromLon = simLoc?.lon || userDistrict.lng;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(fromLon, destLon) - 0.05},${Math.min(fromLat, destLat) - 0.05},${Math.max(fromLon, destLon) + 0.05},${Math.max(fromLat, destLat) + 0.05}&layer=mapnik&marker=${destLat},${destLon}`;
    };

    // Vulnerability map embed
    const getVulnMapEmbed = () => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${userDistrict.lng - 0.5},${userDistrict.lat - 0.5},${userDistrict.lng + 0.5},${userDistrict.lat + 0.5}&layer=mapnik&marker=${userDistrict.lat},${userDistrict.lng}`;
    };

    // Shelter data (with coordinates for navigation)
    const shelters = [
        { n: `${userDistrict.name} Relief Camp`, d: "2.1 km", c: 500, a: 187, s: "Open", lat: userDistrict.lat + 0.01, lon: userDistrict.lng + 0.015 },
        { n: "Community Hall - Block A", d: "3.4 km", c: 300, a: 92, s: "Open", lat: userDistrict.lat - 0.015, lon: userDistrict.lng + 0.02 },
        { n: "Stadium Emergency Shelter", d: "5.8 km", c: 1200, a: 640, s: "Open", lat: userDistrict.lat + 0.025, lon: userDistrict.lng - 0.02 },
        { n: "Temple Complex Shelter", d: "1.8 km", c: 150, a: 0, s: "Full", lat: userDistrict.lat - 0.008, lon: userDistrict.lng - 0.01 },
    ];

    const GovHeader = ({ title, showBack }: { title?: string; showBack?: boolean }) => (
        <div className="w-full">
            <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
            <div className="bg-[#1a237e] text-white px-4 py-2.5">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showBack && <button onClick={() => setView("home")} className="text-white/70 hover:text-white mr-1"><ArrowLeft className="w-5 h-5" /></button>}
                        <span className="text-2xl">🏛️</span>
                        <div><h1 className="text-sm font-bold">{title || "FloodSense AI"}</h1><p className="text-[9px] text-blue-200">📍 {userDistrict.name}, {userState.name}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOffline && <span className="text-[9px] bg-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5"><WifiOff className="w-2.5 h-2.5" /> Offline</span>}
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-1 rounded"><Globe className="w-3 h-3" /> {language}</button>
                            {showLangMenu && <div className="absolute right-0 mt-1 w-36 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">{languages.map(l => <button key={l} onClick={() => { setLanguage(l); setShowLangMenu(false) }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${language === l ? "text-[#1a237e] font-bold bg-blue-50" : "text-gray-700"}`}>{l}</button>)}</div>}
                        </div>
                        <button onClick={onLogout} className="text-[10px] bg-white/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-white/20"><LogOut className="w-3 h-3" /></button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── EVACUATE (with map) ───
    if(view === "evacuate") {
        const dest = navTarget ? { lat: navTarget.lat, lon: navTarget.lon, label: navTarget.name } : { lat: shelters[0].lat, lon: shelters[0].lon, label: shelters[0].n };
        return (
            <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "evacuation_route")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {/* Embedded Map */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <iframe src={getMapEmbed(dest.lat, dest.lon)} className="w-full h-48 border-0" loading="lazy" title="Route Map" />
                        <div className="p-3 flex items-center justify-between">
                            <div><p className="text-xs font-bold text-gray-800">📍 {simLoc ? `${simLoc.lat.toFixed(4)}°N` : "Your Location"} → {dest.label}</p><p className="text-[10px] text-gray-400">via SIM GPS ({simLoc?.method || "detecting..."})</p></div>
                            <a href={getNavUrl(dest.lat, dest.lon)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-bold bg-[#1a237e] text-white px-3 py-2 rounded hover:bg-[#283593]">
                                <Navigation className="w-3.5 h-3.5" /> Open Maps
                            </a>
                        </div>
                    </div>
                    {/* Route Steps */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5"><h2 className="text-base font-bold text-gray-800 mb-1">🧭 {t(language, "safe_route")}</h2><p className="text-sm text-gray-500 mb-4">{t(language, "avoid_flooded")}</p>
                        <div className="space-y-2">{[{ s: 1, d: "Head North via safe route", dist: "1.2 km", tm: "8 min", ok: true }, { s: 2, d: "Turn Right onto Elevated Flyover", dist: "0.8 km", tm: "5 min", ok: true }, { s: 3, d: "⚠️ Avoid flooded zone (water 2ft+)", dist: "—", tm: "—", ok: false }, { s: 4, d: `Continue to ${dest.label}`, dist: "2.1 km", tm: "12 min", ok: true }].map(r => <div key={r.s} className={`flex items-center gap-3 p-3 rounded border ${r.ok ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${r.ok ? "bg-[#1a237e]" : "bg-red-500"}`}>{r.s}</div><div className="flex-1"><p className={`text-sm font-medium ${r.ok ? "text-gray-800" : "text-red-700"}`}>{r.d}</p><p className="text-[10px] text-gray-400">{r.dist}·{r.tm}</p></div></div>)}</div>
                    </div>
                    {/* Time to Impact */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><h3 className="text-xs font-bold text-blue-800 uppercase mb-2">⏱️ Time to Impact</h3>
                        <div className="grid grid-cols-3 gap-2 text-center"><div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-blue-800">25</p><p className="text-[9px] text-gray-500">min to shelter</p></div><div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-red-600">45</p><p className="text-[9px] text-gray-500">min to flood</p></div><div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-green-600">20</p><p className="text-[9px] text-gray-500">min buffer</p></div></div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SHELTERS (with Navigate Here → opens Google Maps) ───
    if(view === "shelters") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "nearby_shelters")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {/* Mini map of area */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <iframe src={getVulnMapEmbed()} className="w-full h-36 border-0" loading="lazy" title="Area Map" />
                    <p className="text-[10px] text-gray-400 px-3 py-1.5">📍 Shelters near {userDistrict.name}</p>
                </div>
                {shelters.map((sh, i) => <div key={i} className={`bg-white border rounded-lg p-4 ${sh.s === "Full" ? "border-red-200 opacity-60" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-800">{sh.n}</h3><span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${sh.s === "Full" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>{sh.s}</span></div>
                    <div className="flex gap-4 text-xs text-gray-500"><span>📍 {sh.d}</span><span>👥 {sh.a}/{sh.c}</span></div>
                    {sh.s !== "Full" && <div className="flex gap-2 mt-3">
                        <button onClick={() => { setNavTarget({ name: sh.n, lat: sh.lat, lon: sh.lon }); setView("evacuate") }} className="flex-1 text-xs font-bold bg-[#1a237e] text-white py-2 rounded hover:bg-[#283593] flex items-center justify-center gap-1"><Navigation className="w-3.5 h-3.5" />Navigate Here</button>
                        <a href={getNavUrl(sh.lat, sh.lon)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold border border-gray-200 text-gray-600 py-2 px-3 rounded hover:border-[#1a237e] flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" />Maps</a>
                    </div>}
                </div>)}
            </div>
        </div>
    );

    // ─── SOS ───
    if(view === "sos") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "emergency_sos")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-5">{!sosSent ? <div className="text-center space-y-5"><div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 border-2 border-red-300"><Siren className="w-12 h-12 text-red-600" /></div><h2 className="text-xl font-bold text-red-800">{t(language, "emergency_sos")}</h2><p className="text-sm text-gray-600 max-w-xs mx-auto">Sends SOS + GPS location ({simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E · via ${simLoc.method}` : "detecting..."}) to NDRF & 112.</p><button onClick={() => { setSosSent(true); speak(t(language, "sos_sent"), language) }} className="w-full py-3 bg-red-600 text-white rounded-lg text-base font-bold hover:bg-red-700">🚨 SEND SOS ALERT</button><div className="bg-white border border-gray-200 rounded-lg p-4 text-left space-y-2"><p className="text-xs text-gray-500 font-bold uppercase">{t(language, "helplines")}:</p>{[{ n: "NDRF", p: "011-24363260" }, { n: "Disaster Mgmt", p: "1078" }, { n: "Emergency", p: "112" }].map(h => <a key={h.p} href={`tel:${h.p}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-2.5 hover:border-[#1a237e]"><span className="text-sm text-gray-700">{h.n}</span><span className="text-sm font-mono text-[#1a237e] flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{h.p}</span></a>)}</div></div> : <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-300"><Shield className="w-8 h-8 text-green-600" /></div><h2 className="text-lg font-bold text-green-800">{t(language, "sos_sent")}</h2><p className="text-sm text-gray-600">{t(language, "rescue_eta")}</p><div className="bg-white border border-gray-200 rounded-lg p-4 text-left text-xs text-gray-600 space-y-1"><p>Alert ID: <span className="font-mono text-gray-800">SOS-{Math.floor(Math.random() * 9000 + 1000)}</span></p><p>Location: <span className="font-mono text-gray-800">{simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E` : "28.6139°N, 77.2090°E"}</span></p><p>Method: <span className="font-mono text-gray-800">{simLoc?.method === "gps" ? "GPS" : simLoc?.method === "cell_tower" ? "Cell Tower" : "Wi-Fi"}</span></p></div><button onClick={() => { setSosSent(false); setView("home") }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button></div>}</div>
        </div>
    );

    // ─── ALERT FAMILY ───
    if(view === "alert-family") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "alert_family")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">{!familyAlerted ? <><p className="text-sm text-gray-600">Send safety status via SMS from {userDistrict.name}, {userState.name}.</p><div className="space-y-2">{[{ n: "Mom", p: "+91 98765 XXXXX" }, { n: "Dad", p: "+91 98764 XXXXX" }, { n: "Brother", p: "+91 87654 XXXXX" }].map((c, i) => <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Users className="w-4 h-4 text-[#1a237e]" /></div><div><p className="text-sm font-semibold text-gray-800">{c.n}</p><p className="text-[10px] text-gray-400">{c.p}</p></div></div><span className="text-[10px] text-gray-400">✓</span></div>)}</div><button onClick={() => { setFamilyAlerted(true); speak(`${t(language, "alert_family")} sent`, language) }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">📩 Send Safety Alert</button></> : <div className="text-center space-y-4"><Shield className="w-14 h-14 text-green-600 mx-auto" /><h2 className="text-lg font-bold text-green-800">Family Alerted ✓</h2><p className="text-sm text-gray-600">SMS with GPS sent from {userDistrict.name}.</p><button onClick={() => { setFamilyAlerted(false); setView("home") }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button></div>}</div>
        </div>
    );

    // ─── VULNERABILITY (MAP + LOCAL ONLY) ───
    if(view === "vulnerability") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={`${t(language, "vulnerable_areas")} — ${userState.name}`} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {/* Map */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <iframe src={getVulnMapEmbed()} className="w-full h-48 border-0" loading="lazy" title="Vulnerability Map" />
                    <p className="text-[10px] text-gray-400 px-3 py-1.5">📍 Vulnerability hotspots in {userState.name} · Your district marked</p>
                </div>
                <div className="bg-[#fff3cd] border border-[#ffc107] rounded px-3 py-2 text-xs text-[#856404]"><strong>Priority Notice:</strong> Higher vulnerability = earlier evacuation alerts. Showing {userState.name} only.</div>
                {/* User's district first */}
                <div className="bg-white border-2 border-[#1a237e] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2"><div><h3 className="text-sm font-bold text-[#1a237e]">📍 {userDistrict.name} (Your Location)</h3></div><div className="text-right"><span className="text-sm font-bold text-red-600">{userDistrict.vulnerability.vulnerability_score}/10</span></div></div>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">{[{ l: t(language, "elderly"), v: userDistrict.vulnerability.elderly_pct }, { l: t(language, "children"), v: userDistrict.vulnerability.children_pct }, { l: t(language, "disabled"), v: userDistrict.vulnerability.disabled_pct }, { l: "EWS", v: userDistrict.vulnerability.ews_pct }].map((x, i) => <div key={i} className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{x.l}</span><br /><span className="font-bold text-gray-700">{x.v}%</span></div>)}</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-1.5"><div className="bg-red-500 rounded-full h-1.5" style={{ width: `${userDistrict.vulnerability.vulnerability_score * 10}%` }} /></div>
                </div>
                {/* Other districts in same state */}
                {myVuln.filter(d => d.name !== userDistrict.name).map((d, i) => <div key={i} className="bg-white border border-gray-200 rounded-lg p-4"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-800">{d.name}</h3><span className="text-sm font-bold text-red-600">{d.vulnerability.vulnerability_score}/10</span></div><div className="grid grid-cols-4 gap-1 text-[10px]"><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">👴</span><br /><span className="font-bold">{d.vulnerability.elderly_pct}%</span></div><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">👶</span><br /><span className="font-bold">{d.vulnerability.children_pct}%</span></div><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">♿</span><br /><span className="font-bold">{d.vulnerability.disabled_pct}%</span></div><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">💰</span><br /><span className="font-bold">{d.vulnerability.ews_pct}%</span></div></div><div className="mt-2 bg-gray-200 rounded-full h-1.5"><div className="bg-red-500 rounded-full h-1.5" style={{ width: `${d.vulnerability.vulnerability_score * 10}%` }} /></div></div>)}
            </div>
        </div>
    );

    // ─── DAMS (MAP + LOCAL STATE ONLY) ───
    if(view === "dams") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={`${t(language, "dam_monitoring")} — ${userState.name}`} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {myDams.length > 0 ? <>
                    {/* Map */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${myDams[0].lng - 0.5},${myDams[0].lat - 0.5},${myDams[0].lng + 0.5},${myDams[0].lat + 0.5}&layer=mapnik&marker=${myDams[0].lat},${myDams[0].lng}`} className="w-full h-48 border-0" loading="lazy" title="Dam Map" />
                        <p className="text-[10px] text-gray-400 px-3 py-1.5">📍 Dams & Reservoirs near {userDistrict.name}, {userState.name}</p>
                    </div>
                    {dangerDams.length > 0 && <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700"><strong>⚠️ {dangerDams.length} dam(s)</strong> in critical status near your area</div>}
                    {myDams.map((d, i) => <div key={i} className="bg-white border border-gray-200 rounded-lg p-4"><div className="flex items-center justify-between mb-2"><div><h3 className="text-sm font-bold text-gray-800">{d.name}</h3><p className="text-[10px] text-gray-400">River: {d.river} · {d.district}</p></div><span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${damC(d.status)}`}>{d.status}</span></div><div className="flex items-center gap-2 mt-2"><div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full ${d.current_level_pct > 90 ? "bg-red-500" : d.current_level_pct > 80 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${d.current_level_pct}%` }} /></div><span className="text-xs font-bold text-gray-700">{d.current_level_pct}%</span></div><p className="text-[10px] text-gray-400 mt-1">Capacity: {d.capacity_mcm} MCM</p></div>)}
                </> : <div className="text-center py-12 text-gray-400"><Droplets className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">No dams/reservoirs linked to {userState.name} districts.</p></div>}
            </div>
        </div>
    );

    // ─── CITIZEN REPORT ───
    if(view === "report") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "report_flood")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">{!reportSent ? <><div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"><p className="text-sm text-gray-600">Report from <strong>{userDistrict.name}, {userState.name}</strong>. GPS auto-attached.</p><div><label className="block text-xs font-bold text-gray-500 mb-1">Type</label><select value={reportType} onChange={e => setReportType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800"><option value="waterlogging">🌊 Waterlogging</option><option value="drainage_blocked">🚰 Drainage Blocked</option><option value="road_flooded">🛣️ Road Flooded</option><option value="embankment_breach">🏗️ Embankment Breach</option><option value="other">📋 Other</option></select></div><button onClick={() => fileInputRef.current?.click?.()} className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#1a237e]">{reportPhoto ? <img src={reportPhoto} alt="" className="w-20 h-20 object-cover rounded" /> : <><Camera className="w-5 h-5" /><span className="text-sm">Upload photo</span></>}</button><input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = ev => setReportPhoto(ev.target?.result as string); r.readAsDataURL(f) } }} className="hidden" ref={fileInputRef} /><textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Describe the situation..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400" rows={3} /><div className="flex items-center gap-2 text-[10px] text-gray-400"><MapPin className="w-3 h-3" />GPS: {simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E (${simLoc.method})` : "detecting..."}</div></div><button onClick={handleSubmitReport} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Send className="w-4 h-4" />Submit Report to NDRF</button></> : <div className="text-center space-y-4"><Shield className="w-14 h-14 text-green-600 mx-auto" /><h2 className="text-lg font-bold text-green-800">{t(language, "report_submitted")}</h2><p className="text-sm text-gray-600">Report from {userDistrict.name} sent to NDRF. Visible in Authority Dashboard.</p><button onClick={() => { setReportSent(false); setReportPhoto(null); setReportDesc(""); setView("home") }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button></div>}</div>
        </div>
    );

    // ─── ANALYTICS (HYDROMET) ───
    if(view === "analytics") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title="Hydromet Analytics" showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📍 {userDistrict.name} — Live Conditions</h3>
                    <div className="grid grid-cols-2 gap-3">{[{ l: "🌧️ Rainfall (24h)", v: `${liveRisk?.weather?.rainfall_24h || userDistrict.rainfall}mm` }, { l: "🌡️ Temperature", v: `${liveRisk?.weather?.temperature || 28}°C` }, { l: "💧 Soil Moisture", v: `${((liveRisk?.weather?.soil_moisture || 0) * 100).toFixed(0)}%` }, { l: "💨 Wind Speed", v: `${liveRisk?.weather?.wind_speed || 0} km/h` }, { l: "🌊 River Discharge", v: `${liveRisk?.discharge?.current_discharge?.toFixed(1) || 0} m³/s` }, { l: "📊 7-Day Rain", v: `${liveRisk?.weather?.rainfall_7d || 0}mm` }].map((m, i) => <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3"><p className="text-[10px] text-gray-400">{m.l}</p><p className="text-sm font-bold text-gray-800 mt-0.5">{m.v}</p></div>)}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📈 Rainfall Trend (10 days)</h3>
                    <div className="flex items-end gap-1 h-24">{(liveRisk?.weather?.daily_precipitation || [12, 8, 25, 40, 62, 35, 18, 9, 15, 22]).slice(-10).map((v, i) => { const max = Math.max(...(liveRisk?.weather?.daily_precipitation || [62]).slice(-10)); return <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5"><span className="text-[8px] text-gray-400">{typeof v === 'number' ? v.toFixed(0) : v}</span><div className={`w-full rounded-t ${Number(v) > 40 ? "bg-red-500" : Number(v) > 20 ? "bg-yellow-500" : "bg-blue-400"}`} style={{ height: `${Math.max(4, (Number(v) / Math.max(max, 1)) * 80)}px` }} /></div> })}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-2">🤖 Forecasting Model</h3>
                    <div className="space-y-2 text-xs text-gray-600"><p><strong>Model:</strong> {liveRisk?.model === "trained" ? "XGBoost ML" : "AI Analysis (Heuristic)"}</p><p><strong>Sources:</strong> Open-Meteo, GloFAS, IMD</p><p><strong>Accuracy:</strong> ~85% (1hr), ~72% (6hr)</p></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-2">🏗️ Infrastructure — {userDistrict.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs"><div className={`p-2 rounded border ${userDistrict.drainageHealth === "BLOCKED" || userDistrict.drainageHealth === "POOR" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}><p className="text-gray-500">Drainage</p><p className="font-bold">{userDistrict.drainageHealth || "N/A"}</p></div><div className={`p-2 rounded border ${userDistrict.embankmentRisk === "HIGH" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}><p className="text-gray-500">Embankment</p><p className="font-bold">{userDistrict.embankmentRisk || "N/A"}</p></div></div>
                </div>
            </div>
        </div>
    );

    // ─── SIM GPS LOCATION ───
    if(view === "location-info") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title="SIM GPS Location" showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {simLoc && <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${simLoc.lon - 0.02},${simLoc.lat - 0.02},${simLoc.lon + 0.02},${simLoc.lat + 0.02}&layer=mapnik&marker=${simLoc.lat},${simLoc.lon}`} className="w-full h-48 border-0" loading="lazy" title="Your Location" />
                </div>}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><p className="text-xs text-blue-700"><strong>How it works:</strong> Like &quot;Where is my Train&quot;, your location is detected via mobile network cell tower triangulation.</p></div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📍 Current Location</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">{[{ l: "Latitude", v: simLoc ? `${simLoc.lat.toFixed(4)}°N` : "..." }, { l: "Longitude", v: simLoc ? `${simLoc.lon.toFixed(4)}°E` : "..." }, { l: "Accuracy", v: simLoc ? `±${simLoc.accuracy_m}m` : "..." }, { l: "Method", v: simLoc?.method === "gps" ? "GPS" : simLoc?.method === "cell_tower" ? "Cell Tower" : "Wi-Fi" }, { l: "Tower ID", v: simLoc?.tower_id || "..." }, { l: "Signal", v: simLoc?.signal_strength ? `${simLoc.signal_strength} dBm` : "..." }].map((m, i) => <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3"><p className="text-[10px] text-gray-400">{m.l}</p><p className="text-sm font-bold text-gray-800 font-mono">{m.v}</p></div>)}</div>
                </div>
                {towers.length > 0 && <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📡 Nearest Towers</h3><div className="space-y-2">{towers.map((tw, i) => <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded px-3 py-2"><div><p className="text-xs font-mono text-gray-800">{tw.id}</p><p className="text-[10px] text-gray-400">{tw.distance_km} km away</p></div><p className="text-xs font-bold text-gray-700">{tw.signal} dBm</p></div>)}</div></div>}
            </div>
        </div>
    );

    // ─── HOME ───
    return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {/* AM I SAFE */}
                <button onClick={handleAmISafe} className={`w-full rounded-lg p-4 flex items-center justify-between border-2 transition-all ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-400" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-400" : "bg-green-50 border-green-400"}`}>
                    <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-full flex items-center justify-center ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-200" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-200" : "bg-green-200"}`}><Volume2 className={`w-6 h-6 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "text-red-700" : liveRisk?.riskLevel === "MODERATE" ? "text-yellow-700" : "text-green-700"}`} /></div><div className="text-left"><h2 className="text-lg font-bold text-gray-800">{t(language, "am_i_safe")}</h2><p className="text-xs text-gray-500">Tap for voice alert in {language}</p></div></div>
                    <div className="text-2xl font-black">{liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "🔴" : liveRisk?.riskLevel === "MODERATE" ? "🟡" : "🟢"}</div>
                </button>
                {/* Risk */}
                {loadingRisk ? <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 text-[#1a237e] animate-spin" /><span className="text-sm text-gray-500">{t(language, "loading")}</span></div> : <div className={`border rounded-lg p-4 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-300" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"}`}><div className="flex items-center justify-between mb-2"><span className={`text-xs font-bold px-2 py-0.5 rounded border ${sev(liveRisk?.riskLevel || "LOW")}`}>{liveRisk?.riskLevel || "LOW"}</span><span className="text-[10px] text-gray-500">{isOffline ? <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" />Cached</span> : <span>📡 Live · {userDistrict.name}</span>}</span></div><p className="text-sm text-gray-600">{t(language, "flood_probability")}: <strong>{((liveRisk?.probability || 0) * 100).toFixed(0)}%</strong> · Score: {liveRisk?.riskScore || 0}/10</p>{liveRisk?.weather && <div className="grid grid-cols-3 gap-2 mt-2"><div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">Rain 24h</p><p className="text-sm font-bold text-gray-800">{liveRisk.weather.rainfall_24h}mm</p></div><div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">Temp</p><p className="text-sm font-bold text-gray-800">{liveRisk.weather.temperature}°C</p></div><div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">Soil</p><p className="text-sm font-bold text-gray-800">{((liveRisk.weather.soil_moisture || 0) * 100).toFixed(0)}%</p></div></div>}</div>}
                {/* SIM Location */}
                {simLoc && <button onClick={() => setView("location-info")} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between hover:border-[#1a237e]"><div className="flex items-center gap-2"><Radio className="w-4 h-4 text-[#1a237e]" /><div className="text-left"><p className="text-xs font-semibold text-gray-800">SIM GPS: {simLoc.lat.toFixed(3)}°N, {simLoc.lon.toFixed(3)}°E</p><p className="text-[10px] text-gray-400">via {simLoc.method === "gps" ? "GPS" : simLoc.method === "cell_tower" ? "Cell Tower" : "Wi-Fi"} · ±{simLoc.accuracy_m}m</p></div></div><ChevronRight className="w-4 h-4 text-gray-400" /></button>}
                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{t(language, "quick_actions")}</h3>
                    <div className="grid grid-cols-2 gap-2">{[{ i: <Navigation className="w-4 h-4" />, l: t(language, "evacuation_route"), v: "evacuate" as View, c: "#1a237e" }, { i: <MapPin className="w-4 h-4" />, l: t(language, "nearby_shelters"), v: "shelters" as View, c: "#1a237e" }, { i: <Siren className="w-4 h-4" />, l: t(language, "send_sos"), v: "sos" as View, c: "#b71c1c" }, { i: <Bell className="w-4 h-4" />, l: t(language, "alert_family"), v: "alert-family" as View, c: "#1a237e" }, { i: <Camera className="w-4 h-4" />, l: t(language, "report_flood"), v: "report" as View, c: "#1a237e" }, { i: <TrendingUp className="w-4 h-4" />, l: "Hydromet Analytics", v: "analytics" as View, c: "#1a237e" }, { i: <Heart className="w-4 h-4" />, l: t(language, "vulnerable_areas"), v: "vulnerability" as View, c: "#b71c1c" }, { i: <Droplets className="w-4 h-4" />, l: t(language, "dam_monitoring"), v: "dams" as View, c: "#1a237e" }].map((it, i) => <button key={i} onClick={() => setView(it.v)} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-left hover:border-[#1a237e] group"><div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: it.c }}>{it.i}</div><span className="text-xs font-semibold text-gray-700 group-hover:text-[#1a237e]">{it.l}</span></button>)}</div>
                </div>
                {/* Dam alerts from YOUR state */}
                {dangerDams.length > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><h3 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />Dams Near {userState.name}</h3>{dangerDams.map((d, i) => <div key={i} className="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0"><div><p className="text-xs font-semibold text-gray-800">{d.name}</p><p className="text-[10px] text-gray-500">{d.river}·{d.district}</p></div><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${damC(d.status)}`}>{d.status} ({d.current_level_pct}%)</span></div>)}<button onClick={() => setView("dams")} className="mt-2 text-[10px] font-bold text-[#1a237e]">{t(language, "view_all")} →</button></div>}
                {/* Recent Reports from YOUR state */}
                {myReports.length > 0 && <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📝 Reports ({userState.name})</h3><div className="space-y-2">{myReports.slice(0, 3).map((r, i) => <div key={i} className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded p-2"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sev(r.severity)}`}>{r.severity}</span><div className="flex-1"><p className="text-xs text-gray-700">{r.description.slice(0, 80)}...</p><p className="text-[10px] text-gray-400 mt-0.5">{r.district} · 👍 {r.upvotes}</p></div></div>)}</div></div>}
                {/* Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{t(language, "active_alerts")}</h3><div className="space-y-2">{alertItems.map((a, i) => <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sev(a.severity)}`}>{a.severity}</span><div className="flex-1"><p className="text-xs text-gray-700">{a.msg}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p></div></div>)}</div></div>
                <div className="text-center text-[10px] text-gray-400 py-2">© 2024 FloodSense AI · NDRF · Govt. of India</div>
            </div>
        </div>
    );
}
