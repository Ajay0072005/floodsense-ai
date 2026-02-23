import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const prisma = new PrismaClient();

// ─── Config ─────────────────────────────────────────
const AI_CORTEX_URL = process.env.AI_CORTEX_URL || 'http://localhost:8000';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'floodsense-ai-secret-2026';
const PORT = process.env.PORT || 4000;

// ─── Security Middleware ────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Rate limiters
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { status: 'error', message: 'Too many requests. Try again in 15 minutes.' } });
const otpLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 5, message: { status: 'error', message: 'Too many OTP requests. Wait 5 minutes.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { status: 'error', message: 'Too many auth attempts.' } });

app.use(globalLimiter);

// ─── Helpers ────────────────────────────────────────
function generateToken(userId: string, phone: string, role: string): string {
    return jwt.sign({ userId, phone, role }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): { userId: string; phone: string; role: string } | null {
    try { return jwt.verify(token, JWT_SECRET) as any; } catch { return null; }
}

// Auth middleware
function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Authentication required. Provide Bearer token.' });
    }
    const decoded = verifyToken(authHeader.slice(7));
    if(!decoded) return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    req.user = decoded;
    next();
}

// Input validation helpers
function validateLatLon(lat: any, lon: any): boolean {
    return typeof lat === 'number' && typeof lon === 'number' && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function validatePhone(phone: string): boolean {
    return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
}

// In-memory OTP store (key: phone, value: { otp, expiresAt, attempts })
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// ─── Health ─────────────────────────────────────────
app.get('/health', async (_req, res) => {
    let dbStatus = 'disconnected';
    try { await prisma.$queryRaw`SELECT 1`; dbStatus = 'connected'; } catch { }
    res.json({
        status: 'ok',
        service: 'FloodSense Core API v3.0',
        ai_cortex: AI_CORTEX_URL,
        database: dbStatus,
        sms: FAST2SMS_API_KEY ? 'configured' : 'demo-mode',
        uptime: Math.floor(process.uptime()) + 's',
    });
});

// ═══════════════════════════════════════════════════
// ─── AUTHENTICATION ─────────────────────────────────
// ═══════════════════════════════════════════════════

// Send OTP (rate limited: 5 per 5 min)
app.post('/auth/send-otp', otpLimiter, async (req, res) => {
    const { phone } = req.body;
    if(!phone || !validatePhone(phone)) {
        return res.status(400).json({ status: 'error', message: 'Invalid phone number. Must be 10+ digits.' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });

    // Clean expired entries
    for(const [key, val] of otpStore.entries()) {
        if(val.expiresAt < Date.now()) otpStore.delete(key);
    }

    if(!FAST2SMS_API_KEY) {
        console.log(`[OTP] Demo mode. OTP for ${cleanPhone}: ${otp}`);
        return res.json({ status: 'success', message: 'OTP generated (demo mode)', demo_otp: otp });
    }

    try {
        const smsResp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { 'authorization': FAST2SMS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: cleanPhone, flash: 0 }),
        });
        const smsData: any = await smsResp.json();
        if(smsData.return === true) {
            return res.json({ status: 'success', message: `OTP sent to +91 ${cleanPhone}` });
        }
        return res.json({ status: 'success', message: 'SMS delivery failed', demo_otp: otp });
    } catch {
        return res.json({ status: 'success', message: 'SMS service error', demo_otp: otp });
    }
});

// Verify OTP + create/login user + return JWT
app.post('/auth/verify-otp', authLimiter, async (req, res) => {
    const { phone, otp, fullName, state, district, role } = req.body;
    if(!phone || !otp) return res.status(400).json({ status: 'error', message: 'Phone and OTP required.' });

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(cleanPhone);

    if(!stored) return res.status(400).json({ status: 'error', message: 'No OTP found. Request a new one.' });
    if(stored.expiresAt < Date.now()) { otpStore.delete(cleanPhone); return res.status(400).json({ status: 'error', message: 'OTP expired.' }); }
    if(stored.attempts >= 3) { otpStore.delete(cleanPhone); return res.status(400).json({ status: 'error', message: 'Too many failed attempts. Request a new OTP.' }); }
    if(stored.otp !== otp) { stored.attempts++; return res.status(400).json({ status: 'error', message: 'Invalid OTP.' }); }

    otpStore.delete(cleanPhone);

    // Upsert user in database
    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if(!user) {
        user = await prisma.user.create({
            data: { phone: cleanPhone, fullName: fullName || null, state: state || null, district: district || null, role: role || 'CITIZEN' },
        });
    } else if(fullName || state || district) {
        user = await prisma.user.update({
            where: { phone: cleanPhone },
            data: { ...(fullName && { fullName }), ...(state && { state }), ...(district && { district }) },
        });
    }

    const token = generateToken(user.id, cleanPhone, user.role);
    return res.json({ status: 'success', message: 'OTP verified', token, user: { id: user.id, phone: user.phone, fullName: user.fullName, state: user.state, district: user.district, role: user.role } });
});

