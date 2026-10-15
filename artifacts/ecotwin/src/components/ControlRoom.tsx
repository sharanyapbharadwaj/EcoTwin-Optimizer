import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, ArrowUpRight, Bell, Boxes, ChevronRight, CircleHelp, Cpu, House, Leaf, RotateCcw, Sun, Warehouse, X } from 'lucide-react';
import { events } from '@/lib/sampleData';

const nav = [
  { href:'/', label:'Overview', icon:Activity },
  { href:'/warehouse', label:'Cold-chain warehouse', icon:Warehouse },
  { href:'/solar', label:'Smart solar optimizer', icon:Sun },
  { href:'/datacenter', label:'Data-center scheduler', icon:Cpu },
  { href:'/home', label:'Home energy hub', icon:House },
];
export function ControlRoom({children}:{children:ReactNode}){
 const [path]=useLocation(); const [notice,setNotice]=useState(false); const [mobile,setMobile]=useState(false);
 const reset=()=>{if(confirm('Reset EcoTwin settings and saved simulations to the sample defaults?')){localStorage.removeItem('ecotwin-settings');Object.keys(localStorage).filter(k=>k.startsWith('ecotwin-scenario-')||k.startsWith('ecotwin-input-')).forEach(k=>localStorage.removeItem(k));window.location.reload();}};
 return <div className="min-h-[100dvh] bg-[#0b1220] text-[#e7edf4]">
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[#19283a] bg-[#080f1b] px-4 py-6 md:flex">
   <Link href="/" className="mb-9 flex items-center gap-3 px-2" data-testid="link-brand">
    <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300"><Leaf size={21}/></div>
    <div><div className="display text-[19px] font-bold tracking-tight">EcoTwin</div><div className="mono text-[9px] uppercase tracking-[.18em] text-slate-500">Sustainability control</div></div>
   </Link>
   <div className="label-caps mb-2 px-3">Control room</div>
   <nav className="space-y-1" aria-label="Main navigation">
    {nav.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] ${path===href?'active':''}`} data-testid={`link-nav-${href==='/'
      ?'overview':href.slice(1)}`}><Icon size={17}/><span className="flex-1">{label}</span>{path===href&&<span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/>}</Link>)}
   </nav>
   <div className="label-caps mb-2 mt-8 px-3">Reference</div>
   <Link href="/about" className={`nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] ${path==='/about'?'active':''}`} data-testid="link-nav-about"><CircleHelp size={17}/>Method & assumptions</Link>
   <div className="mt-auto rounded-xl border border-[#1c3441] bg-gradient-to-br from-[#102b31] to-[#101c2b] p-4">
    <div className="mb-2 flex items-center gap-2 text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400"/><span className="label-caps !text-emerald-200">Demo environment</span></div>
    <p className="text-[11px] leading-relaxed text-slate-400">All values are simulated locally. No live sensors or hardware are connected.</p>
   </div>
  </aside>
  <div className="md:pl-[248px]">
   <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#1b2a3c] bg-[#0b1220]/95 px-4 backdrop-blur-xl md:px-8">
    <div className="flex items-center gap-3">
     <button onClick={()=>setMobile(v=>!v)} className="btn-quiet px-2 md:hidden" data-testid="button-mobile-menu" aria-label="Toggle navigation"><Boxes size={18}/></button>
     <div className="hidden text-xs text-slate-500 sm:block">Campus sustainability <ChevronRight className="mx-1 inline" size={13}/><span className="text-slate-300">{nav.find(n=>n.href===path)?.label??(path==='/about'?'Method & assumptions':'Overview')}</span></div>
     <div className="text-sm font-semibold sm:hidden">EcoTwin <span className="text-slate-600">/</span> <span className="text-slate-400">{nav.find(n=>n.href===path)?.label??(path==='/about'?'Method':'Overview')}</span></div>
    </div>
    <div className="flex items-center gap-2">
     <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:inline-flex"><span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400"/>Simulated data</span>
     <button onClick={()=>setNotice(v=>!v)} aria-label="Open simulated event notifications" className={`relative rounded-lg border p-2.5 ${notice?'border-emerald-400/40 bg-emerald-400/10':'border-[#243449] bg-[#111d2d]'} text-slate-300`} data-testid="button-notifications"><Bell size={17}/><i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300"/></button>
     <button onClick={reset} className="btn-quiet flex items-center gap-2 text-xs" data-testid="button-reset-all"><RotateCcw size={14}/><span className="hidden sm:inline">Reset demo</span></button>
    </div>
   </header>
   {mobile&&<nav className="absolute z-40 grid w-full grid-cols-2 gap-1 border-b border-[#203149] bg-[#0c1726] p-3 shadow-xl md:hidden">
    {[...nav,{href:'/about',label:'Method & assumptions',icon:CircleHelp}].map(({href,label,icon:Icon})=><Link onClick={()=>setMobile(false)} href={href} key={href} className="nav-link flex items-center gap-2 rounded-lg p-3 text-xs" data-testid={`link-mobile-${href.slice(1)||'overview'}`}><Icon size={15}/>{label}</Link>)}</nav>}
   {notice&&<div className="absolute right-4 top-[60px] z-50 w-[min(380px,calc(100vw-32px))] rounded-xl border border-[#2b4054] bg-[#111d2d] p-4 shadow-2xl" data-testid="panel-notifications">
    <div className="mb-3 flex items-center justify-between"><div><div className="font-semibold">Simulated events</div><div className="text-[11px] text-slate-500">Local demo activity · no live feed</div></div><button onClick={()=>setNotice(false)} className="text-slate-500 hover:text-white" aria-label="Close notifications" data-testid="button-close-notifications"><X size={16}/></button></div>
    {events.map(e=><div key={e.title} className="border-t border-[#223146] py-3"><div className="flex justify-between text-xs font-medium"><span>{e.title}</span><span className="mono text-[10px] text-slate-500">{e.time}</span></div><div className="mt-1 text-[11px] text-slate-400">{e.detail}</div></div>)}
    <Link href="/about" onClick={()=>setNotice(false)} className="mt-1 flex items-center gap-1 text-[11px] text-cyan-300" data-testid="link-event-method">How estimates work <ArrowUpRight size={12}/></Link>
   </div>}
   <main className="mx-auto max-w-[1580px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">{children}</main>
  </div>
 </div>
}
