import type { Appliance, Job, Slot } from './types';
export const defaultRates: Slot[] = [
  { name:'00–06', price:5.8, carbon:0.56 }, { name:'06–12', price:8.2, carbon:0.68 },
  { name:'12–18', price:7.1, carbon:0.39 }, { name:'18–24', price:9.4, carbon:0.72 },
];
export const jobs: Job[] = [
  { id:'render', name:'Research render batch', duration:2, energy:42, deadline:3, priority:'High', servers:['A','B'] },
  { id:'backup', name:'Campus archive backup', duration:1, energy:18, deadline:4, priority:'Low', servers:['B','C'] },
  { id:'sim', name:'Climate model run', duration:3, energy:66, deadline:4, priority:'High', servers:['A','C'] },
  { id:'index', name:'Library search indexing', duration:1, energy:15, deadline:2, priority:'Medium', servers:['A','B','C'] },
];
export const appliances: Appliance[] = [
  {id:'water',name:'Water heater',energy:2.4,priority:1,window:'Any time today',flexible:true},
  {id:'wash',name:'Washing machine',energy:1.1,priority:2,window:'09:00–20:00',flexible:true},
  {id:'charge',name:'Device charging',energy:.7,priority:3,window:'Any time today',flexible:true},
  {id:'other',name:'Other flexible load',energy:1.8,priority:4,window:'Any time today',flexible:true},
];
export const events = [
  {time:'09:42',title:'Solar window opened',detail:'Simulated surplus available for flexible loads.',type:'renewable'},
  {time:'09:18',title:'Cold zone stable',detail:'All modeled zones remain inside the safe band.',type:'status'},
  {time:'08:55',title:'Job placement suggested',detail:'Climate model has a lower-carbon feasible slot.',type:'compute'},
];
