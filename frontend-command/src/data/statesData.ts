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
