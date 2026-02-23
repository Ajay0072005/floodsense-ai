import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const AI_CORTEX_URL = process.env.AI_CORTEX_URL || 'http://localhost:8000';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

// In-memory OTP store (key: phone, value: { otp, expiresAt })
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// ─── Health ─────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'FloodSense Core API v2.0', ai_cortex: AI_CORTEX_URL, sms: FAST2SMS_API_KEY ? 'configured' : 'not configured' });
});

// ─── OTP Send (Real SMS via Fast2SMS) ───────────────
app.post('/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if(!phone || phone.length < 10) {
        return res.status(400).json({ status: 'error', message: 'Invalid phone number' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const cleanPhone = phone.replace(/\D/g, '').slice(-10); // Last 10 digits

    // Store OTP with 5-minute expiry
    otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Clean up expired OTPs
    for(const [key, val] of otpStore.entries()) {
        if(val.expiresAt < Date.now()) otpStore.delete(key);
    }

    if(!FAST2SMS_API_KEY) {
        // No API key — return OTP in response for testing
        console.log(`[OTP] No Fast2SMS key. OTP for ${cleanPhone}: ${otp}`);
        return res.json({ status: 'success', message: 'OTP generated (demo mode - no SMS key configured)', demo_otp: otp });
    }

    // Send via Fast2SMS
    try {
        const smsResp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': FAST2SMS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route: 'otp',
                variables_values: otp,
                numbers: cleanPhone,
                flash: 0,
            }),
        });

        const smsData: any = await smsResp.json();

        if(smsData.return === true) {
            console.log(`[OTP] SMS sent to ${cleanPhone} via Fast2SMS`);
            return res.json({ status: 'success', message: `OTP sent to +91 ${cleanPhone}` });
        } else {
            console.error(`[OTP] Fast2SMS error:`, smsData);
            // Fallback: return OTP in response
            return res.json({ status: 'success', message: 'SMS delivery failed, showing OTP', demo_otp: otp });
        }
    } catch(err) {
        console.error(`[OTP] SMS send error:`, err);
        return res.json({ status: 'success', message: 'SMS service error, showing OTP', demo_otp: otp });
    }
});

// ─── OTP Verify ─────────────────────────────────────
app.post('/auth/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    if(!phone || !otp) {
        return res.status(400).json({ status: 'error', message: 'Phone and OTP required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(cleanPhone);

    if(!stored) {
        return res.status(400).json({ status: 'error', message: 'No OTP found. Please request a new one.' });
    }

    if(stored.expiresAt < Date.now()) {
        otpStore.delete(cleanPhone);
        return res.status(400).json({ status: 'error', message: 'OTP expired. Please request a new one.' });
    }

    if(stored.otp !== otp) {
        return res.status(400).json({ status: 'error', message: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — remove from store
    otpStore.delete(cleanPhone);
    const token = Buffer.from(cleanPhone + Date.now()).toString('base64');
    return res.json({ status: 'success', message: 'OTP verified', token, user: { phone: cleanPhone } });
});

// ─── Auth (keep existing) ───────────────────────────
app.post('/auth/signup', (req, res) => {
    const { phone, fullName, state, district } = req.body;
    const token = Buffer.from(phone + Date.now()).toString('base64');
    res.json({ status: 'success', token, user: { phone, fullName, state, district, role: 'CITIZEN' } });
});

app.post('/auth/login', (req, res) => {
    const { phone } = req.body;
    const token = Buffer.from(phone + Date.now()).toString('base64');
    res.json({ status: 'success', token, user: { phone, role: 'CITIZEN' } });
});

// ─── Risk Prediction (proxies to AI Cortex) ─────────
app.post('/risk/calculate', async (req, res) => {
    const { lat, lon, districtId, district_name, state_name, rainfall, soilMoisture, elevation } = req.body;

    const predLat = lat || 28.61;
    const predLon = lon || 77.22;

    try {
        const response = await fetch(`${AI_CORTEX_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat: predLat,
                lon: predLon,
                district_name: district_name || districtId,
                state_name: state_name,
            }),
        });

        if(!response.ok) throw new Error(`AI Cortex returned ${response.status}`);

        const data: any = await response.json();

        // Emit real-time update to subscribed clients
        if(districtId) {
            io.to(`district_${districtId}`).emit('risk_update', {
                districtId,
                ...data.risk,
                timestamp: new Date(),
            });
        }

        res.json({
            status: 'calculated',
            riskScore: data.risk.risk_score,
            riskLevel: data.risk.risk_level,
            probability: data.risk.probability,
            contributing_factors: data.risk.contributing_factors,
            recommendation: data.risk.recommendation,
            weather: data.weather,
            discharge: data.discharge,
            alerts: data.alerts,
            model: data.risk.model,
        });
    } catch(error: any) {
        console.error('AI Cortex proxy error:', error.message);
        // Fallback: direct Open-Meteo call
        try {
            const weatherResp = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${predLat}&longitude=${predLon}&current=precipitation,rain,temperature_2m&timezone=Asia/Kolkata`
            );
            const weatherData: any = await weatherResp.json();
            const current = weatherData.current || {};
            const rain = current.precipitation || 0;
            const riskScore = Math.min(10, rain * 0.5 + (rainfall || 0) * 0.3);
            const riskLevel = riskScore > 7 ? 'HIGH' : riskScore > 4 ? 'MODERATE' : 'LOW';

            res.json({
                status: 'calculated',
                riskScore: Math.round(riskScore * 10) / 10,
                riskLevel,
                weather: { current_precipitation: rain, temperature: current.temperature_2m },
                source: 'fallback-direct',
            });
        } catch(fallbackErr: any) {
            res.status(500).json({ status: 'error', message: fallbackErr.message });
        }
    }
});

// ─── Weather Endpoint ───────────────────────────────
app.get('/api/weather/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/weather?lat=${lat}&lon=${lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch(error: any) {
        // Direct fallback to Open-Meteo
        try {
            const resp = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,temperature_2m,relative_humidity_2m&timezone=Asia/Kolkata`
            );
            const weatherData: any = await resp.json();
            res.json({ status: 'success', data: weatherData.current, source: 'direct' });
        } catch(e: any) {
            res.status(500).json({ status: 'error', message: e.message });
        }
    }
});

// ─── Alerts Endpoint ────────────────────────────────
app.get('/api/alerts/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/alerts?lat=${lat}&lon=${lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch(error: any) {
        res.json({ status: 'success', alerts: [{ severity: 'LOW', title: 'Service temporarily unavailable', message: 'Alert service is restarting.' }] });
    }
});

// ─── Discharge Endpoint ─────────────────────────────
app.get('/api/discharge/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/discharge?lat=${lat}&lon=${lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch(error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Bulk Predict (for map) ─────────────────────────
app.post('/api/predict/bulk', async (req, res) => {
    const { locations } = req.body;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/predict/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locations }),
        });
        const data: any = await response.json();
        res.json(data);
    } catch(error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Socket.IO ──────────────────────────────────────
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe_telemetry', (districtId) => {
        socket.join(`district_${districtId}`);
        console.log(`Socket ${socket.id} joined district_${districtId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`FloodSense API Server v2.0 running on port ${PORT}`);
    console.log(`AI Cortex: ${AI_CORTEX_URL}`);
});
