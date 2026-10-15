import { Link } from 'wouter';
import { ArrowLeft, BookOpen, CircleCheck, Equal, Info, ShieldCheck } from 'lucide-react';
import { PageHeader, Panel } from '@/components/Ui';
export default function About(){
 const formulas=[
  ['Cost','kWh × tariff','Each time window uses its own modeled price where available. Cost is in ₹.'],
  ['Emissions','kWh × carbon intensity','Carbon intensity is a local scenario assumption in kgCO₂e per kWh.'],
  ['Savings','baseline − optimized','Savings may be negative when the optimized plan performs worse.'],
  ['Renewable utilization','useful renewable consumed ÷ available renewable × 100','Generation is not added to consumption. Battery discharge is stored energy, never new generation.'],
 ];
 return <div className="space-y-6 fade-in">
  <PageHeader eyebrow="Reference / product method" title="Know what the model assumes." description="EcoTwin is a college-project demonstrator: a transparent local sandbox connecting four independent simulated twins. It is not a live monitoring or control system." action={<Link href="/" className="btn-quiet flex items-center gap-2 text-xs" data-testid="link-back-overview"><ArrowLeft size={14}/>Overview</Link>}/>
  <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
   <Panel title="Core formulas" subtitle="Shared language across module comparisons." aside={<Equal size={16} className="text-cyan-300"/>}><div className="space-y-2">{formulas.map(([name,formula,detail])=><div key={name} className="grid gap-2 rounded-lg border border-[#26384d] bg-[#0d1827] p-3 sm:grid-cols-[150px_1fr]"><div className="text-xs font-semibold text-slate-200">{name}</div><div><code className="mono text-xs text-emerald-200">{formula}</code><p className="mt-1 text-[10px] leading-relaxed text-slate-500">{detail}</p></div></div>)}</div></Panel>
   <Panel title="Trust boundaries" subtitle="What EcoTwin intentionally does not do."><div className="space-y-3">{[
    ['Local simulation only','No login, database, API calls, paid services or remote persistence. Scenario inputs stay in this browser’s localStorage.'],
    ['No live claims','No real sensor, weather, inverter, appliance, server or hardware feeds are connected.'],
    ['Rule-based templates','Recommendations are deterministic local rules labelled simulated/estimated—not machine learning or verified diagnoses.'],
    ['Separate twins','Warehouse, solar, data center and home figures are modeled independently; summed estimates are illustrative, not a physically coupled campus balance.'],
   ].map(([title,desc])=><div key={title} className="flex gap-3 rounded-lg border border-[#26384d] bg-[#0d1827] p-3"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-300"/><div><div className="text-xs font-semibold text-slate-200">{title}</div><div className="mt-1 text-[10px] leading-relaxed text-slate-500">{desc}</div></div></div>)}</div></Panel>
  </div>
  <Panel title="Model notes by digital twin" subtitle="Each page exposes its editable inputs and resulting comparison.">
   <div className="grid gap-3 md:grid-cols-2">{[
     {href:'/warehouse',title:'Cold-chain warehouse',body:'Cooling energy = cooling kW × disclosed ambient/setpoint factor × thermal-load factor × duration. Thermal load modifies estimated cooling demand and is not added again as a separate energy load. Optional pre-cooling applies an explicit 5% runtime allowance; a tariff shift alone creates no energy savings. The assumed target band is −22°C to −16°C.'},
    {href:'/solar',title:'Smart solar optimizer',body:'Expected reference = expected generation × inverter efficiency × (1 − assumed loss). Actual is treated as already net of losses. Useful renewable = min(actual generation, demand). Optimization aligns a limited share of surplus to demand; it cannot invent generation.'},
    {href:'/datacenter',title:'Data-center scheduler',body:'A deterministic search checks sample jobs against their feasible servers, run duration, deadline and capacity. Candidate placements score time-slot price and carbon intensity. The result is a heuristic, not guaranteed optimal. Sample energy scales from its 90% reference by 90 ÷ server efficiency, and that adjusted energy is used consistently for load, price and emissions.'},
    {href:'/home',title:'Home energy reuse hub',body:'Base demand and appliance requests are served. Solar is allocated once, first to base demand and then to appliance use. Battery discharge is constrained and does not count as renewable generation. Unused solar may charge within the capacity ceiling.'},
   ].map(m=><Link key={m.href} href={m.href} className="group rounded-xl border border-[#26384d] bg-[#0d1827] p-4 hover:border-emerald-400/30" data-testid={`link-method-${m.href.slice(1)}`}><div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-200">{m.title}<BookOpen size={14} className="text-slate-600 group-hover:text-emerald-300"/></div><p className="text-[11px] leading-relaxed text-slate-500">{m.body}</p></Link>)}</div>
  </Panel>
  <div className="grid gap-4 sm:grid-cols-2"><div className="panel-soft flex gap-3 p-4"><CircleCheck size={17} className="shrink-0 text-emerald-300"/><div><div className="text-xs font-semibold">Safe, visible boundaries</div><div className="mt-1 text-[10px] text-slate-500">No direct control or unsafe thermal excursions are modeled.</div></div></div><div className="panel-soft flex gap-3 p-4"><Info size={17} className="shrink-0 text-cyan-300"/><div><div className="text-xs font-semibold">Reset any time</div><div className="mt-1 text-[10px] text-slate-500">Use “Reset demo” in the top bar to clear saved scenarios and restore defaults.</div></div></div></div>
 </div>
}
