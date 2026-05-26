import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getOrCreateCustomer } from './lib/auth';
import { OnboardWelcome, OnboardSignup, OnboardCardReady } from './screens/Onboarding';
import Home from './screens/Home';
import Tienda from './screens/Tienda';
import MiSelva from './screens/MiSelva';
import MiTarjeta from './screens/MiTarjeta';
import Yo from './screens/Yo';
import Producto from './screens/Producto';
import Calculadora from './screens/Calculadora';

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--c-bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid var(--c-green-light)',
          borderTopColor: '#1A3C2E',
          animation: 'spinSlow 0.8s linear infinite',
          margin: '0 auto 16px',
        }}/>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: '#1A3C2E', letterSpacing: '0.12em' }}>SELVA GARDEN</p>
      </div>
    </div>
  );
}

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [view, setView] = useState('onboard1');
  const [tab, setTab] = useState('home');
  const [storeMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setAuthChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setCustomer(null);
        setView('onboard1');
        setAuthChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleUser(user) {
    try {
      const { customer: c, isNew } = await getOrCreateCustomer(user);
      setCustomer(c);
      setView(isNew ? 'onboard3' : 'main');
    } catch (e) {
      console.error('Auth error:', e);
      setView('main');
    } finally {
      setAuthChecked(true);
    }
  }

  if (!authChecked) return <LoadingScreen/>;

  const goTab = (t) => { setView('main'); setTab(t); };
  const goProduct = () => setView('product');
  const goCalc = () => setView('calc');
  const goBack = () => setView('main');

  if (view === 'calc') {
    return (
      <div className="calc-shell">
        <button className="calc-back-btn" onClick={goBack}>← Volver a la app</button>
        <Calculadora onBack={goBack}/>
      </div>
    );
  }

  let content;
  if (view === 'onboard1') {
    content = <OnboardWelcome onNext={() => setView('onboard2')}/>;
  } else if (view === 'onboard2') {
    content = <OnboardSignup onBack={() => setView('onboard1')}/>;
  } else if (view === 'onboard3') {
    content = <OnboardCardReady customer={customer} onNext={() => setView('main')}/>;
  } else if (view === 'product') {
    content = <Producto onBack={goBack}/>;
  } else {
    if (tab === 'home')  content = <Home storeMode={storeMode} onTab={goTab} onProduct={goProduct} customer={customer}/>;
    if (tab === 'shop')  content = <Tienda onTab={goTab} onProduct={goProduct}/>;
    if (tab === 'selva') content = <MiSelva onTab={goTab} customer={customer}/>;
    if (tab === 'card')  content = <MiTarjeta storeMode={storeMode} onTab={goTab} customer={customer}/>;
    if (tab === 'me')    content = <Yo onTab={goTab} onCalc={goCalc} customer={customer}/>;
  }

  return <div className="app-shell">{content}</div>;
}
