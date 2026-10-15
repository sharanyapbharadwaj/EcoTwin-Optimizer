import type { ReactNode } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { comparisonBars, solarTrend } from '@/lib/engine';
import { Panel } from './Ui';
const axis={fill:'#7f91a5',fontSize:10};
const tooltipStyle={background:'#111d2d',border:'1px solid #2a3d52',borderRadius:9,color:'#e7edf4',fontSize:11};
export function TrendChart({data}:{data:{name:string;use:number;solar:number}[]}){
 return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{top:6,right:8,left:-22,bottom:0}}><defs><linearGradient id="useFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20c681" stopOpacity={.25}/><stop offset="95%" stopColor="#20c681" stopOpacity={0}/></linearGradient><linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#49c8da" stopOpacity={.22}/><stop offset="95%" stopColor="#49c8da" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#25364a" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle}/><Area type="monotone" dataKey="use" name="Consumption (kWh)" stroke="#22ca86" strokeWidth={2} fill="url(#useFill)"/><Area type="monotone" dataKey="solar" name="Renewable (kWh)" stroke="#49c8da" strokeWidth={2} fill="url(#solarFill)"/></AreaChart></ResponsiveContainer>
}
export function CompareChart({data}:{data:{name:string;baseline:number;optimized:number}[]}){
 const rows=comparisonBars(data);
 return <div className="space-y-4" aria-label="Baseline and optimized comparisons">
  {rows.map((r,i)=><div key={r.name} data-testid={`comparison-bar-${i}`}><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-medium text-slate-300">{r.name}</span><span className="mono text-[9px] text-slate-600">Each row scaled independently</span></div><div className="space-y-1.5"><div className="flex items-center gap-2"><span className="w-[62px] text-[9px] text-slate-500">Baseline</span><div className="h-2 flex-1 rounded-full bg-[#1c2b3c]"><div className="h-full rounded-full bg-[#60738a]" style={{width:`${r.baselineWidth}%`}}/></div><span className="mono w-[76px] text-right text-[10px] text-slate-400">{r.baseline.toFixed(1)}</span></div><div className="flex items-center gap-2"><span className="w-[62px] text-[9px] text-slate-500">Optimized</span><div className="h-2 flex-1 rounded-full bg-[#1c2b3c]"><div className="h-full rounded-full bg-emerald-400" style={{width:`${r.optimizedWidth}%`}}/></div><span className="mono w-[76px] text-right text-[10px] text-emerald-200">{r.optimized.toFixed(1)}</span></div></div></div>)}
 </div>
}
export function SolarChart({expected,actual,demand}:{expected:number;actual:number;demand:number}){
 const data=[{name:'Modeled window',expected,actual,demand}];
 return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{top:10,right:8,left:-18,bottom:0}}><CartesianGrid stroke="#25364a" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="expected" name="Expected after assumptions" fill="#8090a1" radius={[4,4,0,0]}/><Bar dataKey="actual" name="Actual simulated" fill="#42c6d5" radius={[4,4,0,0]}/><Bar dataKey="demand" name="Demand" fill="#20c681" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
}
export function SolarTrendChart({actual,demand}:{actual:number;demand:number}){
 const points=solarTrend(actual,demand);
 return <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{top:7,right:8,left:-22,bottom:0}}><CartesianGrid stroke="#25364a" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="time" tick={axis} axisLine={false} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle}/><Line type="monotone" dataKey="generation" name="Generation (kWh index)" stroke="#42c4d8" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="demand" name="Demand (kWh index)" stroke="#20c681" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
}
export function ZoneChart({target,duration}:{target:number;duration:number}){
 const d=Array.from({length:7},(_,i)=>({time:`${String(i*4).padStart(2,'0')}:00`,normal:target+[1.7,1.1,.8,.5,.4,.3,.2][i],preCool:target+[1.5,.9,.5,.2,.1,.1,.1][i]}));
 return <ResponsiveContainer width="100%" height="100%"><LineChart data={d} margin={{top:5,right:8,left:-22,bottom:0}}><CartesianGrid stroke="#25364a" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="time" tick={axis} axisLine={false} tickLine={false}/><YAxis domain={[-22,-15]} tick={axis} axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle}/><Line type="monotone" dataKey="normal" name="Normal profile" stroke="#8594a5" dot={false}/><Line type="monotone" dataKey="preCool" name="Pre-cool profile" stroke="#20c681" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
}
export function MiniChartCard({title,children}:{title:string;children:ReactNode}){return <Panel title={title}><div className="h-[230px]">{children}</div></Panel>}
