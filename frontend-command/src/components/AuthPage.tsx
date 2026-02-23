"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Shield, ChevronRight, Siren, Users, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export type UserRole = "citizen" | "authority";

interface AuthFormProps { onLogin: (role: UserRole) => void; }

const NDRF_BATTALIONS = [
    "1 NDRF Bn, Guwahati", "2 NDRF Bn, Kolkata", "3 NDRF Bn, Mundali",
    "4 NDRF Bn, Arakkonam", "5 NDRF Bn, Pune", "6 NDRF Bn, Vadodara",
    "7 NDRF Bn, Bhatinda", "8 NDRF Bn, Ghaziabad", "9 NDRF Bn, Patna",
    "10 NDRF Bn, Vijayawada", "11 NDRF Bn, Varanasi", "12 NDRF Bn, Itanagar",
];

export default function AuthPage({ onLogin }: AuthFormProps) {
    const [role, setRole] = useState<UserRole | null>(null);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    // Authority fields
    const [serviceId, setServiceId] = useState("");
    const [battalion, setBattalion] = useState("");

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend countdown
    useEffect(() => {
        if(resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    const handleSendOtp = () => {
        if(phone.length < 10) return;
        setLoading(true);
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedOtp(code);
        // Simulate OTP send delay
        setTimeout(() => {
            setOtpSent(true);
            setResendTimer(30);
            setLoading(false);
            setVerifyError("");
            // Show OTP in console for testing
            console.log(`[FloodSense OTP] Code sent to +91 ${phone}: ${code}`);
        }, 1500);
    };

    const handleOtpChange = (index: number, value: string) => {
        if(value.length > 1) value = value.slice(-1);
        if(value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setVerifyError("");
        // Auto-focus next
        if(value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if(e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if(pasted.length === 6) {
            setOtp(pasted.split(""));
            otpRefs.current[5]?.focus();
            e.preventDefault();
        }
    };

    const handleVerifyOtp = () => {
        const entered = otp.join("");
        if(entered.length < 6) { setVerifyError("Enter all 6 digits"); return; }
        setLoading(true);
        setTimeout(() => {
            if(entered === generatedOtp) {
                setOtpVerified(true);
                setLoading(false);
            } else {
                setVerifyError("Invalid OTP. Please try again.");
                setLoading(false);
            }
        }, 1000);
    };

    const handleLogin = () => {
        if(!role) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); onLogin(role); }, 800);
    };

    const GovHeader = () => (
        <div className="w-full">
            <div className="flex h-1.5"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
            <div className="bg-[#1a237e] text-white px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">🏛️</div>
                        <div><h1 className="text-sm md:text-base font-bold tracking-wide">FloodSense AI</h1><p className="text-[10px] md:text-xs text-blue-200">National Disaster Response Force · Ministry of Home Affairs</p></div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-blue-200"><span>भारत सरकार</span><span className="text-white/30">|</span><span>Government of India</span></div>
                </div>
            </div>
            <div className="bg-[#283593] text-white/80 px-4 py-1.5 text-[10px] tracking-wide">
                <div className="max-w-5xl mx-auto flex items-center justify-between"><span>AI-Enabled Real-Time Flash Flood Forecasting & Alert System</span><span className="hidden sm:inline">🔒 Secured Portal</span></div>
            </div>
        </div>
    );

    // ─── STEP 1: ROLE SELECTION ───
    if(!role) return (
        <div className="min-h-screen w-full flex flex-col bg-[#f5f5f0]"><GovHeader />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    <div className="bg-[#fff3cd] border border-[#ffc107] rounded px-4 py-3 mb-6 text-sm text-[#856404]">
                        <strong>Notice:</strong> This portal is for flood risk monitoring and disaster response. Select your role to proceed.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => setRole("citizen")} className="group bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-[#1a237e] hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-[#1a237e]/10"><Users className="w-6 h-6 text-[#1a237e]" /></div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Citizen Portal</h2>
                            <p className="text-xs text-gray-500 mb-4">Access flood alerts, evacuation routes, and report incidents for your area.</p>
                            <div className="flex items-center gap-1 text-xs text-[#1a237e] font-bold group-hover:gap-2 transition-all">Continue <ChevronRight className="w-4 h-4" /></div>
                        </button>
                        <button onClick={() => setRole("authority")} className="group bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-[#1a237e] hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100"><Siren className="w-6 h-6 text-red-600" /></div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">NDRF Authority</h2>
                            <p className="text-xs text-gray-500 mb-4">Command station for disaster response coordination and monitoring.</p>
                            <div className="flex items-center gap-1 text-xs text-red-600 font-bold group-hover:gap-2 transition-all">Continue <ChevronRight className="w-4 h-4" /></div>
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-6">© 2024 National Disaster Response Force · Government of India</p>
                </div>
            </div>
        </div>
    );

    // ─── STEP 2: PHONE + OTP ───
    if(!otpVerified) return (
        <div className="min-h-screen w-full flex flex-col bg-[#f5f5f0]"><GovHeader />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <button onClick={() => { setRole(null); setOtpSent(false); setOtp(["", "", "", "", "", ""]); setPhone(""); }}
                        className="text-sm text-[#1a237e] font-bold mb-4 flex items-center gap-1 hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#1a237e] px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold">{role === "citizen" ? "Citizen Login" : "Authority Login"}</h2>
                                    <p className="text-[10px] text-blue-200">Verify via mobile OTP</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Phone Input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Mobile Number</label>
                                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-[#1a237e]">
                                    <div className="bg-gray-50 px-3 py-2.5 border-r border-gray-200 text-sm text-gray-600 font-mono">+91</div>
                                    <input type="tel" maxLength={10} value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                                        placeholder="Enter 10-digit number"
                                        disabled={otpSent}
                                        className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-transparent disabled:text-gray-400" />
                                </div>
                            </div>

                            {!otpSent ? (
                                <button onClick={handleSendOtp} disabled={phone.length < 10 || loading}
                                    className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#283593] disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : "Send OTP →"}
                                </button>
                            ) : (
                                <>
                                    {/* OTP Sent Notice */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-xs text-green-700">OTP sent to <strong>+91 {phone}</strong></span>
                                    </div>
                                    {/* Show simulated OTP visibly */}
                                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg px-4 py-3 text-center">
                                        <p className="text-[10px] text-yellow-700 font-bold uppercase tracking-wide mb-1">📩 Simulated SMS (Demo Mode)</p>
                                        <p className="text-2xl font-black tracking-[0.3em] text-[#1a237e]">{generatedOtp}</p>
                                        <p className="text-[9px] text-yellow-600 mt-1">In production, this would be sent via SMS gateway</p>
                                    </div>

                                    {/* 6-digit OTP Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Enter 6-digit OTP</label>
                                        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                            {otp.map((digit, i) => (
                                                <input key={i} ref={el => { otpRefs.current[i] = el; }}
                                                    type="text" inputMode="numeric" maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                                    className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-colors ${digit ? "border-[#1a237e] text-[#1a237e] bg-blue-50" : "border-gray-200 text-gray-800"
                                                        } focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e]/30`}
                                                />
                                            ))}
                                        </div>
                                        {verifyError && <p className="text-xs text-red-600 text-center mt-2">{verifyError}</p>}
                                    </div>

                                    {/* Verify Button */}
                                    <button onClick={handleVerifyOtp} disabled={otp.join("").length < 6 || loading}
                                        className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#283593] disabled:opacity-50 flex items-center justify-center gap-2">
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><Shield className="w-4 h-4" /> Verify OTP</>}
                                    </button>

                                    {/* Resend */}
                                    <div className="text-center">
                                        {resendTimer > 0 ? (
                                            <p className="text-xs text-gray-400">Resend OTP in <span className="font-bold text-gray-600">{resendTimer}s</span></p>
                                        ) : (
                                            <button onClick={() => { setOtp(["", "", "", "", "", ""]); handleSendOtp(); }}
                                                className="text-xs text-[#1a237e] font-bold hover:underline">Resend OTP</button>
                                        )}
                                    </div>

                                    {/* Change number */}
                                    <button onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); setVerifyError(""); }}
                                        className="w-full text-xs text-gray-500 hover:text-[#1a237e]">← Change phone number</button>
                                </>
                            )}

                            <p className="text-[10px] text-gray-400 text-center">
                                OTP is logged to browser console for testing.<br />
                                In production, SMS sent via Govt. SMS Gateway (NIC/CDAC).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── STEP 3: AUTHORITY → Service ID (citizen goes straight to login) ───
    if(role === "authority" && !serviceId) return (
        <div className="min-h-screen w-full flex flex-col bg-[#f5f5f0]"><GovHeader />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-[#1a237e] px-6 py-4 text-white">
                            <h2 className="text-base font-bold">NDRF Authority Details</h2>
                            <p className="text-[10px] text-blue-200">Verified: +91 {phone}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Service ID</label>
                                <input type="text" value={serviceId} onChange={e => setServiceId(e.target.value)}
                                    placeholder="e.g. NDRF-2024-0042" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-800 focus:border-[#1a237e] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Battalion</label>
                                <select value={battalion} onChange={e => setBattalion(e.target.value)}
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-800 focus:border-[#1a237e] outline-none">
                                    <option value="">Select battalion</option>
                                    {NDRF_BATTALIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <button onClick={handleLogin} disabled={!serviceId || !battalion || loading}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#283593] disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</> : "Access Command Station →"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── STEP 3: CITIZEN → straight to dashboard (auto-login after OTP) ───
    if(role === "citizen") {
        // Auto proceed
        if(!loading) { setLoading(true); setTimeout(() => onLogin("citizen"), 600); }
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f0]">
                <Loader2 className="w-8 h-8 text-[#1a237e] animate-spin mb-3" />
                <p className="text-sm text-gray-500">Setting up your dashboard...</p>
            </div>
        );
    }

    // Authority auto-proceed after service ID
    if(!loading) { setLoading(true); setTimeout(() => onLogin("authority"), 600); }
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f0]">
            <Loader2 className="w-8 h-8 text-[#1a237e] animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading NDRF Command Station...</p>
        </div>
    );
}