// Get current user profile
app.get('/auth/me', authMiddleware, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { reports: { take: 10, orderBy: { createdAt: 'desc' } }, alerts: { take: 10, orderBy: { createdAt: 'desc' } } } });
    if(!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
    res.json({ status: 'success', user });
});

// Legacy auth (backward compatibility)
app.post('/auth/signup', async (req, res) => {
    const { phone, fullName, state, district } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if(!cleanPhone) return res.status(400).json({ status: 'error', message: 'Phone required.' });

    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if(!user) {
        user = await prisma.user.create({ data: { phone: cleanPhone, fullName, state, district } });
    }
    const token = generateToken(user.id, cleanPhone, user.role);
    res.json({ status: 'success', token, user: { id: user.id, phone: user.phone, fullName: user.fullName, role: user.role } });
});

app.post('/auth/login', async (req, res) => {
    const { phone } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if(!cleanPhone) return res.status(400).json({ status: 'error', message: 'Phone required.' });

    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if(!user) user = await prisma.user.create({ data: { phone: cleanPhone } });
    const token = generateToken(user.id, cleanPhone, user.role);
    res.json({ status: 'success', token, user: { id: user.id, phone: user.phone, role: user.role } });
});

// ═══════════════════════════════════════════════════
// ─── RISK PREDICTION ────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/risk/calculate', async (req, res) => {
    const { lat, lon, districtId, district_name, state_name, rainfall, soilMoisture, elevation } = req.body;
    const predLat = typeof lat === 'number' ? lat : 28.61;
    const predLon = typeof lon === 'number' ? lon : 77.22;

    if(!validateLatLon(predLat, predLon)) {
        return res.status(400).json({ status: 'error', message: 'Invalid lat/lon. Lat: -90 to 90, Lon: -180 to 180.' });
    }

    try {
        const response = await fetch(`${AI_CORTEX_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: predLat, lon: predLon, district_name: district_name || districtId, state_name }),
        });
        if(!response.ok) throw new Error(`AI Cortex returned ${response.status}`);
        const data: any = await response.json();

        // Log prediction to database
        try {
            await prisma.predictionLog.create({
                data: {
                    lat: predLat, lon: predLon,
                    riskLevel: data.risk.risk_level,
                    riskScore: data.risk.risk_score,
                    probability: data.risk.probability,
                    model: data.risk.model || 'xgboost',
                    weather: JSON.stringify(data.weather || {}),
                },
            });
        } catch { } // Don't fail request if logging fails

        // Emit real-time update
        if(districtId) {
            io.to(`district_${districtId}`).emit('risk_update', { districtId, ...data.risk, timestamp: new Date() });
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
        console.error('[RISK] AI Cortex error:', error.message);
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

            res.json({ status: 'calculated', riskScore: Math.round(riskScore * 10) / 10, riskLevel, weather: { current_precipitation: rain, temperature: current.temperature_2m }, source: 'fallback-direct' });
        } catch(fallbackErr: any) {
            res.status(500).json({ status: 'error', message: 'All prediction services unavailable.' });
        }
    }
});

// ═══════════════════════════════════════════════════
// ─── CITIZEN REPORTS ────────────────────────────────
// ═══════════════════════════════════════════════════

// Submit a report (authenticated)
app.post('/api/reports', authMiddleware, async (req: any, res) => {
    const { reportType, description, lat, lon, photoUrl, severity } = req.body;

    if(!reportType || !description) return res.status(400).json({ status: 'error', message: 'reportType and description required.' });
    if(!validateLatLon(lat, lon)) return res.status(400).json({ status: 'error', message: 'Valid lat/lon required.' });

    const validTypes = ['FLOOD', 'DRAIN_BLOCK', 'ROAD_BLOCK', 'RESCUE_NEEDED', 'DAM_OVERFLOW', 'LANDSLIDE', 'OTHER'];
    if(!validTypes.includes(reportType)) return res.status(400).json({ status: 'error', message: `reportType must be one of: ${validTypes.join(', ')}` });

    const report = await prisma.citizenReport.create({
        data: { userId: req.user.userId, reportType, description, lat, lon, photoUrl: photoUrl || null, severity: severity || 'MODERATE' },
    });

    // Broadcast to nearby authorities
    io.emit('new_report', { report, timestamp: new Date() });
    res.status(201).json({ status: 'success', report });
});

// Get all reports (public, paginated)
app.get('/api/reports', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;

    const where: any = {};
    if(status) where.status = status;

    const [reports, total] = await Promise.all([
        prisma.citizenReport.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { fullName: true, district: true, state: true } } } }),
        prisma.citizenReport.count({ where }),
    ]);
    res.json({ status: 'success', reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// Upvote a report
app.post('/api/reports/:id/upvote', authMiddleware, async (req: any, res) => {
    try {
        const report = await prisma.citizenReport.update({ where: { id: req.params.id }, data: { upvotes: { increment: 1 } } });
        res.json({ status: 'success', upvotes: report.upvotes });
    } catch { res.status(404).json({ status: 'error', message: 'Report not found.' }); }
});

// Update report status (authority only)
app.patch('/api/reports/:id/status', authMiddleware, async (req: any, res) => {
    if(req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'Authority access required.' });
    const { status: newStatus } = req.body;
    if(!['PENDING', 'ACKNOWLEDGED', 'RESOLVED'].includes(newStatus)) return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    try {
        const report = await prisma.citizenReport.update({ where: { id: req.params.id }, data: { status: newStatus } });
        io.emit('report_status_update', { report });
        res.json({ status: 'success', report });
    } catch { res.status(404).json({ status: 'error', message: 'Report not found.' }); }
});

// ═══════════════════════════════════════════════════
// ─── ALERTS ─────────────────────────────────────────
// ═══════════════════════════════════════════════════

// Create alert (authority)
app.post('/api/alerts', authMiddleware, async (req: any, res) => {
    if(req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'Authority access required.' });
    const { message, severity, alertType, lat, lon, userIds } = req.body;
    if(!message || !severity) return res.status(400).json({ status: 'error', message: 'message and severity required.' });

    // If userIds provided, create targeted alerts; else broadcast
    if(userIds && Array.isArray(userIds)) {
        const alerts = await Promise.all(userIds.map((uid: string) =>
            prisma.alert.create({ data: { userId: uid, message, severity, alertType: alertType || 'GENERAL', lat, lon } })
        ));
        io.emit('new_alert', { alerts, broadcast: false });
        return res.status(201).json({ status: 'success', alerts });
    }

    // Broadcast to all users
    const users = await prisma.user.findMany({ select: { id: true } });
    const alerts = await Promise.all(users.map(u =>
        prisma.alert.create({ data: { userId: u.id, message, severity, alertType: alertType || 'BROADCAST', lat, lon } })
    ));
    io.emit('new_alert', { message, severity, alertType, broadcast: true, timestamp: new Date() });
    res.status(201).json({ status: 'success', count: alerts.length });
});

// Get alerts for a location (from AI Cortex)
app.get('/api/alerts/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/alerts?lat=${lat}&lon=${lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch {
        res.json({ status: 'success', alerts: [{ severity: 'LOW', title: 'Service temporarily unavailable' }] });
    }
});

// Get user's alerts
app.get('/api/my-alerts', authMiddleware, async (req: any, res) => {
    const alerts = await prisma.alert.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ status: 'success', alerts });
});

// ═══════════════════════════════════════════════════
// ─── WEATHER & DISCHARGE ────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/weather/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/weather?lat=${lat}&lon=${lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch {
        try {
            const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,temperature_2m,relative_humidity_2m&timezone=Asia/Kolkata`);
            const weatherData: any = await resp.json();
            res.json({ status: 'success', data: weatherData.current, source: 'direct' });
        } catch(e: any) { res.status(500).json({ status: 'error', message: e.message }); }
    }
});

