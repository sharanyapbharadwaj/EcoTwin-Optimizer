import { appliances, defaultRates, jobs } from './sampleData';
import type { Appliance, Job, Metrics, Recommendation, Scenario, Slot } from './types';
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const round=(n:number,d=1)=>Number(n.toFixed(d));
export const metricSet=(energy:number,renewable:number,cost:number,emissions:number,base?:{energy:number;cost:number;emissions:number},opportunities=0):Metrics=>({
 energy:round(energy),renewable:round(renewable),cost:round(cost,2),emissions:round(emissions,2),
 savingsEnergy:round((base?.energy??energy)-energy),savingsCost:round((base?.cost??cost)-cost,2),savingsEmissions:round((base?.emissions??emissions)-emissions,2),opportunities
});
export const warehouseDefaults={target:-18,outside:29,thermalLoad:8,coolingKw:18,duration:8,precool:true,preCoolStart:2,preCoolHours:2,rate:7.2,offPeakRate:5.2,carbon:.61,offPeakCarbon:.48};
export type WarehouseInput=typeof warehouseDefaults;
export function warehouseRun(x:WarehouseInput):Scenario<WarehouseInput>{
 const safeTarget=clamp(x.target,-22,-16), hours=clamp(x.duration,1,24), kW=clamp(x.coolingKw,1,120);
  const ambientFactor=clamp(1+Math.max(0,x.outside-25)*.006+Math.max(0,-18-safeTarget)*.008,.9,1.4);
  const thermalFactor=clamp(1+x.thermalLoad*.01,1,2);
  const modeledCoolingKw=kW*ambientFactor*thermalFactor;
 // Explicit modeled pre-cool: 5% less compressor runtime; a scheduled energy share is priced at off-peak.
 const baseEnergy=modeledCoolingKw*hours, optEnergy=x.precool?baseEnergy*.95:baseEnergy;
 const shiftShare=x.precool?clamp(x.preCoolHours/hours,0,1):0;
 const scheduledStart=((x.preCoolStart%24)+24)%24,usesOffPeak=scheduledStart<6||scheduledStart>=22;
 const activeRate=usesOffPeak?x.offPeakRate:x.rate,activeCarbon=usesOffPeak?x.offPeakCarbon:x.carbon;
 const baseCost=baseEnergy*x.rate, optimizedCost=optEnergy*((1-shiftShare)*x.rate+shiftShare*activeRate);
 const baseEm=baseEnergy*x.carbon,optEm=optEnergy*((1-shiftShare)*x.carbon+shiftShare*activeCarbon);
 const benefit=x.precool?`~${round(baseEnergy-optEnergy)} kWh modeled runtime reduction plus tariff/carbon factors applied to ${round(shiftShare*100,0)}% in the scheduled window.`:'No energy change modeled; tariff shifting alone cannot save energy.';
 return {baseline:{...x,precool:false},optimized:{...x,target:safeTarget},metrics:metricSet(optEnergy,0,optimizedCost,optEm,{energy:baseEnergy,cost:baseCost,emissions:baseEm},x.precool?1:0),ranAt:new Date().toISOString(),
  recommendation:{condition:x.precool?'Pre-cooling is enabled':'Pre-cooling is disabled',action:x.precool?'Pre-cool within the validated temperature band':'Keep the target setpoint; avoid uncontrolled shutdown',reason:`A small runtime allowance is modeled; ${round(shiftShare*100,0)}% of modeled energy is assigned to ${usesOffPeak?'off-peak':'standard'} tariff/carbon factors starting ${scheduledStart}:00.`,benefit,assumptions:`Modeled cooling kW = entered cooling kW × ambient/setpoint factor ${round(ambientFactor,3)} × thermal-load factor (1 + 1% per entered kW) ${round(thermalFactor,3)}; energy = modeled cooling kW × ${hours} h. Pre-cool assumes 5% lower runtime, time shifting alone does not change kWh. Thermal load modifies the cooling estimate and is not added again as a separate energy load.`}};
}
export const solarDefaults={expected:72,actual:61,demand:48,efficiency:94,loss:8,rate:7.4,carbon:.62};
export type SolarInput=typeof solarDefaults;
export function solarRun(x:SolarInput):Scenario<SolarInput>{
 const expected=clamp(x.expected,0,400), actual=clamp(x.actual,0,400), demand=clamp(x.demand,0,400);
 // Actual generation is already net of inverter efficiency and shading; efficiency/loss inputs explain expected-vs-actual only.
 const effectiveExpected=expected*clamp(x.efficiency,50,100)/100*(1-clamp(x.loss,0,60)/100);
  const baseUseful=Math.min(actual,demand*.75), useful=Math.min(actual,demand);
  const generationShortfall=Math.max(0,effectiveExpected-actual), demandShortfall=Math.max(0,demand-actual);
 const baseGrid=Math.max(0,demand-baseUseful),grid=Math.max(0,demand-useful);
 const baseCost=baseGrid*x.rate, baseEm=baseGrid*x.carbon, cost=grid*x.rate, emissions=grid*x.carbon;
 const aligned=useful-baseUseful;
 return {baseline:{...x},optimized:{...x},metrics:metricSet(demand,useful,cost,emissions,{energy:demand,cost:baseCost,emissions:baseEm},aligned>0?1:0),ranAt:new Date().toISOString(),
  recommendation:{condition:generationShortfall>0?'Actual generation is below its adjusted expectation':demandShortfall>0?'Modeled demand exceeds actual generation':'Modeled generation can serve the full modeled demand',action:generationShortfall>0?'Review weather, shading, panel cleanliness, and inverter readings before diagnosing a fault':demandShortfall>0?'Align up to 25% of flexible demand with the solar window':'Use the available solar window before drawing grid energy',reason:`Actual generation ${actual} kWh is treated as net; adjusted expected generation is ${round(effectiveExpected)} kWh and is a comparison reference, not added supply. Possible weather, shading, soiling, or inverter differences are not confirmed faults.`,benefit:generationShortfall>0?`Estimated generation gap: ${round(generationShortfall)} kWh versus the adjusted reference; this is not a confirmed recoverable amount.`:`${round(aligned)} kWh of demand shifted into modeled solar coincidence; demand remains served.`,assumptions:`Baseline coincidence assumes 75% of demand overlaps the solar window; optimized coincidence can reach 100%. Grid draw never falls below demand − actual generation. Expected = expected × ${x.efficiency}% inverter efficiency × (1 − ${x.loss}% assumed loss).`}};
}
export const dcDefaults={capacity:80,efficiency:90,selectedJob:'all',rates:defaultRates,deadlines:Object.fromEntries(jobs.map(j=>[j.id,j.deadline])) as Record<string,number>};
export type DCInput={capacity:number;efficiency:number;selectedJob:string;rates:Slot[];deadlines:Record<string,number>};
type Placement={job:Job;slot:number;server:string;status:string;why:string};
function schedule(x:DCInput,optimize:boolean){
 const chosen=jobs.filter(j=>x.selectedJob==='all'||j.id===x.selectedJob), used:Record<string,number[]>={A:[0,0,0,0],B:[0,0,0,0],C:[0,0,0,0]}, placements:Placement[]=[];
 for(const source of [...chosen].sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]-({High:0,Medium:1,Low:2}[b.priority])))){
  const job={...source,energy:source.energy*90/clamp(x.efficiency,50,100),deadline:x.deadlines?.[source.id]??source.deadline};
  let best:{slot:number;server:string;score:number}|null=null;
  for(let s=0;s<4;s++){if(s+job.duration>x.rates.length||s+job.duration>job.deadline)continue;
   for(const server of job.servers){const serverLoad=used[server]??[0,0,0,0],cap=clamp(x.capacity,10,300);
    const load=serverLoad.slice(s,s+job.duration).reduce((a,b)=>a+b,0);
    if(serverLoad.slice(s,s+job.duration).some(v=>v+job.energy/job.duration>cap))continue;
    const rate=x.rates.slice(s,s+job.duration).reduce((a,r)=>a+(optimize?r.price+r.carbon*4:r.price),0);
     const score=optimize
      ? rate*job.energy/100+load/cap+(server==='A'?.01:server==='B'?.02:.03)
      : s+(server==='A'?.001:server==='B'?.002:.003);
    if(!best||score<best.score)best={slot:s,server,score};
   }}
  if(best){for(let s=best.slot;s<best.slot+job.duration;s++)used[best.server][s]+=job.energy/job.duration;
   placements.push({job,slot:best.slot,server:best.server,status:'Scheduled',why:`Feasible on ${best.server}; ${optimize?'lowest combined price/carbon score':'earliest feasible slot'} within deadline.`});
  }else placements.push({job,slot:-1,server:'—',status:'No feasible slot',why:'No tested slot/server met duration, deadline and capacity constraints.'});
 }
 return placements;
}
function dcMetrics(x:DCInput,placements:Placement[]){
 let energy=0,cost=0,em=0;
 placements.filter(p=>p.slot>=0).forEach(p=>{energy+=p.job.energy;for(let i=p.slot;i<p.slot+p.job.duration;i++){cost+=p.job.energy/p.job.duration*x.rates[i].price;em+=p.job.energy/p.job.duration*x.rates[i].carbon;}});
 return {energy,cost,em};
}
export function dataCenterRun(x:DCInput):Scenario<DCInput>&{baselinePlacements:Placement[];optimizedPlacements:Placement[]}{
 const bp=schedule(x,false),op=schedule(x,true), b=dcMetrics(x,bp),o=dcMetrics(x,op);
 return {baseline:{...x},optimized:{...x},metrics:metricSet(o.energy,0,o.cost,o.em,{energy:b.energy,cost:b.cost,emissions:b.em},op.filter(p=>p.slot>=0).length),ranAt:new Date().toISOString(),baselinePlacements:bp,optimizedPlacements:op,
 recommendation:{condition:'Flexible jobs have several feasible server/slot combinations',action:'Schedule by a transparent combined price and carbon score',reason:'A deterministic search checks feasible servers, capacity, duration and deadline for each selected job.',benefit:`Estimated comparison: ${round(b.cost-o.cost,2)} cost units and ${round(b.em-o.em,2)} kgCO₂e.`,assumptions:`Heuristic only, not guaranteed optimal. Sample job energy scales from its 90% reference by 90 ÷ ${x.efficiency}% server efficiency; adjusted energy is used for capacity, price and emissions.`}};
}
export const homeDefaults={solar:5.2,base:2.2,battery:8,soc:3,price:7.8,carbon:.64,powerLimit:5,appliances:appliances.map(a=>({...a}))};
export type HomeInput=typeof homeDefaults;
function homeCalc(x:HomeInput,opt:boolean){
  const loads:Appliance[]=(Array.isArray(x.appliances)?x.appliances:appliances).map(l=>({...l,energy:clamp(Number(l.energy)||0,0,40)}));
 const total=loads.reduce((a,l)=>a+l.energy,0), solar=clamp(x.solar,0,40), base=clamp(x.base,0,20);
 // The modeled appliance requests are flexible energy amounts across sequential one-hour windows.
 // Remaining instantaneous household headroom is the maximum battery discharge rate for this window.
 let usableBattery=opt?Math.min(clamp(x.soc,0,x.battery),Math.max(0,x.powerLimit-base)):0;
 let renewable=Math.min(solar,base), remainingSolar=solar-renewable;
 const allocations=[...loads].sort((a,b)=>a.priority-b.priority).map(l=>{let renewableUse=0,batteryUse=0;
  const solarAccessible=l.window==='Any time today'||l.window==='09:00–20:00'||l.window==='12:00–18:00 solar window';
  if(opt&&solarAccessible&&remainingSolar>0){renewableUse=Math.min(l.energy,remainingSolar);remainingSolar-=renewableUse;}
  if(opt&&l.flexible&&l.priority<=2&&usableBattery>0&&renewableUse<l.energy){batteryUse=Math.min(l.energy-renewableUse,usableBattery);usableBattery-=batteryUse;}
  const headroom=Math.max(0,x.powerLimit-base), windows=headroom>0?Math.max(1,Math.ceil(l.energy/headroom)):0;
  return {id:l.id,name:l.name,kWh:l.energy,renewable:renewableUse,battery:batteryUse,grid:l.energy-renewableUse-batteryUse,plan:renewableUse?'Solar window':batteryUse?'Battery support':'Grid / scheduled',windows,window:l.window};
 });
 // baseline serves base + all appliances from grid; optimized allocates solar once, then battery discharge.
 const renewableUsed=Math.min(solar,base)+allocations.reduce((a,l)=>a+l.renewable,0);
 const batteryDischarge=allocations.reduce((a,l)=>a+l.battery,0), energy=base+total;
 const grid=Math.max(0,energy-renewableUsed-batteryDischarge), cost=grid*x.price, emissions=grid*x.carbon;
  // Charge during one modeled hour only; respect the same household power headroom.
  const charge=Math.min(Math.max(0,x.battery-clamp(x.soc,0,x.battery)+batteryDischarge),Math.max(0,solar-renewableUsed),Math.max(0,clamp(x.powerLimit,.1,20)-base));
 return {energy,renewableUsed,grid,cost,emissions,allocations,batteryEnd:clamp(x.soc,0,x.battery)-batteryDischarge+charge,solarSurplus:Math.max(0,solar-renewableUsed-charge)};
}
export function homeRun(x:HomeInput):Scenario<HomeInput>&{allocation:ReturnType<typeof homeCalc>['allocations'];batteryEnd:number;gridImport:number;solarSurplus:number;baseInfeasible:boolean}{
 const b=homeCalc(x,false),o=homeCalc(x,true);
 return {baseline:{...x},optimized:{...x},metrics:metricSet(o.energy,o.renewableUsed,o.cost,o.emissions,{energy:b.energy,cost:b.grid*x.price,emissions:b.grid*x.carbon},o.renewableUsed>0?1:0),ranAt:new Date().toISOString(),allocation:o.allocations,batteryEnd:o.batteryEnd,gridImport:o.grid,solarSurplus:o.solarSurplus,baseInfeasible:x.base>x.powerLimit,
  recommendation:{condition:x.solar>x.base?'Solar remains after household base demand':'Solar is below household base demand',action:'Allocate solar once to base demand, then flexible appliances; use stored energy only within power limits',reason:'Priority order preserves requested loads and the battery never appears as newly generated energy.',benefit:`${round(o.renewableUsed)} kWh modeled useful solar; ${round(o.grid)} kWh grid import.`,assumptions:`Appliance requests total ${round((x.appliances??appliances).reduce((a,l)=>a+l.energy,0))} kWh. Maximum battery discharge respects remaining power limit; charging is limited by available solar and capacity.`}};
}
export const defaults={warehouse:warehouseDefaults,solar:solarDefaults,datacenter:dcDefaults,home:homeDefaults};
export function solarDisplay(x:SolarInput){
 const expected=clamp(x.expected,0,400)*clamp(x.efficiency,50,100)/100*(1-clamp(x.loss,0,60)/100);
 const actual=clamp(x.actual,0,400),demand=clamp(x.demand,0,400);
  return {expected,actual,demand,utilization:actual?clamp(demand/actual*100,0,100):0,surplus:Math.max(0,actual-demand),shortfall:Math.max(0,expected-actual),demandShortfall:Math.max(0,demand-actual),efficiency:clamp(x.efficiency,50,100)};
}
export function solarTrend(actual:number,demand:number){
 const generationShape=[0,.08,.25,.57,.9,1,.76,.32],demandShape=[.5,.48,.52,.62,.78,.9,.72,.6];
 return generationShape.map((shape,i)=>({time:`${String(7+i*2).padStart(2,'0')}:00`,generation:actual*shape,demand:demand*demandShape[i]}));
}
export function warehouseZones(target:number){
 const t=safeWarehouseTarget(target);
 return ['A · intake','B · storage','C · dispatch','D · reserve'].map((name,i)=>({name,temperature:t+[-.2,.3,-.6,.1][i]}));
}
export function safeWarehouseTarget(target:number){return clamp(target,-22,-16)}
export function dashboardTrend(range:'24h'|'7d',energy:number,generation:number){
 const shape=range==='24h'?[.62,.58,.68,.92,1.12,1.05,.82,.74]:[.84,.92,.78,1.08,.96,1.16,.88];
 const solarShape=[.02,.12,.38,.72,1,.74,.32,.05];
 return shape.map((factor,i)=>({name:range==='24h'?`${String(i*3).padStart(2,'0')}:00`:`Day ${i+1}`,use:Math.round(energy/8*factor*10)/10,solar:Math.round(generation/8*solarShape[i%8]*10)/10}));
}
export function renewablePct(useful:number,available:number){return available>0?clamp(useful/available*100,0,100):0}
export function aggregateMetrics(results:{metrics:Metrics}[]){
 return results.reduce((a,r)=>{const m=r.metrics;return {...a,energy:a.energy+m.energy,renewable:a.renewable+m.renewable,cost:a.cost+m.cost,emissions:a.emissions+m.emissions,savingsEnergy:a.savingsEnergy+m.savingsEnergy,savingsCost:a.savingsCost+m.savingsCost,savingsEmissions:a.savingsEmissions+m.savingsEmissions,opportunities:a.opportunities+m.opportunities}}, {energy:0,renewable:0,cost:0,emissions:0,savingsEnergy:0,savingsCost:0,savingsEmissions:0,opportunities:0});
}
export function scenarioPair(m:Metrics){return {baseline:{energy:m.energy+m.savingsEnergy,cost:m.cost+m.savingsCost,emissions:m.emissions+m.savingsEmissions},optimized:{energy:m.energy,cost:m.cost,emissions:m.emissions}}}
export function comparisonSeries(m:Metrics){const pair=scenarioPair(m);return [{name:'Energy kWh',baseline:pair.baseline.energy,optimized:pair.optimized.energy},{name:'Cost ₹',baseline:pair.baseline.cost,optimized:pair.optimized.cost},{name:'CO₂e kg',baseline:pair.baseline.emissions,optimized:pair.optimized.emissions}]}
export function comparisonBars(data:{name:string;baseline:number;optimized:number}[]){return data.map(d=>{const max=Math.max(Math.abs(d.baseline),Math.abs(d.optimized),.001);return {...d,baselineWidth:Math.abs(d.baseline)/max*100,optimizedWidth:Math.abs(d.optimized)/max*100}})}
