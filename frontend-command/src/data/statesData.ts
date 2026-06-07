// State-District mapping with flood risk + vulnerability data for India
export interface VulnerabilityData {
    elderly_pct: number;      // % of population over 60
    children_pct: number;     // % under 14
    disabled_pct: number;     // % with disabilities
    ews_pct: number;          // % economically weaker sections
    density_per_sqkm: number; // population density
    vulnerability_score: number; // computed 0-10
}

export interface DamData {
    name: string;
    river: string;
    capacity_mcm: number;     // million cubic meters
    current_level_pct: number; // % full
    status: "NORMAL" | "ALERT" | "DANGER" | "OVERFLOW";
    lat: number;
    lng: number;
}

export interface DistrictData {
    name: string;
    riskLevel: "HIGH" | "MODERATE" | "LOW";
    riskScore: number;
    population: number;
    rainfall: number; // mm
    waterLevel: number; // meters
    shelters: number;
    lat: number;
    lng: number;
    vulnerability: VulnerabilityData;
    nearbyDams?: DamData[];
    drainageHealth?: "GOOD" | "MODERATE" | "POOR" | "BLOCKED";
    embankmentRisk?: "LOW" | "MODERATE" | "HIGH";
}

export interface StateData {
    name: string;
    code: string;
    lat: number;
    lng: number;
    districts: DistrictData[];
}

function vulnScore(v: Omit<VulnerabilityData, 'vulnerability_score'>): VulnerabilityData {
    const score = Math.min(10, (v.elderly_pct / 15 * 2) + (v.children_pct / 35 * 2) + (v.disabled_pct / 5 * 2) + (v.ews_pct / 50 * 2) + (v.density_per_sqkm / 10000 * 2));
    return { ...v, vulnerability_score: Math.round(score * 10) / 10 };
}