app.get('/api/discharge/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    try {
        const response = await fetch(`${AI_CORTEX_URL}/discharge?lat=${lat}&lon=${lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch(e: any) { res.status(500).json({ status: 'error', message: e.message }); }
});

// ═══════════════════════════════════════════════════
// ─── ANALYTICS ──────────────────────────────────────
// ═══════════════════════════════════════════════════

// Prediction history
app.get('/api/analytics/predictions', async (req, res) => {
    const days = Math.min(30, parseInt(req.query.days as string) || 7);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const predictions = await prisma.predictionLog.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 500,
    });

    // Aggregate stats
    const total = predictions.length;
    const severe = predictions.filter(p => p.riskLevel === 'SEVERE').length;
    const high = predictions.filter(p => p.riskLevel === 'HIGH').length;
    const moderate = predictions.filter(p => p.riskLevel === 'MODERATE').length;
    const avgScore = total ? predictions.reduce((s, p) => s + p.riskScore, 0) / total : 0;

    res.json({
        status: 'success',
        period: `${days}d`,
        stats: { total, severe, high, moderate, low: total - severe - high - moderate, avgRiskScore: Math.round(avgScore * 100) / 100 },
        predictions: predictions.slice(0, 100),
    });
});

// Report analytics
app.get('/api/analytics/reports', async (req, res) => {
    const [total, pending, acknowledged, resolved, byType] = await Promise.all([
        prisma.citizenReport.count(),
        prisma.citizenReport.count({ where: { status: 'PENDING' } }),
        prisma.citizenReport.count({ where: { status: 'ACKNOWLEDGED' } }),
        prisma.citizenReport.count({ where: { status: 'RESOLVED' } }),
        prisma.citizenReport.groupBy({ by: ['reportType'], _count: true }),
    ]);
    res.json({ status: 'success', stats: { total, pending, acknowledged, resolved, byType } });
});

// User stats
app.get('/api/analytics/users', async (req, res) => {
    const [total, citizens, authorities] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CITIZEN' } }),
        prisma.user.count({ where: { role: 'AUTHORITY' } }),
    ]);
    res.json({ status: 'success', stats: { total, citizens, authorities } });
});

// ═══════════════════════════════════════════════════
// ─── ZONES ──────────────────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/zones', async (_req, res) => {
    const zones = await prisma.riskZone.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json({ status: 'success', zones });
});

app.post('/api/zones', authMiddleware, async (req: any, res) => {
    if(req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'Authority access required.' });
    const { zoneName, riskLevel, centroidLat, centroidLng, geoJsonData } = req.body;
    if(!zoneName || !centroidLat || !centroidLng) return res.status(400).json({ status: 'error', message: 'zoneName, centroidLat, centroidLng required.' });
    const zone = await prisma.riskZone.create({ data: { zoneName, riskLevel: riskLevel || 'LOW', centroidLat, centroidLng, geoJsonData } });
    res.status(201).json({ status: 'success', zone });
});

// ═══════════════════════════════════════════════════
// ─── TELEMETRY ──────────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/telemetry', async (req, res) => {
    const { sensorId, sensorType, readingValue, lat, lng } = req.body;
    if(!sensorId || !sensorType || readingValue == null) return res.status(400).json({ status: 'error', message: 'sensorId, sensorType, readingValue required.' });

    const telemetry = await prisma.telemetry.create({ data: { sensorId, sensorType, readingValue, lat: lat || 0, lng: lng || 0 } });
    io.emit('telemetry_update', { telemetry });
    res.status(201).json({ status: 'success', telemetry });
});

app.get('/api/telemetry', async (req, res) => {
    const sensorType = req.query.type as string;
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const where: any = {};
    if(sensorType) where.sensorType = sensorType;
    const readings = await prisma.telemetry.findMany({ where, orderBy: { recordedAt: 'desc' }, take: limit });
    res.json({ status: 'success', readings });
});

// ═══════════════════════════════════════════════════
// ─── BULK PREDICT ───────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/predict/bulk', async (req, res) => {
    const { locations } = req.body;
    if(!Array.isArray(locations) || locations.length > 50) return res.status(400).json({ status: 'error', message: 'Provide 1-50 locations.' });
    try {
        const response = await fetch(`${AI_CORTEX_URL}/predict/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locations }) });
        const data: any = await response.json();
        res.json(data);
    } catch(e: any) { res.status(500).json({ status: 'error', message: e.message }); }
});

