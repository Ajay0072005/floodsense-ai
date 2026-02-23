"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    AlertTriangle, MapPin, Bell, Navigation, Globe, Phone,
    ChevronRight, Shield, LogOut, ArrowLeft, Volume2,
    Siren, BarChart3, Users, Loader2, Camera, Wifi, WifiOff,
    Droplets, Building, Heart, Send
} from "lucide-react";
import { STATES_DATA, getHighRiskDistricts, getStateRiskSummary, getVulnerableDistricts, getAllDams, getDangerDams, type StateData, type DistrictData, type DamData } from "@/data/statesData";
import { fetchRiskPrediction, type RiskPrediction, type FloodAlert } from "@/lib/api";
import { t, speak, LANG_MAP } from "@/lib/translations";

type View = "home" | "evacuate" | "shelters" | "sos" | "alert-family" | "state-analysis" | "district-detail" | "vulnerability" | "dams" | "report" | "offline";

export default function CitizenDashboard({ onLogout }: { onLogout: () => void }) {
    const [view, setView] = useState<View>("home");
    const [language, setLanguage] = useState("English");
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [selectedState, setSelectedState] = useState<StateData | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<(DistrictData & { stateName?: string }) | null>(null);
    const [sosSent, setSosSent] = useState(false);
    const [familyAlerted, setFamilyAlerted] = useState(false);
    const [liveRisk, setLiveRisk] = useState<RiskPrediction | null>(null);
    const [liveAlerts, setLiveAlerts] = useState<FloodAlert[]>([]);
    const [loadingRisk, setLoadingRisk] = useState(true);
    const [reportSent, setReportSent] = useState(false);
    const [reportPhoto, setReportPhoto] = useState<string | null>(null);
    const [reportDesc, setReportDesc] = useState("");
    const [isOffline, setIsOffline] = useState(false);
    const [cachedRisk, setCachedRisk] = useState<RiskPrediction | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Offline detection
    useEffect(() => {
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);
        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);
        setIsOffline(!navigator.onLine);
        return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
    }, []);

    // Fetch live risk & cache for offline
    useEffect(() => {
        async function loadRisk() {
            try {
                const data = await fetchRiskPrediction(28.6139, 77.2090, "Delhi", "Delhi");
                setLiveRisk(data);
                setCachedRisk(data);
                if(data.alerts) setLiveAlerts(data.alerts);
                // Cache for offline
                try { localStorage.setItem('floodsense_cached_risk', JSON.stringify(data)); } catch { }
            } catch(e) {
                console.error("Failed to fetch live risk:", e);
                // Try loading cached data
                try {
                    const cached = localStorage.getItem('floodsense_cached_risk');
                    if(cached) { const d = JSON.parse(cached); setLiveRisk(d); setCachedRisk(d); }
                } catch { }
            } finally { setLoadingRisk(false); }
        }
        loadRisk();
        const interval = setInterval(loadRisk, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const languages = Object.keys(LANG_MAP);
    const highRiskDistricts = getHighRiskDistricts().slice(0, 5);
    const dangerDams = getDangerDams();
    const topVulnerable = getVulnerableDistricts().slice(0, 5);

    const alertItems = liveAlerts.length > 0
        ? liveAlerts.map(a => ({ severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString(), msg: a.message }))
        : [{ severity: "LOW" as const, time: "Now", msg: t(language, "no_alerts") }];

    const severityBadge = (sev: string) => {
        if(sev === "SEVERE" || sev === "HIGH") return "bg-red-100 text-red-800 border-red-200";
        if(sev === "MODERATE") return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-green-100 text-green-800 border-green-200";
    };

    const damStatusColor = (s: string) => {
        if(s === "OVERFLOW") return "bg-red-600 text-white";
        if(s === "DANGER") return "bg-red-100 text-red-700 border-red-200";
        if(s === "ALERT") return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-green-100 text-green-700 border-green-200";
    };

    // "Am I Safe?" voice function
    const handleAmISafe = () => {
        const risk = liveRisk?.riskLevel || "LOW";
        let msg: string;
        if(risk === "HIGH" || risk === "SEVERE") msg = t(language, "danger_alert");
        else if(risk === "MODERATE") msg = t(language, "moderate_risk");
        else msg = t(language, "you_are_safe");
        speak(msg, language);
    };

    // Photo upload handler
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (ev) => setReportPhoto(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    // GOV HEADER
    const GovHeader = ({ title, showBack }: { title?: string; showBack?: boolean }) => (
        <div className="w-full">
            <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
            <div className="bg-[#1a237e] text-white px-4 py-2.5">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showBack && <button onClick={() => setView("home")} className="text-white/70 hover:text-white mr-1"><ArrowLeft className="w-5 h-5" /></button>}
                        <span className="text-2xl">🏛️</span>
                        <div>
                            <h1 className="text-sm font-bold">{title || "FloodSense AI"}</h1>
                            <p className="text-[9px] text-blue-200">NDRF · Ministry of Home Affairs</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOffline && <span className="text-[9px] bg-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5"><WifiOff className="w-2.5 h-2.5" /> Offline</span>}
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-1 rounded">
                                <Globe className="w-3 h-3" /> {language}
                            </button>
                            {showLangMenu && (
                                <div className="absolute right-0 mt-1 w-36 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">
                                    {languages.map(lang => (
                                        <button key={lang} onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${language === lang ? "text-[#1a237e] font-bold bg-blue-50" : "text-gray-700"}`}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onLogout} className="text-[10px] bg-white/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-white/20">
                            <LogOut className="w-3 h-3" /> {t(language, "logout")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // EVACUATE VIEW
    if(view === "evacuate") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "evacuation_route")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h2 className="text-base font-bold text-gray-800 mb-1">🧭 {t(language, "safe_route")}</h2>
                        <p className="text-sm text-gray-500 mb-4">{t(language, "avoid_flooded")}</p>
                        <div className="space-y-2">
                            {[
                                { step: 1, dir: "Head North on NH-44", dist: "1.2 km", time: "8 min", safe: true },
                                { step: 2, dir: "Turn Right onto Elevated Flyover", dist: "0.8 km", time: "5 min", safe: true },
                                { step: 3, dir: "⚠️ Avoid Main Street (Flooded)", dist: "—", time: "—", safe: false },
                                { step: 4, dir: "Continue to Relief Camp #3", dist: "2.1 km", time: "12 min", safe: true },
                            ].map(r => (
                                <div key={r.step} className={`flex items-center gap-3 p-3 rounded border ${r.safe ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${r.safe ? "bg-[#1a237e]" : "bg-red-500"}`}>{r.step}</div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${r.safe ? "text-gray-800" : "text-red-700"}`}>{r.dir}</p>
                                        <p className="text-[10px] text-gray-400">{r.dist} · {r.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Time-to-impact countdown */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">⏱️ Time to Impact</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-blue-800">25</p><p className="text-[9px] text-gray-500">min to shelter</p></div>
                            <div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-red-600">45</p><p className="text-[9px] text-gray-500">min to flood</p></div>
                            <div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-green-600">20</p><p className="text-[9px] text-gray-500">min buffer</p></div>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-800 font-semibold">🏕️ {t(language, "destination")}: Relief Camp #3</p>
                        <p className="text-xs text-green-600 mt-1">Capacity: 500 · {t(language, "distance")}: 4.1 km · ETA: 25 min</p>
                    </div>
                </div>
            </div>
        );
    }

    // SHELTERS VIEW
    if(view === "shelters") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "nearby_shelters")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    {[
                        { name: "Relief Camp #3 - Govt School", dist: "2.1 km", cap: "500", avail: "187", status: "Open" },
                        { name: "Community Hall - Block A", dist: "3.4 km", cap: "300", avail: "92", status: "Open" },
                        { name: "Stadium Emergency Shelter", dist: "5.8 km", cap: "1200", avail: "640", status: "Open" },
                        { name: "Temple Complex Shelter", dist: "1.8 km", cap: "150", avail: "0", status: "Full" },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white border rounded-lg p-4 ${s.status === "Full" ? "border-red-200 opacity-60" : "border-gray-200"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-gray-800">{s.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${s.status === "Full" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>{s.status}</span>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500"><span>📍 {s.dist}</span><span>👥 {s.avail}/{s.cap}</span></div>
                            {s.status !== "Full" && (
                                <button onClick={() => setView("evacuate")} className="mt-3 w-full text-xs font-bold bg-[#1a237e] text-white py-2 rounded hover:bg-[#283593]">
                                    Navigate Here →
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // SOS VIEW
    if(view === "sos") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "emergency_sos")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
                    {!sosSent ? (
                        <div className="text-center space-y-5">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 border-2 border-red-300">
                                <Siren className="w-12 h-12 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-red-800">{t(language, "emergency_sos")}</h2>
                            <p className="text-sm text-gray-600 max-w-xs mx-auto">This will send SMS to NDRF, call 112, and share GPS coordinates with rescue teams.</p>
                            <button onClick={() => { setSosSent(true); speak(t(language, "sos_sent"), language); }}
                                className="w-full py-3 bg-red-600 text-white rounded-lg text-base font-bold hover:bg-red-700">
                                🚨 SEND SOS ALERT
                            </button>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-left space-y-2">
                                <p className="text-xs text-gray-500 font-bold uppercase">{t(language, "helplines")}:</p>
                                {[
                                    { name: "NDRF Helpline", num: "011-24363260" },
                                    { name: "Disaster Mgmt", num: "1078" },
                                    { name: "Emergency", num: "112" },
                                ].map(h => (
                                    <a key={h.num} href={`tel:${h.num}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-2.5 hover:border-[#1a237e]">
                                        <span className="text-sm text-gray-700">{h.name}</span>
                                        <span className="text-sm font-mono text-[#1a237e] flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {h.num}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-300">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-green-800">{t(language, "sos_sent")}</h2>
                            <p className="text-sm text-gray-600">{t(language, "rescue_eta")}</p>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-left text-xs text-gray-600 space-y-1">
                                <p>Alert ID: <span className="font-mono text-gray-800">SOS-2026-{Math.floor(Math.random() * 9000 + 1000)}</span></p>
                                <p>Location: <span className="font-mono text-gray-800">28.6139°N, 77.2090°E</span></p>
                                <p>SMS sent to: <span className="text-green-600 font-bold">NDRF, 112, Family contacts</span></p>
                                <p>Status: <span className="text-green-600 font-bold">Acknowledged</span></p>
                            </div>
                            <button onClick={() => { setSosSent(false); setView("home"); }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">
                                {t(language, "back")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ALERT FAMILY VIEW
    if(view === "alert-family") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "alert_family")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {!familyAlerted ? (
                        <>
                            <p className="text-sm text-gray-600">Send your safety status via SMS with GPS coordinates to emergency contacts.</p>
                            <div className="space-y-2">
                                {[
                                    { name: "Mom", phone: "+91 98765 XXXXX" },
                                    { name: "Dad", phone: "+91 98764 XXXXX" },
                                    { name: "Brother", phone: "+91 87654 XXXXX" },
                                ].map((c, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Users className="w-4 h-4 text-[#1a237e]" /></div>
                                            <div><p className="text-sm font-semibold text-gray-800">{c.name}</p><p className="text-[10px] text-gray-400">{c.phone}</p></div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">✓ Registered</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { setFamilyAlerted(true); speak(`${t(language, "alert_family")} — SMS sent`, language); }}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">
                                📩 Send Safety Alert (SMS + GPS)
                            </button>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 border border-green-300"><Shield className="w-7 h-7 text-green-600" /></div>
                            <h2 className="text-lg font-bold text-green-800">Family Alerted ✓</h2>
                            <p className="text-sm text-gray-600">SMS with safety status and GPS (28.6139°N, 77.2090°E) sent to 3 contacts.</p>
                            <button onClick={() => { setFamilyAlerted(false); setView("home"); }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // VULNERABILITY VIEW
    if(view === "vulnerability") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "vulnerable_areas")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    <div className="bg-[#fff3cd] border border-[#ffc107] rounded px-3 py-2 text-xs text-[#856404]">
                        <strong>Priority Notice:</strong> Areas with high vulnerability scores receive earlier evacuation alerts. Scores based on elderly, children, disabled, and economically weaker populations.
                    </div>
                    {topVulnerable.map((d, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{d.name}</h3>
                                    <p className="text-[10px] text-gray-400">{(d as any).stateName}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-red-600">{d.vulnerability.vulnerability_score}/10</span>
                                    <p className="text-[9px] text-gray-400">Vuln. Score</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-[10px]">
                                <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{t(language, "elderly")}</span><br /><span className="font-bold text-gray-700">{d.vulnerability.elderly_pct}%</span></div>
                                <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{t(language, "children")}</span><br /><span className="font-bold text-gray-700">{d.vulnerability.children_pct}%</span></div>
                                <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{t(language, "disabled")}</span><br /><span className="font-bold text-gray-700">{d.vulnerability.disabled_pct}%</span></div>
                                <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">EWS</span><br /><span className="font-bold text-gray-700">{d.vulnerability.ews_pct}%</span></div>
                            </div>
                            <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-red-500 rounded-full h-1.5" style={{ width: `${d.vulnerability.vulnerability_score * 10}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // DAMS VIEW
    if(view === "dams") {
        const allDams = getAllDams();
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "dam_monitoring")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    {dangerDams.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                            <strong>⚠️ {dangerDams.length} dam(s)</strong> in DANGER/OVERFLOW status. Downstream areas should prepare for possible evacuation.
                        </div>
                    )}
                    {allDams.map((dam, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{dam.name}</h3>
                                    <p className="text-[10px] text-gray-400">River: {dam.river} · {dam.district}, {dam.state}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${damStatusColor(dam.status)}`}>{dam.status}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className={`h-full rounded-full ${dam.current_level_pct > 90 ? "bg-red-500" : dam.current_level_pct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                                        style={{ width: `${dam.current_level_pct}%` }} />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{dam.current_level_pct}%</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Capacity: {dam.capacity_mcm} MCM</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // CITIZEN REPORT VIEW
    if(view === "report") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "report_flood")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {!reportSent ? (
                        <>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                <p className="text-sm text-gray-600">Report waterlogging, drainage blockages, or flood damage at your location. Your GPS coordinates will be auto-attached.</p>
                                <input type="hidden" ref={fileInputRef as any} />
                                <button onClick={() => fileInputRef.current?.click?.()}
                                    className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#1a237e] hover:text-[#1a237e] transition-colors">
                                    {reportPhoto ? (
                                        <img src={reportPhoto} alt="Uploaded" className="w-24 h-24 object-cover rounded" />
                                    ) : (
                                        <><Camera className="w-6 h-6" /><span className="text-sm">Tap to upload photo</span></>
                                    )}
                                </button>
                                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" ref={fileInputRef} />
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                    <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)}
                                        placeholder="Describe the situation (e.g., water level, road condition)..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a237e]"
                                        rows={3} />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <MapPin className="w-3 h-3" /> GPS: 28.6139°N, 77.2090°E (auto-detected)
                                </div>
                            </div>
                            <button onClick={() => setReportSent(true)}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Submit Report
                            </button>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 border border-green-300"><Shield className="w-7 h-7 text-green-600" /></div>
                            <h2 className="text-lg font-bold text-green-800">{t(language, "report_submitted")}</h2>
                            <p className="text-sm text-gray-600">Your report has been submitted to the local municipal corporation and NDRF control room.</p>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600 text-left space-y-1">
                                <p>Report ID: <span className="font-mono text-gray-800">RPT-{Math.floor(Math.random() * 9000 + 1000)}</span></p>
                                <p>GPS: <span className="font-mono text-gray-800">28.6139°N, 77.2090°E</span></p>
                                <p>Status: <span className="text-green-600 font-bold">Received by Ward Office</span></p>
                            </div>
                            <button onClick={() => { setReportSent(false); setReportPhoto(null); setReportDesc(""); setView("home"); }}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // STATE ANALYSIS VIEW
    if(view === "state-analysis") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={t(language, "state_analysis")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    {STATES_DATA.map((st) => {
                        const summary = getStateRiskSummary(st);
                        return (
                            <button key={st.name} onClick={() => { setSelectedState(st); }}
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-[#1a237e] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">{st.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{st.districts.length} districts</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right text-[10px]">
                                            {summary.highCount > 0 && <span className="block text-red-600 font-bold">{summary.highCount} High</span>}
                                            {summary.moderateCount > 0 && <span className="block text-yellow-600">{summary.moderateCount} Moderate</span>}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // DISTRICT DETAIL VIEW
    if(view === "district-detail" && selectedDistrict) {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={selectedDistrict.name} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <div className={`border rounded-lg p-4 ${selectedDistrict.riskLevel === "HIGH" ? "bg-red-50 border-red-200" : selectedDistrict.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${severityBadge(selectedDistrict.riskLevel)}`}>{selectedDistrict.riskLevel} RISK</span>
                        <h2 className="text-lg font-bold text-gray-800 mt-2">{selectedDistrict.name}</h2>
                        <p className="text-xs text-gray-500">{selectedDistrict.stateName}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{t(language, "current_conditions")}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Rainfall", value: `${selectedDistrict.rainfall}mm`, icon: "🌧️" },
                                { label: "Water Level", value: `${selectedDistrict.waterLevel}m`, icon: "🌊" },
                                { label: "Drainage", value: selectedDistrict.drainageHealth || "N/A", icon: "🚰" },
                                { label: "Embankment", value: selectedDistrict.embankmentRisk || "N/A", icon: "🏗️" },
                            ].map((m, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] text-gray-400">{m.icon} {m.label}</p>
                                    <p className="text-sm font-bold text-gray-800 mt-0.5">{m.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Vulnerability */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{t(language, "vulnerable_areas")} — Score: {selectedDistrict.vulnerability.vulnerability_score}/10</h3>
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                            <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{t(language, "elderly")}</span><br /><span className="font-bold">{selectedDistrict.vulnerability.elderly_pct}%</span></div>
                            <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{t(language, "children")}</span><br /><span className="font-bold">{selectedDistrict.vulnerability.children_pct}%</span></div>
                            <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{t(language, "disabled")}</span><br /><span className="font-bold">{selectedDistrict.vulnerability.disabled_pct}%</span></div>
                            <div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">EWS</span><br /><span className="font-bold">{selectedDistrict.vulnerability.ews_pct}%</span></div>
                        </div>
                    </div>
                    {/* Nearby Dams */}
                    {selectedDistrict.nearbyDams && selectedDistrict.nearbyDams.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{t(language, "dam_monitoring")}</h3>
                            {selectedDistrict.nearbyDams.map((dam, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">{dam.name}</p>
                                        <p className="text-[10px] text-gray-400">River: {dam.river} · {dam.capacity_mcm} MCM</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${damStatusColor(dam.status)}`}>{dam.status}</span>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{dam.current_level_pct}% full</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── HOME VIEW ───
    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            <GovHeader />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

                {/* "AM I SAFE?" VOICE BUTTON */}
                <button onClick={handleAmISafe}
                    className={`w-full rounded-lg p-4 flex items-center justify-between border-2 transition-all ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-400 hover:bg-red-100" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-400 hover:bg-yellow-100" : "bg-green-50 border-green-400 hover:bg-green-100"}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-200" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-200" : "bg-green-200"}`}>
                            <Volume2 className={`w-6 h-6 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "text-red-700" : liveRisk?.riskLevel === "MODERATE" ? "text-yellow-700" : "text-green-700"}`} />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-bold text-gray-800">{t(language, "am_i_safe")}</h2>
                            <p className="text-xs text-gray-500">Tap to hear voice alert in {language}</p>
                        </div>
                    </div>
                    <div className={`text-2xl font-black ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "text-red-600" : liveRisk?.riskLevel === "MODERATE" ? "text-yellow-600" : "text-green-600"}`}>
                        {liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "🔴" : liveRisk?.riskLevel === "MODERATE" ? "🟡" : "🟢"}
                    </div>
                </button>

                {/* Risk Status */}
                {loadingRisk ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-[#1a237e] animate-spin" />
                        <span className="text-sm text-gray-500">{t(language, "loading")}</span>
                    </div>
                ) : (
                    <div className={`border rounded-lg p-4 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-300" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${severityBadge(liveRisk?.riskLevel || "LOW")}`}>{liveRisk?.riskLevel || "LOW"}</span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">{isOffline ? <><WifiOff className="w-3 h-3" /> Cached</> : <>📡 Live</>}</span>
                        </div>
                        <p className="text-sm text-gray-600">{t(language, "flood_probability")}: <strong>{((liveRisk?.probability || 0) * 100).toFixed(0)}%</strong> · Score: {liveRisk?.riskScore || 0}/10</p>
                        {liveRisk?.weather && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">Rain 24h</p><p className="text-sm font-bold text-gray-800">{liveRisk.weather.rainfall_24h}mm</p></div>
                                <div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">Temp</p><p className="text-sm font-bold text-gray-800">{liveRisk.weather.temperature}°C</p></div>
                                <div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">Soil</p><p className="text-sm font-bold text-gray-800">{((liveRisk.weather.soil_moisture || 0) * 100).toFixed(0)}%</p></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions — 3 rows */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{t(language, "quick_actions")}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { icon: <Navigation className="w-4 h-4" />, label: t(language, "evacuation_route"), view: "evacuate" as View, color: "#1a237e" },
                            { icon: <MapPin className="w-4 h-4" />, label: t(language, "nearby_shelters"), view: "shelters" as View, color: "#1a237e" },
                            { icon: <Siren className="w-4 h-4" />, label: t(language, "send_sos"), view: "sos" as View, color: "#b71c1c" },
                            { icon: <Bell className="w-4 h-4" />, label: t(language, "alert_family"), view: "alert-family" as View, color: "#1a237e" },
                            { icon: <Camera className="w-4 h-4" />, label: t(language, "report_flood"), view: "report" as View, color: "#1a237e" },
                            { icon: <Heart className="w-4 h-4" />, label: t(language, "vulnerable_areas"), view: "vulnerability" as View, color: "#b71c1c" },
                            { icon: <Droplets className="w-4 h-4" />, label: t(language, "dam_monitoring"), view: "dams" as View, color: "#1a237e" },
                            { icon: <BarChart3 className="w-4 h-4" />, label: t(language, "state_analysis"), view: "state-analysis" as View, color: "#1a237e" },
                        ].map((item, i) => (
                            <button key={i} onClick={() => setView(item.view)}
                                className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-left hover:border-[#1a237e] group">
                                <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>{item.icon}</div>
                                <span className="text-xs font-semibold text-gray-700 group-hover:text-[#1a237e]">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dam Alerts */}
                {dangerDams.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> {t(language, "dam_monitoring")}</h3>
                        {dangerDams.slice(0, 3).map((dam, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0">
                                <div><p className="text-xs font-semibold text-gray-800">{dam.name}</p><p className="text-[10px] text-gray-500">{dam.river} · {dam.state}</p></div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${damStatusColor(dam.status)}`}>{dam.status} ({dam.current_level_pct}%)</span>
                            </div>
                        ))}
                        <button onClick={() => setView("dams")} className="mt-2 text-[10px] font-bold text-[#1a237e]">{t(language, "view_all")} →</button>
                    </div>
                )}

                {/* Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {t(language, "active_alerts")}</h3>
                    <div className="space-y-2">
                        {alertItems.map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityBadge(a.severity)}`}>{a.severity}</span>
                                <div className="flex-1"><p className="text-xs text-gray-700">{a.msg}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High Risk Districts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">{t(language, "high_risk")} Districts</h3>
                        <button onClick={() => setView("state-analysis")} className="text-[10px] font-bold text-[#1a237e]">{t(language, "view_all")} →</button>
                    </div>
                    <div className="space-y-1.5">
                        {highRiskDistricts.map((d, i) => (
                            <button key={i} onClick={() => { setSelectedDistrict(d as any); setView("district-detail"); }}
                                className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded px-3 py-2 text-left hover:border-[#1a237e]">
                                <div><p className="text-xs font-semibold text-gray-800">{d.name}</p><p className="text-[10px] text-gray-400">{(d as any).stateName}</p></div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityBadge(d.riskLevel)}`}>{d.riskLevel}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-gray-400 py-2">
                    © 2024 FloodSense AI · NDRF · Govt. of India
                </div>
            </div>
        </div>
    );
}
