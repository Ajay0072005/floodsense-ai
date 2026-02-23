"use client";

import React, { useState, useEffect } from "react";
import {
    AlertTriangle, MapPin, Bell, Navigation, Globe, Phone,
    Droplets, ChevronRight, Shield, LogOut, ArrowLeft, X,
    Siren, BarChart3, TrendingUp, Users, Loader2
} from "lucide-react";
import { STATES_DATA, getHighRiskDistricts, getStateRiskSummary, type StateData, type DistrictData } from "@/data/statesData";
import { fetchRiskPrediction, fetchWeatherDirect, type RiskPrediction, type FloodAlert } from "@/lib/api";

type View = "home" | "map" | "evacuate" | "shelters" | "sos" | "alert-family" | "state-analysis" | "district-detail";

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

    // Fetch live risk data on mount
    useEffect(() => {
        async function loadRisk() {
            try {
                // Default to Delhi; in production, use GPS
                const data = await fetchRiskPrediction(28.6139, 77.2090, "Delhi", "Delhi");
                setLiveRisk(data);
                if(data.alerts) setLiveAlerts(data.alerts);
            } catch(e) {
                console.error("Failed to fetch live risk:", e);
            } finally {
                setLoadingRisk(false);
            }
        }
        loadRisk();
        // Refresh every 5 minutes
        const interval = setInterval(loadRisk, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const languages = [
        "English", "हिन्दी", "বাংলা", "తెలుగు", "தமிழ்", "मराठी",
        "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "অসমীয়া", "ଓଡ଼ିଆ",
        "سنڌي", "संस्कृतम्", "नेपाली", "डोगरी", "মৈতৈলোন্", "سائراءکی",
        "বড়ো", "ꯃꯤꯇꯩꯂꯣꯟ", "கொங்கணி", "𑚊𑚞𑚤𑚥𑚒𑚎𑚌",
    ];

    const highRiskDistricts = getHighRiskDistricts().slice(0, 5);

    const riskColor = (level: string) =>
        level === "HIGH" || level === "SEVERE" ? "red" : level === "MODERATE" ? "amber" : "green";

    // Use live alerts if available, fallback to static
    const alertItems = liveAlerts.length > 0
        ? liveAlerts.map(a => ({
            severity: a.severity,
            time: new Date(a.timestamp).toLocaleTimeString(),
            msg: a.message,
            color: a.severity === "HIGH" || a.severity === "SEVERE" ? "red" : a.severity === "MODERATE" ? "amber" : "green",
        }))
        : [
            { severity: "HIGH", time: "2 min ago", msg: "Heavy rainfall expected. Seek higher ground.", color: "red" },
            { severity: "MODERATE", time: "15 min ago", msg: "Water levels rising. Prepare emergency kit.", color: "amber" },
            { severity: "LOW", time: "1 hr ago", msg: "Light showers expected. No immediate risk.", color: "green" },
        ];

    // ─── HEADER ───
    const Header = ({ title, showBack }: { title?: string; showBack?: boolean }) => (
        <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800/50">
            <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    {showBack && (
                        <button onClick={() => setView("home")} className="text-slate-400 hover:text-white mr-1 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <Droplets className="w-6 h-6 text-blue-400" />
                    <span className="text-lg font-bold">{title || "FloodSense"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                            <Globe className="w-3.5 h-3.5 text-blue-400" /> {language}
                        </button>
                        {showLangMenu && (
                            <div className="absolute right-0 mt-1 w-40 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
                                {languages.map(lang => (
                                    <button key={lang} onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors ${language === lang ? "text-blue-400 bg-slate-700/50" : "text-slate-300"}`}>
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-1.5 text-xs bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                </div>
            </div>
        </header>
    );

    // ─── EVACUATE VIEW ───
    if(view === "evacuate") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title="Evacuation Route" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                        <h2 className="text-lg font-bold text-blue-300 mb-2">🧭 Nearest Safe Route</h2>
                        <p className="text-sm text-slate-300 mb-4">Your current location has been detected. The safest evacuation route avoids all flood-prone roads.</p>
                        <div className="space-y-3">
                            {[
                                { step: 1, dir: "Head North on NH-44", dist: "1.2 km", safe: true },
                                { step: 2, dir: "Turn Right onto Elevated Flyover", dist: "0.8 km", safe: true },
                                { step: 3, dir: "⚠️ Avoid Main Street (Flooded)", dist: "—", safe: false },
                                { step: 4, dir: "Continue to Relief Camp #3", dist: "2.1 km", safe: true },
                            ].map(r => (
                                <div key={r.step} className={`flex items-center gap-3 p-3 rounded-xl ${r.safe ? "bg-slate-800/50 border border-slate-700/30" : "bg-red-500/10 border border-red-500/20"}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${r.safe ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                                        {r.step}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${r.safe ? "text-slate-200" : "text-red-300"}`}>{r.dir}</p>
                                        <p className="text-[10px] text-slate-500">{r.dist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-emerald-300 font-semibold">🏕️ Destination: Relief Camp #3</p>
                        <p className="text-xs text-slate-400 mt-1">Capacity: 500 people · Distance: 4.1 km · ETA: 25 min on foot</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SHELTERS VIEW ───
    if(view === "shelters") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title="Nearby Shelters" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    {[
                        { name: "Relief Camp #3 - Govt School", dist: "2.1 km", cap: "500", avail: "187", status: "Open" },
                        { name: "Community Hall - Block A", dist: "3.4 km", cap: "300", avail: "92", status: "Open" },
                        { name: "Stadium Emergency Shelter", dist: "5.8 km", cap: "1200", avail: "640", status: "Open" },
                        { name: "Temple Complex Shelter", dist: "1.8 km", cap: "150", avail: "0", status: "Full" },
                    ].map((s, i) => (
                        <div key={i} className={`rounded-xl border p-4 ${s.status === "Full" ? "bg-red-500/5 border-red-500/20 opacity-60" : "bg-slate-900/60 border-slate-800/50"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-slate-200">{s.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.status === "Full" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>{s.status}</span>
                            </div>
                            <div className="flex gap-4 text-[11px] text-slate-400">
                                <span>📍 {s.dist}</span>
                                <span>👥 {s.avail}/{s.cap} available</span>
                            </div>
                            {s.status !== "Full" && (
                                <button onClick={() => setView("evacuate")} className="mt-3 w-full text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/20 py-2 rounded-lg hover:bg-blue-600/30 transition-colors">
                                    Navigate Here →
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ─── SOS VIEW ───
    if(view === "sos") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title="Emergency SOS" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
                    {!sosSent ? (
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-red-500/20 border-2 border-red-500/40 animate-pulse">
                                <Siren className="w-14 h-14 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-red-300">Send Emergency SOS</h2>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">This will alert NDRF rescue teams with your GPS coordinates and personal details.</p>
                            <button onClick={() => setSosSent(true)}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-xl text-lg font-bold shadow-xl shadow-red-600/30 animate-pulse hover:animate-none hover:from-red-500 hover:to-red-400 transition-all">
                                🚨 SEND SOS ALERT
                            </button>
                            <div className="space-y-2 text-left">
                                <p className="text-xs text-slate-500 font-semibold uppercase">Direct Helplines:</p>
                                {[
                                    { name: "NDRF Helpline", num: "011-24363260" },
                                    { name: "Disaster Mgmt", num: "1078" },
                                    { name: "Emergency", num: "112" },
                                ].map(h => (
                                    <a key={h.num} href={`tel:${h.num}`}
                                        className="flex items-center justify-between bg-slate-800/60 border border-slate-700/40 rounded-lg px-4 py-3 hover:border-blue-500/30 transition-colors">
                                        <span className="text-sm text-slate-300">{h.name}</span>
                                        <span className="text-sm font-mono text-blue-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {h.num}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                <Shield className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-emerald-300">SOS Alert Sent ✓</h2>
                            <p className="text-sm text-slate-400">NDRF has been notified with your GPS coordinates. Rescue team ETA: ~15 minutes.</p>
                            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-left space-y-1">
                                <p className="text-xs text-slate-500">Alert ID: <span className="font-mono text-slate-300">SOS-2026-{Math.floor(Math.random() * 9000 + 1000)}</span></p>
                                <p className="text-xs text-slate-500">Location: <span className="font-mono text-slate-300">28.6139°N, 77.2090°E</span></p>
                                <p className="text-xs text-slate-500">Status: <span className="text-emerald-400 font-semibold">Acknowledged</span></p>
                            </div>
                            <button onClick={() => { setSosSent(false); setView("home"); }}
                                className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── ALERT FAMILY VIEW ───
    if(view === "alert-family") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title="Alert Family" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {!familyAlerted ? (
                        <>
                            <p className="text-sm text-slate-400">Send your safety status and location to your emergency contacts via SMS.</p>
                            <div className="space-y-2">
                                {[
                                    { name: "Mom", phone: "+91 98765 XXXXX" },
                                    { name: "Dad", phone: "+91 98764 XXXXX" },
                                    { name: "Brother", phone: "+91 87654 XXXXX" },
                                ].map((c, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">{c.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{c.phone}</p>
                                        </div>
                                        <Users className="w-4 h-4 text-slate-600" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setFamilyAlerted(true)}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/20 hover:from-amber-500 hover:to-amber-400 transition-all">
                                📤 Send Safety Alert to All
                            </button>
                        </>
                    ) : (
                        <div className="text-center space-y-4 pt-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                <Bell className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-bold text-emerald-300">Family Alerted ✓</h2>
                            <p className="text-sm text-slate-400">SMS sent to 3 contacts with your safety status and GPS location.</p>
                            <button onClick={() => { setFamilyAlerted(false); setView("home"); }}
                                className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── STATE ANALYSIS VIEW ───
    if(view === "state-analysis") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title="State & District Analysis" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {!selectedState ? (
                        <>
                            {/* Top danger strip */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                <p className="text-xs text-red-400 font-semibold mb-2">🔴 Top 5 High-Risk Districts Nationwide</p>
                                <div className="space-y-1.5">
                                    {highRiskDistricts.map((d, i) => (
                                        <button key={i} onClick={() => { setSelectedDistrict({ ...d }); setView("district-detail"); }}
                                            className="w-full flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 text-left hover:bg-slate-800/60 transition-colors">
                                            <span className="text-xs text-slate-300">{i + 1}. {d.name}, <span className="text-slate-500">{d.stateName}</span></span>
                                            <span className="text-[10px] font-mono text-red-400 font-bold">{d.riskScore}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* All States */}
                            <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Select State</h3>
                            <div className="space-y-2">
                                {STATES_DATA.map(state => {
                                    const summary = getStateRiskSummary(state.name)!;
                                    return (
                                        <button key={state.code} onClick={() => setSelectedState(state)}
                                            className="w-full bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 text-left hover:border-blue-500/30 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-bold text-slate-200">{state.name}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${summary.avgRisk > 7 ? "bg-red-500/20 text-red-400" : summary.avgRisk > 4 ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}>
                                                    Avg: {summary.avgRisk}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 text-[10px]">
                                                <span className="text-red-400">🔴 {summary.high} High</span>
                                                <span className="text-amber-400">🟡 {summary.moderate} Moderate</span>
                                                <span className="text-green-400">🟢 {summary.low} Low</span>
                                                <span className="text-slate-500 ml-auto">{state.districts.length} districts</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* State Detail */}
                            <button onClick={() => setSelectedState(null)} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                <ArrowLeft className="w-3 h-3" /> All States
                            </button>
                            <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4">
                                <h2 className="text-lg font-bold text-white mb-1">{selectedState.name}</h2>
                                {(() => {
                                    const s = getStateRiskSummary(selectedState.name)!;
                                    return (
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                                                <div className="text-[10px] text-slate-500">Population</div>
                                                <div className="text-sm font-mono font-bold text-slate-200">{(s.totalPop / 1e6).toFixed(1)}M</div>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                                                <div className="text-[10px] text-slate-500">Avg Risk</div>
                                                <div className={`text-sm font-mono font-bold ${s.avgRisk > 7 ? "text-red-400" : s.avgRisk > 4 ? "text-amber-400" : "text-green-400"}`}>{s.avgRisk}</div>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                                                <div className="text-[10px] text-slate-500">Shelters</div>
                                                <div className="text-sm font-mono font-bold text-blue-300">{s.totalShelters}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Districts</h3>
                            <div className="space-y-2">
                                {selectedState.districts.sort((a, b) => b.riskScore - a.riskScore).map((d, i) => (
                                    <button key={i} onClick={() => { setSelectedDistrict({ ...d, stateName: selectedState.name }); setView("district-detail"); }}
                                        className="w-full bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 text-left hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-slate-200">{d.name}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-${riskColor(d.riskLevel)}-500/20 text-${riskColor(d.riskLevel)}-400`}
                                                style={{ color: d.riskLevel === "HIGH" ? "#f87171" : d.riskLevel === "MODERATE" ? "#fbbf24" : "#4ade80", backgroundColor: d.riskLevel === "HIGH" ? "rgba(248,113,113,0.15)" : d.riskLevel === "MODERATE" ? "rgba(251,191,36,0.15)" : "rgba(74,222,128,0.15)" }}>
                                                {d.riskLevel} ({d.riskScore})
                                            </span>
                                        </div>
                                        <div className="flex gap-3 text-[10px] text-slate-500">
                                            <span>🌧️ {d.rainfall}mm</span>
                                            <span>🌊 {d.waterLevel}m</span>
                                            <span>👥 {(d.population / 1e6).toFixed(1)}M</span>
                                            <span>🏠 {d.shelters} shelters</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ─── DISTRICT DETAIL VIEW ───
    if(view === "district-detail" && selectedDistrict) {
        const d = selectedDistrict;
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title={d.name} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <button onClick={() => setView("state-analysis")} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Back to States
                    </button>

                    {/* Risk Banner */}
                    <div className={`rounded-2xl border p-5 ${d.riskLevel === "HIGH" ? "bg-red-500/10 border-red-500/20" : d.riskLevel === "MODERATE" ? "bg-amber-500/10 border-amber-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-white">{d.name}</h2>
                            <span className="text-sm font-mono font-bold px-3 py-1 rounded-lg"
                                style={{ color: d.riskLevel === "HIGH" ? "#f87171" : d.riskLevel === "MODERATE" ? "#fbbf24" : "#4ade80", backgroundColor: d.riskLevel === "HIGH" ? "rgba(248,113,113,0.2)" : d.riskLevel === "MODERATE" ? "rgba(251,191,36,0.2)" : "rgba(74,222,128,0.2)" }}>
                                {d.riskLevel}
                            </span>
                        </div>
                        {d.stateName && <p className="text-xs text-slate-400 -mt-2 mb-3">{d.stateName}</p>}
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                            <div className="h-3 rounded-full transition-all" style={{ width: `${d.riskScore * 10}%`, background: d.riskLevel === "HIGH" ? "#ef4444" : d.riskLevel === "MODERATE" ? "#f59e0b" : "#22c55e" }} />
                        </div>
                        <p className="text-xs text-slate-500 text-right">Risk Score: {d.riskScore}/10</p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Rainfall", value: `${d.rainfall} mm`, icon: "🌧️", sub: "Last 24 hours" },
                            { label: "Water Level", value: `${d.waterLevel} m`, icon: "🌊", sub: "Above normal" },
                            { label: "Population", value: `${(d.population / 1e6).toFixed(2)}M`, icon: "👥", sub: "At risk" },
                            { label: "Shelters", value: `${d.shelters}`, icon: "🏠", sub: "Operational" },
                        ].map((m, i) => (
                            <div key={i} className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{m.icon}</span>
                                    <span className="text-[10px] uppercase text-slate-500 font-semibold">{m.label}</span>
                                </div>
                                <p className="text-lg font-mono font-bold text-slate-200">{m.value}</p>
                                <p className="text-[10px] text-slate-600">{m.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    {d.riskLevel === "HIGH" && (
                        <button onClick={() => setView("evacuate")}
                            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                            <Navigation className="w-4 h-4" /> Evacuate from {d.name} <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ─── MAP VIEW ───
    if(view === "map") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header title="Flood Risk Map" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 aspect-[4/3] flex items-center justify-center relative">
                            <div className="text-center space-y-3">
                                <MapPin className="w-12 h-12 text-blue-400 mx-auto animate-bounce" />
                                <p className="text-sm text-slate-400">Interactive map rendered on NDRF Dashboard</p>
                                <p className="text-xs text-slate-600">For citizens, use the State & District Analysis for detailed insights.</p>
                            </div>
                            {/* Mini risk overlay */}
                            <div className="absolute top-3 right-3 bg-slate-800/90 rounded-lg p-2 space-y-1">
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-[9px] text-slate-400">High Risk</span></div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-[9px] text-slate-400">Moderate</span></div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-[9px] text-slate-400">Low Risk</span></div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setView("state-analysis")}
                        className="w-full py-3 bg-blue-600/20 border border-blue-500/20 rounded-xl text-sm font-semibold text-blue-300 flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-colors">
                        <BarChart3 className="w-4 h-4" /> Open State & District Analysis <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // ─── HOME VIEW ───
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Header />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
                {/* Risk Status Card — LIVE DATA */}
                {loadingRisk ? (
                    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/30 p-5 flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <span className="text-sm text-slate-400">Analyzing live weather data...</span>
                    </div>
                ) : (
                    <div className={`bg-gradient-to-br rounded-2xl border p-5 ${(liveRisk?.riskLevel === 'HIGH' || liveRisk?.riskLevel === 'SEVERE') ? 'from-red-500/15 to-red-900/10 border-red-500/20' :
                            liveRisk?.riskLevel === 'MODERATE' ? 'from-amber-500/15 to-amber-900/10 border-amber-500/20' :
                                'from-green-500/15 to-green-900/10 border-green-500/20'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <span className={`absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping ${(liveRisk?.riskLevel === 'HIGH' || liveRisk?.riskLevel === 'SEVERE') ? 'bg-red-500' :
                                        liveRisk?.riskLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-green-500'
                                    }`}></span>
                                <span className={`relative inline-flex w-4 h-4 rounded-full ${(liveRisk?.riskLevel === 'HIGH' || liveRisk?.riskLevel === 'SEVERE') ? 'bg-red-500' :
                                        liveRisk?.riskLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-green-500'
                                    }`}></span>
                            </div>
                            <div>
                                <h2 className={`text-lg font-bold ${(liveRisk?.riskLevel === 'HIGH' || liveRisk?.riskLevel === 'SEVERE') ? 'text-red-300' :
                                        liveRisk?.riskLevel === 'MODERATE' ? 'text-amber-300' : 'text-green-300'
                                    }`}>
                                    {liveRisk?.riskLevel === 'SEVERE' ? '🚨 SEVERE RISK' :
                                        liveRisk?.riskLevel === 'HIGH' ? '🚨 HIGH RISK ZONE' :
                                            liveRisk?.riskLevel === 'MODERATE' ? '⚠️ MODERATE RISK' : '✅ LOW RISK'}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Live data • {liveRisk?.weather?.source || 'Open-Meteo'} • {liveRisk?.model === 'trained' ? 'ML Model' : 'AI Analysis'}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Flood probability <span className="font-bold" style={{ color: (liveRisk?.riskLevel === 'HIGH' || liveRisk?.riskLevel === 'SEVERE') ? '#f87171' : liveRisk?.riskLevel === 'MODERATE' ? '#fbbf24' : '#4ade80' }}>
                                {((liveRisk?.probability || 0) * 100).toFixed(0)}%
                            </span> in your area.
                            {liveRisk?.weather && (
                                <> Rain: {liveRisk.weather.rainfall_24h}mm/24h · Temp: {liveRisk.weather.temperature}°C</>
                            )}
                        </p>
                        {liveRisk?.recommendation && (
                            <p className="text-xs text-slate-400 mt-2 italic">💡 {liveRisk.recommendation}</p>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setView("evacuate")} className="bg-blue-600/20 border border-blue-500/20 rounded-xl p-4 text-center hover:bg-blue-600/30 transition-colors group">
                        <Navigation className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:animate-bounce" />
                        <span className="text-sm font-semibold text-blue-300">Evacuate Now</span>
                        <p className="text-[10px] text-slate-500 mt-1">Nearest safe route</p>
                    </button>
                    <button onClick={() => setView("shelters")} className="bg-emerald-600/20 border border-emerald-500/20 rounded-xl p-4 text-center hover:bg-emerald-600/30 transition-colors group">
                        <MapPin className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:animate-bounce" />
                        <span className="text-sm font-semibold text-emerald-300">Find Shelter</span>
                        <p className="text-[10px] text-slate-500 mt-1">4 shelters nearby</p>
                    </button>
                    <button onClick={() => setView("sos")} className="bg-purple-600/20 border border-purple-500/20 rounded-xl p-4 text-center hover:bg-purple-600/30 transition-colors group">
                        <Phone className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:animate-bounce" />
                        <span className="text-sm font-semibold text-purple-300">SOS Call</span>
                        <p className="text-[10px] text-slate-500 mt-1">NDRF Helpline</p>
                    </button>
                    <button onClick={() => setView("alert-family")} className="bg-amber-600/20 border border-amber-500/20 rounded-xl p-4 text-center hover:bg-amber-600/30 transition-colors group">
                        <Bell className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:animate-bounce" />
                        <span className="text-sm font-semibold text-amber-300">Alert Family</span>
                        <p className="text-[10px] text-slate-500 mt-1">Share your status</p>
                    </button>
                </div>

                {/* State Analysis Button */}
                <button onClick={() => setView("state-analysis")}
                    className="w-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-4 hover:from-indigo-600/30 hover:to-purple-600/30 transition-colors">
                    <BarChart3 className="w-8 h-8 text-indigo-400" />
                    <div className="text-left flex-1">
                        <span className="text-sm font-bold text-indigo-300">State & District Analysis</span>
                        <p className="text-[10px] text-slate-500">10 states · 40+ districts · Live risk data</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>

                {/* Alert History */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" /> Recent Alerts
                        </h3>
                    </div>
                    <div className="space-y-2.5">
                        {alertItems.map((alert, i) => (
                            <div key={i} className={`bg-slate-900/60 rounded-xl border p-4 ${alert.color === "red" ? "border-red-500/20" : alert.color === "amber" ? "border-amber-500/20" : "border-green-500/20"}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${alert.color === "red" ? "bg-red-500/20 text-red-400" : alert.color === "amber" ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}>{alert.severity}</span>
                                    <span className="text-[10px] text-slate-600">{alert.time}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{alert.msg}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mesh Network Status */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-slate-400 uppercase">Mesh Network</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-mono">ONLINE • 7 peers</span>
                        </div>
                    </div>
                </div>

                {/* Map CTA */}
                <button onClick={() => setView("map")}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl py-3.5 text-sm font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-400 transition-all">
                    🗺️ Open Full Map View <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
