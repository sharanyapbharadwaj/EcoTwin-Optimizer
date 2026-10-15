import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ControlRoom } from '@/components/ControlRoom';
import Overview from '@/pages/Overview';
import Warehouse from '@/pages/Warehouse';
import Solar from '@/pages/Solar';
import DataCenter from '@/pages/DataCenter';
import HomeEnergy from '@/pages/HomeEnergy';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <ControlRoom>
      <Switch>
        <Route path="/" component={Overview}/>
        <Route path="/warehouse" component={Warehouse}/>
        <Route path="/solar" component={Solar}/>
        <Route path="/datacenter" component={DataCenter}/>
        <Route path="/home" component={HomeEnergy}/>
        <Route path="/about" component={About}/>
        <Route component={NotFound}/>
      </Switch>
    </ControlRoom>
  </WouterRouter>;
}
export default App;
