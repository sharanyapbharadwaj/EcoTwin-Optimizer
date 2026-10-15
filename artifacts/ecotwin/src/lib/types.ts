export type ModuleId = 'warehouse' | 'solar' | 'datacenter' | 'home';
export type Metrics = { energy: number; renewable: number; cost: number; emissions: number; savingsEnergy: number; savingsCost: number; savingsEmissions: number; opportunities: number };
export type Recommendation = { condition: string; action: string; reason: string; benefit: string; assumptions: string };
export type Scenario<T> = { baseline: T; optimized: T; metrics: Metrics; recommendation: Recommendation; ranAt: string };
export type Slot = { name: string; price: number; carbon: number };
export type Job = { id: string; name: string; duration: number; energy: number; deadline: number; priority: 'High'|'Medium'|'Low'; servers: string[] };
export type Appliance = { id: string; name: string; energy: number; priority: number; window: string; flexible: boolean };
