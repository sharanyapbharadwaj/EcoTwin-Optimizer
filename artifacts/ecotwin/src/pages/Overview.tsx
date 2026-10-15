import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Activity, ArrowRight, ArrowUpRight, BatteryCharging, CloudSun, Cpu, Leaf, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CompareChart } from '@/components/Charts';
import { MetricCard, MiniBadge, PageHeader, Panel } from '@/components/Ui';
import { aggregateMetrics, comparisonSeries, dashboardTrend, dataCenterRun, dcDefaults, homeDefaults, homeRun, renewablePct, solarDefaults, solarRun, warehouseDefaults, warehouseRun } from '@/lib/engine';
import { events } from '@/lib/sampleData';

function stored(key:string,fallback:any){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}}
export default function Overview(){
 const [range,setRange]=useState<'24h'|'7d'>('24h');
 const {results,inputs}=useMemo(()=>{
  const defaults:any={warehouse:warehouseDefaults,solar:solarDefaults,datacenter:dcDefaults,home:homeDefaults};
  const runners:any={warehouse:warehouseRun,solar:solarRun,datacenter:dataCenterRun,home:homeRun};
  const values:any={};const scenarios:any[]=[];
  Object.keys(defaults).forEach(id=>{
   const sample=defaults[id],savedInput=stored(`ecotwin-input-${id}`,{});
   const input={...sample,...savedInput};
   if(id==='datacenter'){input.rates=Array.isArray(savedInput.rates)?sample.rates.map((r:any,i:number)=>({...r,...(savedInput.rates[i]??{})})):sample.rates;input.deadlines={...sample.deadlines,...(savedInput.deadlines??{})};}
   if(id==='home')input.appliances=Array.isArray(savedInput.appliances)?sample.appliances.map((a:any,i:number)=>({...a,...(savedInput.appliances[i]??{})})):sample.appliances;
   values[id]=input;
   const savedScenario=stored(`ecotwin-scenario-${id}`,null);
   scenarios.push(savedScenario?.metrics&&savedScenario?.recommendation?savedScenario:runners[id](input));
  });
  return {results:scenarios,inputs:values};
 },[]);
 const total=aggregateMetrics(results);
 const generation=Number(inputs.solar.actual)+Number(inputs.home.solar);
 const utilization=renewablePct(total.renewable,generation);
  const modules=[
  {id:'warehouse',href:'/warehouse',name:'Cold-chain warehouse',sub:'Thermal load & safe cooling',value:`${inputs.warehouse.coolingKw} kW · ${inputs.warehouse.duration}h`,icon:Activity,tone:'emerald',status:'Safe band enforced'},
  {id:'solar',href:'/solar',name:'Smart solar optimizer',sub:'Generation / use alignment',value:`${inputs.solar.actual} kWh generation`,icon:CloudSun,tone:'cyan',status:'Window modeled'},
  {id:'datacenter',href:'/datacenter',name:'Data-center scheduler',sub:'Flexible compute jobs',value:`${inputs.datacenter.capacity} kWh / slot`,icon:Cpu,tone:'violet',status:'Heuristic ready'},
  {id:'home',href:'/home',name:'Home energy reuse hub',sub:'Solar, battery & appliances',value:`${inputs.home.soc} / ${inputs.home.battery} kWh stored`,icon:BatteryCharging,tone:'amber',status:'Local plan ready'},
 ];
  const recommendationModules=[
   {name:'Cold-chain warehouse',href:'/warehouse'},
   {name:'Smart solar optimizer',href:'/solar'},
   {name:'Data-center scheduler',href:'/datacenter'},
   {name:'Home energy reuse hub',href:'/home'},
  ];
 const points=dashboardTrend(range,total.energy,generation);
 const compare=comparisonSeries(total);
 return <div className="space-y-7 fade-in">
  <PageHeader eyebrow="Campus energy / Overview" title="A clearer picture of campus energy." description="Four independent digital twins, one explainable view. Every value below is simulated locally; savings are estimates, not measured outcomes." action={<div className="flex items-center gap-2 rounded-lg border border-[#26384d] bg-[#101b2a] px-3 py-2 text-[10px] text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400"/>Local simulation active</div>}/>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
   <MetricCard testId="metric-total-energy" label="Energy consumption" value={total.energy.toFixed(1)} unit="kWh · modeled" icon={<Zap size={17}/>} change={`${total.savingsEnergy.toFixed(1)} kWh estimated avoided`} />
   <MetricCard testId="metric-renewable-generation" label="Renewable generation" value={generation.toFixed(1)} unit="kWh available" icon={<CloudSun size={17}/>} accent="cyan"/>
   <MetricCard testId="metric-estimated-cost" label="Estimated cost" value={`₹${total.cost.toFixed(0)}`} unit="modeled tariff" icon={<Activity size={17}/>} accent="amber" change={`₹${total.savingsCost.toFixed(1)} estimated savings`}/>
   <MetricCard testId="metric-co2e" label="Carbon emissions" value={total.emissions.toFixed(1)} unit="kg CO₂e" icon={<Leaf size={17}/>} accent="violet" change={`${total.savingsEmissions.toFixed(1)} kg estimated reduction`}/>
  </div>
  <div className="grid gap-4 xl:grid-cols-[1.5fr_.8fr]">
   <Panel title="Energy rhythm" subtitle="Illustrative demand and generation profile · no live meter data" aside={<div className="flex rounded-lg border border-[#27394e] bg-[#0c1726] p-1">{(['24h','7d'] as const).map(v=><button key={v} onClick={()=>setRange(v)} className={`rounded-md px-3 py-1 text-[10px] ${range===v?'bg-emerald-400/15 text-emerald-200':'text-slate-500'}`} data-testid={`button-trend-${v}`}>{v}</button>)}</div>}>
    <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{top:8,right:5,left:-22,bottom:0}}><defs><linearGradient id="dashUse" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1fc480" stopOpacity={.25}/><stop offset="100%" stopColor="#1fc480" stopOpacity={0}/></linearGradient><linearGradient id="dashSolar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#42c4d8" stopOpacity={.2}/><stop offset="100%" stopColor="#42c4d8" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#25364a" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="name" tick={{fill:'#7f91a5',fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#7f91a5',fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#111d2d',border:'1px solid #2a3d52',borderRadius:9,fontSize:11}}/><Area type="monotone" dataKey="use" name="Consumption (kWh)" stroke="#20c681" strokeWidth={2} fill="url(#dashUse)"/><Area type="monotone" dataKey="solar" name="Renewable generation (kWh)" stroke="#42c4d8" strokeWidth={2} fill="url(#dashSolar)"/></AreaChart></ResponsiveContainer></div>
    <div className="mt-1 flex gap-4 text-[10px] text-slate-500"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400"/>Consumption</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-cyan-300"/>Generation</span></div>
   </Panel>
   <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
    <Panel title="Renewable utilization" subtitle="Useful renewable consumed / available generation"><div className="flex items-center gap-5"><div className="relative grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full" style={{background:`conic-gradient(#1fc480 ${utilization*3.6}deg,#1e3043 0deg)`}}><div className="grid h-[82px] w-[82px] place-items-center rounded-full bg-[#111d2d]"><span className="mono text-xl">{utilization.toFixed(0)}<small className="text-xs text-slate-500">%</small></span></div></div><div><div className="mono text-lg text-emerald-300">{total.renewable.toFixed(1)} <small className="text-xs text-slate-500">kWh used</small></div><div className="mt-1 text-xs text-slate-500">of {generation.toFixed(1)} kWh simulated generation</div><div className="mt-3 text-[10px] text-slate-600">Across independent solar and home twins</div></div></div></Panel>
    <Panel title="Savings opportunity" subtitle="Baseline minus optimized estimates"><div className="flex items-end justify-between"><div><div className="label-caps">Current modeled savings</div><div className="metric-value mt-2 text-3xl text-emerald-300">₹{total.savingsCost.toFixed(2)}</div><div className="mt-1 text-[10px] text-slate-500">{total.savingsEnergy.toFixed(1)} kWh · {total.savingsEmissions.toFixed(1)} kgCO₂e estimated</div></div><div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><ArrowUpRight size={22}/></div></div><div className="mt-4 flex items-center justify-between border-t border-[#25364a] pt-3"><span className="text-[11px] text-slate-500">Actionable rule-based opportunities</span><span className="mono text-sm text-cyan-200">{total.opportunities}</span></div></Panel>
   </div>
  </div>
  <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
   <Panel title="Connected digital twins" subtitle="Each module runs independently on editable sample inputs." aside={<MiniBadge>4 of 4 ready</MiniBadge>}>
    <div className="grid gap-2 sm:grid-cols-2">{modules.map(({id,href,name,sub,value,icon:Icon,tone,status})=><Link href={href} key={id} className="group flex items-center gap-3 rounded-xl border border-[#27394e] bg-[#0d1827] p-3.5 transition-colors hover:border-emerald-400/30 hover:bg-[#122338]" data-testid={`link-module-${id}`}><span className={`grid h-10 w-10 place-items-center rounded-lg ${tone==='cyan'?'bg-cyan-400/10 text-cyan-300':tone==='violet'?'bg-violet-400/10 text-violet-300':tone==='amber'?'bg-amber-400/10 text-amber-300':'bg-emerald-400/10 text-emerald-300'}`}><Icon size={19}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-200">{name}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{sub}</span><span className="mt-2 block mono text-[10px] text-slate-400">{value} <span className="font-sans text-slate-600">· {status}</span></span></span><ArrowRight className="text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-300" size={15}/></Link>)}</div>
   </Panel>
   <Panel title="Baseline vs optimized" subtitle="Summed independent module estimates; no generation counted as consumption." aside={<MiniBadge tone="cyan">Scenario comparison</MiniBadge>}><div className="h-[215px]"><CompareChart data={compare}/></div></Panel>
  </div>
  <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
   <Panel title="Recent simulated events" subtitle="Representative events generated from demo rules." aside={<MiniBadge>Simulated</MiniBadge>}><div className="grid gap-2 sm:grid-cols-3">{events.map((e,i)=><div key={e.title} className="rounded-lg border border-[#26384d] bg-[#0d1827] p-3" data-testid={`event-card-${i}`}><div className="flex items-center justify-between"><span className="mono text-[10px] text-cyan-300">{e.time}</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/></div><div className="mt-2 text-xs font-semibold text-slate-200">{e.title}</div><div className="mt-1 text-[10px] leading-relaxed text-slate-500">{e.detail}</div></div>)}</div></Panel>
    <div className="space-y-4">
     <Panel title="Rule-based recommendations" subtitle="Simulated conditions and estimated next actions."><div className="space-y-2">{results.map((result:any,i:number)=><div key={recommendationModules[i].href} className="rounded-lg border border-[#26384d] bg-[#0d1827] p-3" data-testid={`recommendation-${recommendationModules[i].href.slice(1)}`}><div className="flex items-center justify-between gap-3"><span className="text-[11px] font-semibold text-slate-200">{recommendationModules[i].name}</span><MiniBadge tone="cyan">Simulated</MiniBadge></div><div className="mt-1 text-[10px] text-cyan-200">{result.recommendation.condition}</div><p className="mt-1 text-[10px] leading-relaxed text-slate-500">{result.recommendation.action}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="min-w-0 truncate text-[9px] text-slate-600">{result.recommendation.benefit}</span><Link href={recommendationModules[i].href} className="shrink-0 text-[10px] text-cyan-300" data-testid={`link-recommendation-${recommendationModules[i].href.slice(1)}`}>Open twin <ArrowRight className="inline" size={11}/></Link></div></div>)}</div></Panel>
     <Panel title="Calculation note" subtitle="Every estimate stays inspectable."><div className="space-y-3 text-[11px] leading-relaxed text-slate-400"><p><b className="text-slate-200">Cost</b> applies each scenario’s tariff to modeled grid energy.</p><p><b className="text-slate-200">Emissions</b> apply its stated carbon intensity; no live grid factor is queried.</p><Link href="/about" className="inline-flex items-center gap-1 text-cyan-300" data-testid="link-dashboard-method">Read methodology <ArrowRight size={13}/></Link></div></Panel>
    </div>
  </div>
 </div>
}