// ═══════════════════════════════════════════════════
// ─── SOCKET.IO ──────────────────────────────────────
// ═══════════════════════════════════════════════════

io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    socket.on('subscribe_telemetry', (districtId) => {
        socket.join(`district_${districtId}`);
        console.log(`[WS] ${socket.id} joined district_${districtId}`);
    });

    socket.on('subscribe_reports', () => {
        socket.join('reports_feed');
        console.log(`[WS] ${socket.id} joined reports_feed`);
    });

    socket.on('disconnect', () => {
        console.log(`[WS] Client disconnected: ${socket.id}`);
    });
});

// ═══════════════════════════════════════════════════
// ─── ERROR HANDLER ──────────────────────────────────
// ═══════════════════════════════════════════════════

app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[ERROR]', err.stack || err.message);
    res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal server error.' });
});

// ─── START ──────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`╔══════════════════════════════════════════╗`);
    console.log(`║  FloodSense API Server v3.0              ║`);
    console.log(`║  Port: ${PORT}                              ║`);
    console.log(`║  AI Cortex: ${AI_CORTEX_URL.slice(0, 28).padEnd(28)}║`);
    console.log(`║  Database: SQLite (prisma/floodsense.db)  ║`);
    console.log(`║  SMS: ${(FAST2SMS_API_KEY ? 'Fast2SMS ✓' : 'Demo Mode').padEnd(34)}║`);
    console.log(`║  Auth: JWT (7-day tokens)                ║`);
    console.log(`║  Rate Limit: 200/15min global            ║`);
    console.log(`╚══════════════════════════════════════════╝`);
});
