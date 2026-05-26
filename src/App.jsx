import { useState } from 'react';
import { SelvaLeaf } from './icons';
import { OnboardWelcome, OnboardSignup, OnboardCardReady } from './screens/Onboarding';
import Home from './screens/Home';
import Tienda from './screens/Tienda';
import MiSelva from './screens/MiSelva';
import MiTarjeta from './screens/MiTarjeta';
import Yo from './screens/Yo';
import Producto from './screens/Producto';
import Calculadora from './screens/Calculadora';

export default function App() {
  const [view, setView] = useState('onboard1');
  const [tab, setTab] = useState('home');
  const [storeMode] = useState(false);

  const goTab = (t) => { setView('main'); setTab(t); };
  const goProduct = () => setView('product');
  const goCalc = () => setView('calc');
  const goBack = () => setView('main');

  let content;

  if (view === 'onboard1') {
    content = <OnboardWelcome onNext={() => setView('onboard2')}/>;
  } else if (view === 'onboard2') {
    content = <OnboardSignup onBack={() => setView('onboard1')} onNext={() => setView('onboard3')}/>;
  } else if (view === 'onboard3') {
    content = <OnboardCardReady onNext={() => setView('main')}/>;
  } else if (view === 'product') {
    content = <Producto onBack={goBack}/>;
  } else if (view === 'calc') {
    return (
      <div className="calc-shell">
        <button className="calc-back-btn" onClick={goBack}>
          ← Volver a la app
        </button>
        <Calculadora onBack={goBack}/>
      </div>
    );
  } else {
    if (tab === 'home')  content = <Home  storeMode={storeMode} onTab={goTab} onProduct={goProduct}/>;
    if (tab === 'shop')  content = <Tienda onTab={goTab} onProduct={goProduct}/>;
    if (tab === 'selva') content = <MiSelva onTab={goTab}/>;
    if (tab === 'card')  content = <MiTarjeta storeMode={storeMode} onTab={goTab}/>;
    if (tab === 'me')    content = <Yo onTab={goTab} onCalc={goCalc}/>;
  }

  return (
    <div className="app-shell">
      <div className="app-shell-label">
        <SelvaLeaf size={14} color="rgba(168,213,181,0.7)"/>
        <span>Selva Garden</span>
      </div>
      {content}
    </div>
  );
}