export const STATES_DATA: StateData[] = [
    {
        name: "Assam", code: "AS", lat: 26.2006, lng: 92.9376,
        districts: [
            { name: "Kamrup", riskLevel: "HIGH", riskScore: 8.7, population: 1517202, rainfall: 312, waterLevel: 7.2, shelters: 14, lat: 26.14, lng: 91.67, vulnerability: vulnScore({ elderly_pct: 8.2, children_pct: 28, disabled_pct: 2.8, ews_pct: 38, density_per_sqkm: 4200 }), drainageHealth: "POOR", embankmentRisk: "HIGH", nearbyDams: [{ name: "Kopili Dam", river: "Kopili", capacity_mcm: 155, current_level_pct: 88, status: "ALERT", lat: 25.92, lng: 92.55 }] },
            { name: "Nagaon", riskLevel: "HIGH", riskScore: 9.1, population: 2823768, rainfall: 340, waterLevel: 8.1, shelters: 8, lat: 26.35, lng: 92.68, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 31, disabled_pct: 3.1, ews_pct: 42, density_per_sqkm: 3600 }), drainageHealth: "BLOCKED", embankmentRisk: "HIGH" },
            { name: "Dhubri", riskLevel: "MODERATE", riskScore: 6.2, population: 1948632, rainfall: 220, waterLevel: 5.4, shelters: 6, lat: 26.02, lng: 89.98, vulnerability: vulnScore({ elderly_pct: 6.8, children_pct: 33, disabled_pct: 2.5, ews_pct: 45, density_per_sqkm: 2800 }), drainageHealth: "MODERATE", embankmentRisk: "MODERATE" },
            { name: "Cachar", riskLevel: "LOW", riskScore: 3.1, population: 1736319, rainfall: 150, waterLevel: 3.2, shelters: 10, lat: 24.82, lng: 92.78, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 29, disabled_pct: 2.2, ews_pct: 35, density_per_sqkm: 2200 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Bihar", code: "BR", lat: 25.0961, lng: 85.3131,
        districts: [
            { name: "Patna", riskLevel: "HIGH", riskScore: 8.3, population: 5838465, rainfall: 280, waterLevel: 6.5, shelters: 22, lat: 25.61, lng: 85.14, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 30, disabled_pct: 3.0, ews_pct: 40, density_per_sqkm: 7200 }), drainageHealth: "POOR", embankmentRisk: "HIGH", nearbyDams: [{ name: "Gandak Barrage", river: "Gandak", capacity_mcm: 320, current_level_pct: 82, status: "ALERT", lat: 26.66, lng: 84.36 }] },
            { name: "Muzaffarpur", riskLevel: "HIGH", riskScore: 8.9, population: 4801062, rainfall: 310, waterLevel: 7.8, shelters: 12, lat: 26.12, lng: 85.39, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 32, disabled_pct: 3.5, ews_pct: 48, density_per_sqkm: 5100 }), drainageHealth: "BLOCKED", embankmentRisk: "HIGH" },
            { name: "Darbhanga", riskLevel: "HIGH", riskScore: 9.4, population: 3937385, rainfall: 345, waterLevel: 8.6, shelters: 9, lat: 26.17, lng: 86.04, vulnerability: vulnScore({ elderly_pct: 7.8, children_pct: 34, disabled_pct: 3.8, ews_pct: 52, density_per_sqkm: 4500 }), drainageHealth: "BLOCKED", embankmentRisk: "HIGH" },
            { name: "Bhagalpur", riskLevel: "MODERATE", riskScore: 5.8, population: 3032226, rainfall: 195, waterLevel: 4.8, shelters: 11, lat: 25.24, lng: 86.97, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 28, disabled_pct: 2.6, ews_pct: 36, density_per_sqkm: 3000 }), drainageHealth: "MODERATE" },
            { name: "Gaya", riskLevel: "LOW", riskScore: 2.5, population: 4391418, rainfall: 110, waterLevel: 2.1, shelters: 15, lat: 24.80, lng: 85.01, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 27, disabled_pct: 2.4, ews_pct: 33, density_per_sqkm: 2500 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Uttarakhand", code: "UK", lat: 30.0668, lng: 79.0193,
        districts: [
            { name: "Chamoli", riskLevel: "HIGH", riskScore: 9.2, population: 391114, rainfall: 380, waterLevel: 9.1, shelters: 5, lat: 30.40, lng: 79.33, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 25, disabled_pct: 3.2, ews_pct: 30, density_per_sqkm: 420 }), embankmentRisk: "HIGH", nearbyDams: [{ name: "Tehri Dam", river: "Bhagirathi", capacity_mcm: 3540, current_level_pct: 91, status: "DANGER", lat: 30.38, lng: 78.48 }, { name: "Tapovan Vishnugad", river: "Dhauliganga", capacity_mcm: 45, current_level_pct: 95, status: "OVERFLOW", lat: 30.48, lng: 79.58 }] },
            { name: "Pithoragarh", riskLevel: "HIGH", riskScore: 8.1, population: 483439, rainfall: 290, waterLevel: 6.8, shelters: 7, lat: 29.58, lng: 80.22, vulnerability: vulnScore({ elderly_pct: 12.0, children_pct: 24, disabled_pct: 2.9, ews_pct: 28, density_per_sqkm: 380 }), embankmentRisk: "MODERATE" },
            { name: "Uttarkashi", riskLevel: "MODERATE", riskScore: 6.5, population: 330086, rainfall: 240, waterLevel: 5.3, shelters: 4, lat: 30.73, lng: 78.45, vulnerability: vulnScore({ elderly_pct: 10.5, children_pct: 26, disabled_pct: 2.7, ews_pct: 32, density_per_sqkm: 300 }), drainageHealth: "MODERATE" },
            { name: "Dehradun", riskLevel: "MODERATE", riskScore: 5.0, population: 1696694, rainfall: 200, waterLevel: 4.2, shelters: 18, lat: 30.32, lng: 78.03, vulnerability: vulnScore({ elderly_pct: 8.8, children_pct: 23, disabled_pct: 2.1, ews_pct: 22, density_per_sqkm: 5500 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Kerala", code: "KL", lat: 10.8505, lng: 76.2711,
        districts: [
            { name: "Wayanad", riskLevel: "HIGH", riskScore: 9.5, population: 817420, rainfall: 410, waterLevel: 8.8, shelters: 11, lat: 11.69, lng: 76.08, vulnerability: vulnScore({ elderly_pct: 13.2, children_pct: 22, disabled_pct: 2.5, ews_pct: 25, density_per_sqkm: 3800 }), embankmentRisk: "HIGH", nearbyDams: [{ name: "Banasura Sagar", river: "Karamanathodu", capacity_mcm: 210, current_level_pct: 94, status: "DANGER", lat: 11.67, lng: 76.04 }] },
            { name: "Idukki", riskLevel: "HIGH", riskScore: 8.8, population: 1108974, rainfall: 370, waterLevel: 7.5, shelters: 9, lat: 9.85, lng: 76.97, vulnerability: vulnScore({ elderly_pct: 14.0, children_pct: 20, disabled_pct: 2.3, ews_pct: 20, density_per_sqkm: 2500 }), nearbyDams: [{ name: "Idukki Dam", river: "Periyar", capacity_mcm: 1996, current_level_pct: 87, status: "ALERT", lat: 9.84, lng: 76.97 }, { name: "Mullaperiyar Dam", river: "Periyar", capacity_mcm: 443, current_level_pct: 92, status: "DANGER", lat: 9.53, lng: 77.14 }] },
            { name: "Ernakulam", riskLevel: "MODERATE", riskScore: 5.9, population: 3282388, rainfall: 210, waterLevel: 4.5, shelters: 24, lat: 10.00, lng: 76.30, vulnerability: vulnScore({ elderly_pct: 12.0, children_pct: 21, disabled_pct: 2.0, ews_pct: 18, density_per_sqkm: 6800 }), drainageHealth: "MODERATE" },
            { name: "Alappuzha", riskLevel: "MODERATE", riskScore: 6.7, population: 2127789, rainfall: 250, waterLevel: 5.8, shelters: 16, lat: 9.49, lng: 76.34, vulnerability: vulnScore({ elderly_pct: 15.0, children_pct: 19, disabled_pct: 2.8, ews_pct: 22, density_per_sqkm: 4200 }), drainageHealth: "POOR" },
            { name: "Thrissur", riskLevel: "LOW", riskScore: 3.4, population: 3121200, rainfall: 140, waterLevel: 2.9, shelters: 20, lat: 10.52, lng: 76.21, vulnerability: vulnScore({ elderly_pct: 13.5, children_pct: 20, disabled_pct: 2.1, ews_pct: 15, density_per_sqkm: 3500 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "West Bengal", code: "WB", lat: 22.9868, lng: 87.8550,
        districts: [
            { name: "Malda", riskLevel: "HIGH", riskScore: 8.4, population: 3997970, rainfall: 300, waterLevel: 7.1, shelters: 10, lat: 25.01, lng: 88.14, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 30, disabled_pct: 2.9, ews_pct: 44, density_per_sqkm: 4100 }), drainageHealth: "POOR", embankmentRisk: "HIGH", nearbyDams: [{ name: "Farakka Barrage", river: "Ganges", capacity_mcm: 580, current_level_pct: 85, status: "ALERT", lat: 24.81, lng: 87.92 }] },
            { name: "Murshidabad", riskLevel: "HIGH", riskScore: 8.0, population: 7103807, rainfall: 275, waterLevel: 6.4, shelters: 13, lat: 24.18, lng: 88.27, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 31, disabled_pct: 3.2, ews_pct: 46, density_per_sqkm: 5200 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
            { name: "North 24 Parganas", riskLevel: "MODERATE", riskScore: 6.3, population: 10009781, rainfall: 230, waterLevel: 5.1, shelters: 28, lat: 22.62, lng: 88.80, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 25, disabled_pct: 2.4, ews_pct: 35, density_per_sqkm: 8500 }), drainageHealth: "MODERATE" },
            { name: "Howrah", riskLevel: "LOW", riskScore: 3.8, population: 4841638, rainfall: 160, waterLevel: 3.4, shelters: 19, lat: 22.59, lng: 88.26, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 23, disabled_pct: 2.0, ews_pct: 28, density_per_sqkm: 6800 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Maharashtra", code: "MH", lat: 19.7515, lng: 75.7139,
        districts: [
            { name: "Ratnagiri", riskLevel: "HIGH", riskScore: 7.9, population: 1615069, rainfall: 350, waterLevel: 6.7, shelters: 8, lat: 17.00, lng: 73.30, vulnerability: vulnScore({ elderly_pct: 12.5, children_pct: 22, disabled_pct: 2.4, ews_pct: 30, density_per_sqkm: 2000 }), embankmentRisk: "MODERATE", nearbyDams: [{ name: "Koyna Dam", river: "Koyna", capacity_mcm: 2797, current_level_pct: 78, status: "NORMAL", lat: 17.40, lng: 73.75 }] },
            { name: "Kolhapur", riskLevel: "MODERATE", riskScore: 6.1, population: 3876001, rainfall: 220, waterLevel: 5.0, shelters: 15, lat: 16.70, lng: 74.24, vulnerability: vulnScore({ elderly_pct: 10.0, children_pct: 24, disabled_pct: 2.2, ews_pct: 25, density_per_sqkm: 3200 }), drainageHealth: "MODERATE", nearbyDams: [{ name: "Almatti Dam", river: "Krishna", capacity_mcm: 3107, current_level_pct: 72, status: "NORMAL", lat: 16.33, lng: 75.88 }] },
            { name: "Pune", riskLevel: "MODERATE", riskScore: 4.8, population: 9426959, rainfall: 180, waterLevel: 3.8, shelters: 32, lat: 18.52, lng: 73.86, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 22, disabled_pct: 1.8, ews_pct: 20, density_per_sqkm: 6000 }), drainageHealth: "MODERATE", nearbyDams: [{ name: "Khadakwasla Dam", river: "Mutha", capacity_mcm: 67, current_level_pct: 65, status: "NORMAL", lat: 18.44, lng: 73.77 }] },
            { name: "Mumbai Suburban", riskLevel: "MODERATE", riskScore: 6.5, population: 9332481, rainfall: 260, waterLevel: 5.5, shelters: 40, lat: 19.08, lng: 72.89, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 21, disabled_pct: 1.9, ews_pct: 32, density_per_sqkm: 20000 }), drainageHealth: "POOR" },
            { name: "Nagpur", riskLevel: "LOW", riskScore: 2.3, population: 4653570, rainfall: 95, waterLevel: 1.8, shelters: 18, lat: 21.15, lng: 79.09, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 23, disabled_pct: 2.0, ews_pct: 22, density_per_sqkm: 4700 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Gujarat", code: "GJ", lat: 22.2587, lng: 71.1924,
        districts: [
            { name: "Kutch", riskLevel: "MODERATE", riskScore: 5.6, population: 2092371, rainfall: 200, waterLevel: 4.6, shelters: 7, lat: 23.73, lng: 69.86, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 27, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 460 }), drainageHealth: "MODERATE" },
            { name: "Surat", riskLevel: "MODERATE", riskScore: 6.0, population: 6081322, rainfall: 230, waterLevel: 5.2, shelters: 25, lat: 21.17, lng: 72.83, vulnerability: vulnScore({ elderly_pct: 6.5, children_pct: 24, disabled_pct: 1.8, ews_pct: 28, density_per_sqkm: 7200 }), drainageHealth: "MODERATE", nearbyDams: [{ name: "Ukai Dam", river: "Tapi", capacity_mcm: 7414, current_level_pct: 80, status: "ALERT", lat: 21.26, lng: 73.58 }] },
            { name: "Vadodara", riskLevel: "LOW", riskScore: 3.5, population: 4157568, rainfall: 130, waterLevel: 2.7, shelters: 16, lat: 22.31, lng: 73.19, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 25, disabled_pct: 2.0, ews_pct: 24, density_per_sqkm: 3800 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Uttar Pradesh", code: "UP", lat: 26.8467, lng: 80.9462,
        districts: [
            { name: "Gorakhpur", riskLevel: "HIGH", riskScore: 8.6, population: 4440895, rainfall: 305, waterLevel: 7.3, shelters: 11, lat: 26.76, lng: 83.37, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 32, disabled_pct: 3.5, ews_pct: 48, density_per_sqkm: 5800 }), drainageHealth: "BLOCKED", embankmentRisk: "HIGH" },
            { name: "Bahraich", riskLevel: "HIGH", riskScore: 7.8, population: 3487731, rainfall: 270, waterLevel: 6.2, shelters: 6, lat: 27.57, lng: 81.60, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 35, disabled_pct: 3.8, ews_pct: 55, density_per_sqkm: 4300 }), embankmentRisk: "HIGH" },
            { name: "Lucknow", riskLevel: "MODERATE", riskScore: 4.5, population: 4589838, rainfall: 170, waterLevel: 3.6, shelters: 22, lat: 26.85, lng: 80.95, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 26, disabled_pct: 2.2, ews_pct: 30, density_per_sqkm: 6200 }), drainageHealth: "MODERATE" },
            { name: "Varanasi", riskLevel: "MODERATE", riskScore: 5.3, population: 3682194, rainfall: 195, waterLevel: 4.3, shelters: 14, lat: 25.32, lng: 83.01, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 28, disabled_pct: 2.8, ews_pct: 38, density_per_sqkm: 5000 }), drainageHealth: "POOR" },
        ]
    },
    {
        name: "Tamil Nadu", code: "TN", lat: 11.1271, lng: 78.6569,
        districts: [
            { name: "Chennai", riskLevel: "HIGH", riskScore: 7.6, population: 4646732, rainfall: 320, waterLevel: 5.9, shelters: 35, lat: 13.08, lng: 80.27, vulnerability: vulnScore({ elderly_pct: 10.5, children_pct: 22, disabled_pct: 2.1, ews_pct: 28, density_per_sqkm: 26000 }), drainageHealth: "BLOCKED", nearbyDams: [{ name: "Chembarambakkam", river: "Adyar", capacity_mcm: 103, current_level_pct: 96, status: "OVERFLOW", lat: 12.97, lng: 80.05 }] },
            { name: "Cuddalore", riskLevel: "MODERATE", riskScore: 6.4, population: 2605914, rainfall: 240, waterLevel: 5.0, shelters: 12, lat: 11.75, lng: 79.77, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 24, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 3000 }), drainageHealth: "MODERATE" },
            { name: "Coimbatore", riskLevel: "LOW", riskScore: 2.8, population: 3458045, rainfall: 100, waterLevel: 2.0, shelters: 20, lat: 11.00, lng: 76.96, vulnerability: vulnScore({ elderly_pct: 10.0, children_pct: 21, disabled_pct: 1.8, ews_pct: 18, density_per_sqkm: 4500 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Delhi", code: "DL", lat: 28.7041, lng: 77.1025,
        districts: [
            { name: "East Delhi", riskLevel: "HIGH", riskScore: 7.5, population: 1709346, rainfall: 260, waterLevel: 6.1, shelters: 8, lat: 28.63, lng: 77.30, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 25, disabled_pct: 2.3, ews_pct: 40, density_per_sqkm: 22000 }), drainageHealth: "BLOCKED", embankmentRisk: "MODERATE" },
            { name: "Central Delhi", riskLevel: "MODERATE", riskScore: 5.2, population: 578671, rainfall: 190, waterLevel: 4.0, shelters: 6, lat: 28.65, lng: 77.23, vulnerability: vulnScore({ elderly_pct: 10.0, children_pct: 20, disabled_pct: 2.0, ews_pct: 25, density_per_sqkm: 28000 }), drainageHealth: "MODERATE" },
            { name: "New Delhi", riskLevel: "LOW", riskScore: 3.0, population: 142004, rainfall: 120, waterLevel: 2.5, shelters: 10, lat: 28.61, lng: 77.21, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 18, disabled_pct: 1.5, ews_pct: 12, density_per_sqkm: 6500 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Odisha", code: "OD", lat: 20.9517, lng: 85.0985,
        districts: [
            { name: "Puri", riskLevel: "HIGH", riskScore: 8.8, population: 1698730, rainfall: 340, waterLevel: 7.5, shelters: 12, lat: 19.81, lng: 85.83, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 26, disabled_pct: 2.8, ews_pct: 38, density_per_sqkm: 4800 }), drainageHealth: "POOR", embankmentRisk: "HIGH", nearbyDams: [{ name: "Hirakud Dam", river: "Mahanadi", capacity_mcm: 8136, current_level_pct: 88, status: "ALERT", lat: 21.52, lng: 83.87 }] },
            { name: "Kendrapara", riskLevel: "HIGH", riskScore: 9.0, population: 1440361, rainfall: 360, waterLevel: 8.2, shelters: 7, lat: 20.50, lng: 86.42, vulnerability: vulnScore({ elderly_pct: 10.5, children_pct: 28, disabled_pct: 3.0, ews_pct: 42, density_per_sqkm: 3200 }), drainageHealth: "BLOCKED", embankmentRisk: "HIGH" },
            { name: "Cuttack", riskLevel: "HIGH", riskScore: 8.2, population: 2624470, rainfall: 290, waterLevel: 6.8, shelters: 15, lat: 20.46, lng: 85.88, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 27, disabled_pct: 2.6, ews_pct: 36, density_per_sqkm: 4500 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
            { name: "Bhubaneswar", riskLevel: "MODERATE", riskScore: 5.5, population: 1136000, rainfall: 200, waterLevel: 4.2, shelters: 20, lat: 20.30, lng: 85.82, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 24, disabled_pct: 2.0, ews_pct: 25, density_per_sqkm: 6200 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Andhra Pradesh", code: "AP", lat: 15.9129, lng: 79.7400,
        districts: [
            { name: "Krishna", riskLevel: "HIGH", riskScore: 8.5, population: 4529009, rainfall: 310, waterLevel: 7.0, shelters: 14, lat: 16.57, lng: 80.65, vulnerability: vulnScore({ elderly_pct: 10.0, children_pct: 25, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 4000 }), drainageHealth: "POOR", embankmentRisk: "HIGH", nearbyDams: [{ name: "Prakasam Barrage", river: "Krishna", capacity_mcm: 450, current_level_pct: 90, status: "DANGER", lat: 16.51, lng: 80.62 }] },
            { name: "Guntur", riskLevel: "MODERATE", riskScore: 6.3, population: 4889230, rainfall: 230, waterLevel: 5.1, shelters: 16, lat: 16.31, lng: 80.44, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 26, disabled_pct: 2.3, ews_pct: 32, density_per_sqkm: 3500 }), drainageHealth: "MODERATE" },
            { name: "East Godavari", riskLevel: "HIGH", riskScore: 8.0, population: 5151549, rainfall: 300, waterLevel: 6.5, shelters: 12, lat: 17.32, lng: 82.14, vulnerability: vulnScore({ elderly_pct: 10.5, children_pct: 24, disabled_pct: 2.4, ews_pct: 30, density_per_sqkm: 4200 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
            { name: "Visakhapatnam", riskLevel: "LOW", riskScore: 3.5, population: 4290589, rainfall: 140, waterLevel: 2.8, shelters: 22, lat: 17.69, lng: 83.22, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 23, disabled_pct: 2.0, ews_pct: 22, density_per_sqkm: 3800 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Telangana", code: "TG", lat: 18.1124, lng: 79.0193,
        districts: [
            { name: "Hyderabad", riskLevel: "HIGH", riskScore: 7.8, population: 6809970, rainfall: 280, waterLevel: 6.0, shelters: 30, lat: 17.39, lng: 78.49, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 23, disabled_pct: 2.0, ews_pct: 30, density_per_sqkm: 18000 }), drainageHealth: "BLOCKED", embankmentRisk: "MODERATE" },
            { name: "Warangal", riskLevel: "MODERATE", riskScore: 5.8, population: 3512576, rainfall: 210, waterLevel: 4.5, shelters: 12, lat: 17.98, lng: 79.59, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 25, disabled_pct: 2.3, ews_pct: 34, density_per_sqkm: 3200 }), drainageHealth: "MODERATE" },
            { name: "Nizamabad", riskLevel: "LOW", riskScore: 3.2, population: 2551335, rainfall: 130, waterLevel: 2.5, shelters: 10, lat: 18.67, lng: 78.09, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 26, disabled_pct: 2.5, ews_pct: 36, density_per_sqkm: 2800 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Karnataka", code: "KA", lat: 15.3173, lng: 75.7139,
        districts: [
            { name: "Kodagu", riskLevel: "HIGH", riskScore: 8.6, population: 554519, rainfall: 380, waterLevel: 7.8, shelters: 8, lat: 12.42, lng: 75.74, vulnerability: vulnScore({ elderly_pct: 12.0, children_pct: 22, disabled_pct: 2.5, ews_pct: 25, density_per_sqkm: 1300 }), embankmentRisk: "HIGH", nearbyDams: [{ name: "KRS Dam", river: "Cauvery", capacity_mcm: 1400, current_level_pct: 85, status: "ALERT", lat: 12.42, lng: 76.57 }] },
            { name: "Dakshina Kannada", riskLevel: "MODERATE", riskScore: 6.5, population: 2083625, rainfall: 260, waterLevel: 5.5, shelters: 14, lat: 12.87, lng: 75.17, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 21, disabled_pct: 2.2, ews_pct: 20, density_per_sqkm: 4500 }), drainageHealth: "MODERATE" },
            { name: "Bengaluru Urban", riskLevel: "MODERATE", riskScore: 5.5, population: 9621551, rainfall: 200, waterLevel: 4.0, shelters: 35, lat: 12.97, lng: 77.59, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 22, disabled_pct: 1.8, ews_pct: 20, density_per_sqkm: 12000 }), drainageHealth: "POOR" },
            { name: "Belagavi", riskLevel: "LOW", riskScore: 3.8, population: 4778439, rainfall: 150, waterLevel: 3.0, shelters: 18, lat: 15.85, lng: 74.50, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 25, disabled_pct: 2.3, ews_pct: 28, density_per_sqkm: 3000 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Rajasthan", code: "RJ", lat: 27.0238, lng: 74.2179,
        districts: [
            { name: "Jaipur", riskLevel: "MODERATE", riskScore: 5.2, population: 6626178, rainfall: 180, waterLevel: 3.8, shelters: 20, lat: 26.92, lng: 75.79, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 28, disabled_pct: 2.5, ews_pct: 32, density_per_sqkm: 5500 }), drainageHealth: "MODERATE" },
            { name: "Kota", riskLevel: "MODERATE", riskScore: 6.0, population: 1950491, rainfall: 220, waterLevel: 4.8, shelters: 10, lat: 25.18, lng: 75.83, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 27, disabled_pct: 2.2, ews_pct: 30, density_per_sqkm: 3200 }), drainageHealth: "MODERATE" },
            { name: "Barmer", riskLevel: "LOW", riskScore: 2.5, population: 2603751, rainfall: 80, waterLevel: 1.5, shelters: 5, lat: 25.75, lng: 71.39, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 32, disabled_pct: 2.8, ews_pct: 42, density_per_sqkm: 920 }), drainageHealth: "GOOD" },
            { name: "Jodhpur", riskLevel: "LOW", riskScore: 2.8, population: 3685681, rainfall: 100, waterLevel: 2.0, shelters: 12, lat: 26.29, lng: 73.02, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 30, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 1600 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Madhya Pradesh", code: "MP", lat: 22.9734, lng: 78.6569,
        districts: [
            { name: "Bhopal", riskLevel: "MODERATE", riskScore: 5.8, population: 2368145, rainfall: 230, waterLevel: 4.5, shelters: 18, lat: 23.26, lng: 77.41, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 26, disabled_pct: 2.3, ews_pct: 30, density_per_sqkm: 5200 }), drainageHealth: "MODERATE" },
            { name: "Mandla", riskLevel: "HIGH", riskScore: 7.5, population: 1054905, rainfall: 300, waterLevel: 6.5, shelters: 6, lat: 22.60, lng: 80.38, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 30, disabled_pct: 3.0, ews_pct: 45, density_per_sqkm: 1500 }), embankmentRisk: "HIGH", nearbyDams: [{ name: "Bargi Dam", river: "Narmada", capacity_mcm: 3921, current_level_pct: 82, status: "ALERT", lat: 23.00, lng: 79.95 }] },
            { name: "Indore", riskLevel: "LOW", riskScore: 3.0, population: 3276697, rainfall: 120, waterLevel: 2.2, shelters: 16, lat: 22.72, lng: 75.86, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 24, disabled_pct: 2.0, ews_pct: 22, density_per_sqkm: 4800 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Punjab", code: "PB", lat: 31.1471, lng: 75.3412,
        districts: [
            { name: "Patiala", riskLevel: "MODERATE", riskScore: 5.5, population: 1895686, rainfall: 200, waterLevel: 4.3, shelters: 12, lat: 30.34, lng: 76.39, vulnerability: vulnScore({ elderly_pct: 10.0, children_pct: 24, disabled_pct: 2.3, ews_pct: 28, density_per_sqkm: 3500 }), drainageHealth: "MODERATE" },
            { name: "Ludhiana", riskLevel: "MODERATE", riskScore: 5.8, population: 3498739, rainfall: 220, waterLevel: 4.8, shelters: 18, lat: 30.90, lng: 75.86, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 23, disabled_pct: 2.0, ews_pct: 25, density_per_sqkm: 5600 }), drainageHealth: "MODERATE", nearbyDams: [{ name: "Bhakra Dam", river: "Sutlej", capacity_mcm: 9621, current_level_pct: 75, status: "NORMAL", lat: 31.42, lng: 76.44 }] },
            { name: "Amritsar", riskLevel: "LOW", riskScore: 3.2, population: 2490656, rainfall: 130, waterLevel: 2.5, shelters: 14, lat: 31.63, lng: 74.87, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 23, disabled_pct: 2.2, ews_pct: 24, density_per_sqkm: 4000 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Haryana", code: "HR", lat: 29.0588, lng: 76.0856,
        districts: [
            { name: "Karnal", riskLevel: "MODERATE", riskScore: 5.6, population: 1505324, rainfall: 210, waterLevel: 4.5, shelters: 10, lat: 29.69, lng: 76.98, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 26, disabled_pct: 2.3, ews_pct: 28, density_per_sqkm: 3800 }), drainageHealth: "MODERATE" },
            { name: "Gurugram", riskLevel: "MODERATE", riskScore: 5.8, population: 1514085, rainfall: 200, waterLevel: 4.3, shelters: 15, lat: 28.46, lng: 77.03, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 22, disabled_pct: 1.8, ews_pct: 20, density_per_sqkm: 8000 }), drainageHealth: "POOR" },
        ]
    },
    {
        name: "Chhattisgarh", code: "CG", lat: 21.2787, lng: 81.8661,
        districts: [
            { name: "Raipur", riskLevel: "MODERATE", riskScore: 5.5, population: 4063872, rainfall: 220, waterLevel: 4.5, shelters: 16, lat: 21.25, lng: 81.63, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 28, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 3200 }), drainageHealth: "MODERATE" },
            { name: "Bastar", riskLevel: "HIGH", riskScore: 7.2, population: 1411644, rainfall: 280, waterLevel: 6.2, shelters: 5, lat: 19.10, lng: 82.00, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 32, disabled_pct: 3.2, ews_pct: 50, density_per_sqkm: 1200 }), embankmentRisk: "HIGH" },
        ]
    },
    {
        name: "Jharkhand", code: "JH", lat: 23.6102, lng: 85.2799,
        districts: [
            { name: "Ranchi", riskLevel: "MODERATE", riskScore: 5.0, population: 2914253, rainfall: 210, waterLevel: 4.0, shelters: 14, lat: 23.36, lng: 85.33, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 28, disabled_pct: 2.5, ews_pct: 38, density_per_sqkm: 3500 }), drainageHealth: "MODERATE" },
            { name: "Sahebganj", riskLevel: "HIGH", riskScore: 7.8, population: 1150038, rainfall: 290, waterLevel: 6.5, shelters: 5, lat: 25.25, lng: 87.64, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 33, disabled_pct: 3.5, ews_pct: 52, density_per_sqkm: 2800 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
        ]
    },
    {
        name: "Himachal Pradesh", code: "HP", lat: 31.1048, lng: 77.1734,
        districts: [
            { name: "Kullu", riskLevel: "HIGH", riskScore: 8.0, population: 437903, rainfall: 320, waterLevel: 7.0, shelters: 6, lat: 31.96, lng: 77.11, vulnerability: vulnScore({ elderly_pct: 12.0, children_pct: 23, disabled_pct: 2.8, ews_pct: 25, density_per_sqkm: 800 }), embankmentRisk: "HIGH" },
            { name: "Shimla", riskLevel: "MODERATE", riskScore: 5.5, population: 813384, rainfall: 210, waterLevel: 4.2, shelters: 10, lat: 31.10, lng: 77.17, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 22, disabled_pct: 2.2, ews_pct: 22, density_per_sqkm: 1500 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Jammu & Kashmir", code: "JK", lat: 33.7782, lng: 76.5762,
        districts: [
            { name: "Srinagar", riskLevel: "HIGH", riskScore: 7.8, population: 1236829, rainfall: 280, waterLevel: 6.5, shelters: 12, lat: 34.08, lng: 74.80, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 26, disabled_pct: 2.5, ews_pct: 30, density_per_sqkm: 4500 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
            { name: "Jammu", riskLevel: "LOW", riskScore: 3.5, population: 1526406, rainfall: 140, waterLevel: 2.8, shelters: 14, lat: 32.73, lng: 74.87, vulnerability: vulnScore({ elderly_pct: 9.5, children_pct: 25, disabled_pct: 2.2, ews_pct: 25, density_per_sqkm: 3500 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Meghalaya", code: "ML", lat: 25.4670, lng: 91.3662,
        districts: [
            { name: "East Khasi Hills", riskLevel: "HIGH", riskScore: 8.2, population: 825922, rainfall: 450, waterLevel: 8.5, shelters: 6, lat: 25.57, lng: 91.88, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 30, disabled_pct: 2.8, ews_pct: 35, density_per_sqkm: 3000 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
            { name: "West Garo Hills", riskLevel: "MODERATE", riskScore: 6.0, population: 643291, rainfall: 300, waterLevel: 5.5, shelters: 4, lat: 25.52, lng: 90.22, vulnerability: vulnScore({ elderly_pct: 6.5, children_pct: 32, disabled_pct: 3.0, ews_pct: 40, density_per_sqkm: 1800 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Tripura", code: "TR", lat: 23.9408, lng: 91.9882,
        districts: [
            { name: "West Tripura", riskLevel: "MODERATE", riskScore: 5.8, population: 917534, rainfall: 240, waterLevel: 4.8, shelters: 8, lat: 23.84, lng: 91.28, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 26, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 3200 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Manipur", code: "MN", lat: 24.6637, lng: 93.9063,
        districts: [
            { name: "Imphal West", riskLevel: "MODERATE", riskScore: 5.5, population: 517992, rainfall: 230, waterLevel: 4.5, shelters: 6, lat: 24.80, lng: 93.94, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 27, disabled_pct: 2.5, ews_pct: 32, density_per_sqkm: 3500 }), drainageHealth: "MODERATE" },
            { name: "Thoubal", riskLevel: "HIGH", riskScore: 7.2, population: 422168, rainfall: 280, waterLevel: 6.2, shelters: 4, lat: 24.63, lng: 94.00, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 29, disabled_pct: 2.8, ews_pct: 38, density_per_sqkm: 2800 }), drainageHealth: "POOR", embankmentRisk: "HIGH" },
        ]
    },
    {
        name: "Mizoram", code: "MZ", lat: 23.1645, lng: 92.9376,
        districts: [
            { name: "Aizawl", riskLevel: "MODERATE", riskScore: 5.0, population: 400309, rainfall: 240, waterLevel: 4.0, shelters: 6, lat: 23.73, lng: 92.72, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 26, disabled_pct: 2.3, ews_pct: 28, density_per_sqkm: 2500 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Nagaland", code: "NL", lat: 26.1584, lng: 94.5624,
        districts: [
            { name: "Dimapur", riskLevel: "MODERATE", riskScore: 5.5, population: 378811, rainfall: 220, waterLevel: 4.5, shelters: 5, lat: 25.90, lng: 93.74, vulnerability: vulnScore({ elderly_pct: 6.5, children_pct: 28, disabled_pct: 2.5, ews_pct: 32, density_per_sqkm: 2200 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Sikkim", code: "SK", lat: 27.5330, lng: 88.5122,
        districts: [
            { name: "East Sikkim", riskLevel: "HIGH", riskScore: 7.5, population: 283583, rainfall: 310, waterLevel: 6.8, shelters: 5, lat: 27.33, lng: 88.62, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 24, disabled_pct: 2.5, ews_pct: 25, density_per_sqkm: 2800 }), embankmentRisk: "HIGH" },
        ]
    },
    {
        name: "Arunachal Pradesh", code: "AR", lat: 28.2180, lng: 94.7278,
        districts: [
            { name: "East Siang", riskLevel: "HIGH", riskScore: 8.0, population: 99019, rainfall: 350, waterLevel: 7.5, shelters: 3, lat: 28.07, lng: 95.32, vulnerability: vulnScore({ elderly_pct: 6.5, children_pct: 30, disabled_pct: 2.8, ews_pct: 40, density_per_sqkm: 300 }), embankmentRisk: "HIGH" },
            { name: "Papum Pare", riskLevel: "MODERATE", riskScore: 5.5, population: 176385, rainfall: 250, waterLevel: 4.5, shelters: 4, lat: 27.10, lng: 93.68, vulnerability: vulnScore({ elderly_pct: 6.0, children_pct: 28, disabled_pct: 2.5, ews_pct: 35, density_per_sqkm: 500 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Goa", code: "GA", lat: 15.2993, lng: 74.1240,
        districts: [
            { name: "North Goa", riskLevel: "MODERATE", riskScore: 5.5, population: 818008, rainfall: 280, waterLevel: 4.8, shelters: 10, lat: 15.50, lng: 73.92, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 20, disabled_pct: 2.0, ews_pct: 18, density_per_sqkm: 4500 }), drainageHealth: "MODERATE" },
            { name: "South Goa", riskLevel: "LOW", riskScore: 3.5, population: 640537, rainfall: 200, waterLevel: 3.0, shelters: 8, lat: 15.20, lng: 74.00, vulnerability: vulnScore({ elderly_pct: 12.0, children_pct: 19, disabled_pct: 2.2, ews_pct: 15, density_per_sqkm: 3800 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Puducherry", code: "PY", lat: 11.9416, lng: 79.8083,
        districts: [
            { name: "Puducherry", riskLevel: "MODERATE", riskScore: 6.0, population: 950289, rainfall: 250, waterLevel: 4.5, shelters: 8, lat: 11.94, lng: 79.83, vulnerability: vulnScore({ elderly_pct: 11.0, children_pct: 22, disabled_pct: 2.2, ews_pct: 22, density_per_sqkm: 8500 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Chandigarh", code: "CH", lat: 30.7333, lng: 76.7794,
        districts: [
            { name: "Chandigarh", riskLevel: "LOW", riskScore: 3.0, population: 1055450, rainfall: 140, waterLevel: 2.5, shelters: 10, lat: 30.73, lng: 76.78, vulnerability: vulnScore({ elderly_pct: 8.5, children_pct: 22, disabled_pct: 1.8, ews_pct: 15, density_per_sqkm: 9252 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Andaman & Nicobar", code: "AN", lat: 11.7401, lng: 92.6586,
        districts: [
            { name: "South Andaman", riskLevel: "MODERATE", riskScore: 5.5, population: 238142, rainfall: 300, waterLevel: 4.5, shelters: 6, lat: 11.62, lng: 92.73, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 24, disabled_pct: 2.2, ews_pct: 22, density_per_sqkm: 1500 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Ladakh", code: "LA", lat: 34.1526, lng: 77.5771,
        districts: [
            { name: "Leh", riskLevel: "MODERATE", riskScore: 5.0, population: 133487, rainfall: 180, waterLevel: 3.8, shelters: 4, lat: 34.17, lng: 77.58, vulnerability: vulnScore({ elderly_pct: 8.0, children_pct: 25, disabled_pct: 2.5, ews_pct: 28, density_per_sqkm: 300 }), drainageHealth: "MODERATE" },
            { name: "Kargil", riskLevel: "LOW", riskScore: 3.5, population: 140802, rainfall: 120, waterLevel: 2.5, shelters: 3, lat: 34.55, lng: 76.13, vulnerability: vulnScore({ elderly_pct: 7.5, children_pct: 27, disabled_pct: 2.8, ews_pct: 32, density_per_sqkm: 250 }), drainageHealth: "GOOD" },
        ]
    },
    {
        name: "Lakshadweep", code: "LD", lat: 10.5667, lng: 72.6417,
        districts: [
            { name: "Lakshadweep", riskLevel: "MODERATE", riskScore: 5.2, population: 64473, rainfall: 250, waterLevel: 4.0, shelters: 3, lat: 10.57, lng: 72.64, vulnerability: vulnScore({ elderly_pct: 9.0, children_pct: 24, disabled_pct: 2.0, ews_pct: 20, density_per_sqkm: 2000 }), drainageHealth: "MODERATE" },
        ]
    },
    {
        name: "Dadra Nagar Haveli & Daman Diu", code: "DN", lat: 20.1809, lng: 73.0169,
        districts: [
            { name: "Daman", riskLevel: "LOW", riskScore: 3.2, population: 191173, rainfall: 160, waterLevel: 3.0, shelters: 4, lat: 20.42, lng: 72.85, vulnerability: vulnScore({ elderly_pct: 7.0, children_pct: 25, disabled_pct: 2.0, ews_pct: 22, density_per_sqkm: 3200 }), drainageHealth: "GOOD" },
            { name: "Silvassa", riskLevel: "LOW", riskScore: 3.5, population: 343709, rainfall: 180, waterLevel: 3.2, shelters: 5, lat: 20.27, lng: 73.01, vulnerability: vulnScore({ elderly_pct: 6.5, children_pct: 26, disabled_pct: 2.2, ews_pct: 25, density_per_sqkm: 2800 }), drainageHealth: "GOOD" },
        ]
    },
];

// Helper functions
export function getAllDistricts(): (DistrictData & { stateName: string })[] {
    return STATES_DATA.flatMap(state =>
        state.districts.map(d => ({ ...d, stateName: state.name }))
    );
}

export function getHighRiskDistricts(): (DistrictData & { stateName: string })[] {
    return getAllDistricts().filter(d => d.riskLevel === "HIGH").sort((a, b) => b.riskScore - a.riskScore);
}

export function getVulnerableDistricts(): (DistrictData & { stateName: string })[] {
    return getAllDistricts().sort((a, b) => b.vulnerability.vulnerability_score - a.vulnerability.vulnerability_score);
}

export function getAllDams(): (DamData & { district: string; state: string })[] {
    return STATES_DATA.flatMap(state =>
        state.districts.flatMap(d =>
            (d.nearbyDams || []).map(dam => ({ ...dam, district: d.name, state: state.name }))
        )
    );
}

export function getDangerDams(): (DamData & { district: string; state: string })[] {
    return getAllDams().filter(d => d.status === "DANGER" || d.status === "OVERFLOW");
}

export function getDamsByState(stateName: string): (DamData & { district: string; state: string })[] {
    const st = STATES_DATA.find(s => s.name === stateName);
    if(!st) return [];
    return st.districts.flatMap(d =>
        (d.nearbyDams || []).map(dam => ({ ...dam, district: d.name, state: stateName }))
    );
}

export function getVulnerableByState(stateName: string): (DistrictData & { stateName: string })[] {
    const st = STATES_DATA.find(s => s.name === stateName);
    if(!st) return [];
    return st.districts.map(d => ({ ...d, stateName })).sort((a, b) => b.vulnerability.vulnerability_score - a.vulnerability.vulnerability_score);
}

export function getStateRiskSummary(state: StateData | string) {
    const s = typeof state === 'string' ? STATES_DATA.find(st => st.name === state) : state;
    if(!s) return { highCount: 0, moderateCount: 0, lowCount: 0, avgRisk: 0, totalPop: 0, totalShelters: 0 };
    const highCount = s.districts.filter(d => d.riskLevel === "HIGH").length;
    const moderateCount = s.districts.filter(d => d.riskLevel === "MODERATE").length;
    const lowCount = s.districts.filter(d => d.riskLevel === "LOW").length;
    const avgRisk = s.districts.reduce((sum, d) => sum + d.riskScore, 0) / s.districts.length;
    const totalPop = s.districts.reduce((sum, d) => sum + d.population, 0);
    const totalShelters = s.districts.reduce((sum, d) => sum + d.shelters, 0);
    return { highCount, moderateCount, lowCount, avgRisk: Math.round(avgRisk * 10) / 10, totalPop, totalShelters };
}
