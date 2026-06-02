import { useState, useEffect, Component } from 'react';
import { supabase } from './lib/supabase';
import { getOrCreateCustomer } from './lib/auth';
import { isAdmin } from './lib/admin';
import { CustomerProvider, useCustomer } from './context/CustomerContext';
import { OnboardWelcome, OnboardSignup, OnboardLogin, OnboardCardReady } from './screens/Onboarding';
import Home from './screens/Home';
import Tienda from './screens/Tienda';
import MiSelva from './screens/MiSelva';
import MiTarjeta from './screens/MiTarjeta';
import Yo from './screens/Yo';
import Producto from './screens/Producto';
import Calculadora from './screens/Calculadora';
import Cart from './screens/Cart';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, i) { console.error('[ErrorBoundary]', e, i); }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F5F0E8', padding:32, textAlign:'center' }}>
        <p style={{ fontFamily:'serif', fontSize:22, color:'#2D5A3D', marginBottom:12 }}>Selva Garden</p>
        <p style={{ fontSize:14, color:'#888', marginBottom:20 }}>Algo salió mal. Por favor recarga la página.</p>
        <button onClick={() => window.location.reload()} style={{ background:'#2D5A3D', color:'#fff', border:'none', borderRadius:22, padding:'12px 24px', fontSize:14, cursor:'pointer' }}>Recargar</button>
        <details style={{ marginTop:24, fontSize:11, color:'#aaa', maxWidth:320 }}>
          <summary style={{ cursor:'pointer' }}>Detalles</summary>
          <pre style={{ marginTop:8, textAlign:'left', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{this.state.error.message}</pre>
        </details>
      </div>
    );
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F0E8' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid #E8F0EA', borderTopColor:'#2D5A3D', animation:'spinSlow 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/brand/SelvaGarden_horizontal_claro_1024.png" alt="Selva Garden" style={{ height: '100%', width: 'auto', display: 'block' }}/>
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState('onboard1');
  const [tab, setTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { customer, setCustomer, cartOpen, setCartOpen } = useCustomer();

  useEffect(() => {
    if (!supabase) { setAuthChecked(true); return; }

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) handleUser(data.session.user);
      else setAuthChecked(true);
    }).catch(() => setAuthChecked(true));

    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) handleUser(session.user);
      else { setCustomer(null); setView('onboard1'); setAuthChecked(true); }
    });
    return () => data?.subscription?.unsubscribe();
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
  const goProduct = (product) => { setSelectedProduct(product); setView('product'); };
  const goBack = () => setView('main');

  if (cartOpen) return <Cart onClose={() => setCartOpen(false)}/>;

  if (view === 'calc') return (
    <div className="calc-shell">
      <button className="calc-back-btn" onClick={goBack}>← Volver a la app</button>
      <Calculadora onBack={goBack}/>
    </div>
  );

  let content;
  if      (view === 'onboard1')      content = <OnboardWelcome onNext={() => setView('onboard2')} onLogin={() => setView('onboard-login')}/>;
  else if (view === 'onboard2')      content = <OnboardSignup onBack={() => setView('onboard1')}/>;
  else if (view === 'onboard-login') content = <OnboardLogin onBack={() => setView('onboard1')}/>;
  else if (view === 'onboard3')      content = <OnboardCardReady customer={customer} onNext={() => setView('main')}/>;
  else if (view === 'product')       content = <Producto product={selectedProduct} onBack={goBack} onProduct={goProduct}/>;
  else {
    if (tab === 'home')  content = <Home  onTab={goTab} onProduct={goProduct}/>;
    if (tab === 'shop')  content = <Tienda onTab={goTab} onProduct={goProduct}/>;
    if (tab === 'selva') content = <MiSelva onTab={goTab}/>;
    if (tab === 'card')  content = <MiTarjeta onTab={goTab}/>;
    if (tab === 'me')    content = <Yo onTab={goTab}/>;
  }

  return <div className="app-shell">{content}</div>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <CustomerProvider>
        <AppInner/>
      </CustomerProvider>
    </ErrorBoundary>
  );
}
