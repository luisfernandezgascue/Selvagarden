import { useState, useEffect } from 'react';
import QRCodeLib from 'qrcode';
import { Phone, TabBar, SectionHeader } from '../components';
import { Icon } from '../icons';
import { useCustomer, nivelInfo, levelProgress } from '../context/CustomerContext';
import { fetchLoyaltyTransactions } from '../lib/db';
import { isAdmin } from '../lib/admin';

function RealQR({ value, size = 200 }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (!value) return;
    QRCodeLib.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: '#2D5A3D', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setDataUrl).catch(console.error);
  }, [value, size]);

  if (!value) return (
    <div style={{ width: size, height: size, background: '#F0FAF5', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Icon.QR size={40}/>
      <p style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: '0 16px' }}>Número de socio no asignado aún</p>
    </div>
  );

  if (!dataUrl) return (
    <div style={{ width: size, height: size, background: '#F0FAF5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid #E8F0EA', borderTopColor: '#2D5A3D', animation: 'spinSlow 0.8s linear infinite' }}/>
    </div>
  );

  return <img src={dataUrl} width={size} height={size} alt="QR Selva Garden" style={{ borderRadius: 12, display: 'block' }}/>;
}

function CornerCuts() {
  const s = 18;
  const piece = (orient) => ({
    position: 'absolute', width: s, height: s,
    borderColor: '#2D5A3D', borderStyle: 'solid', borderWidth: 0,
    ...(orient.includes('t') ? { top: -6, borderTopWidth: 2.5 } : { bottom: -6, borderBottomWidth: 2.5 }),
    ...(orient.includes('l') ? { left: -6, borderLeftWidth: 2.5 } : { right: -6, borderRightWidth: 2.5 }),
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={piece('tl')}/><div style={piece('tr')}/>
      <div style={piece('bl')}/><div style={piece('br')}/>
    </div>
  );
}

function Benefit({ text }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#B8956A' }}><Icon.Sparkle size={16}/></span>
      <span style={{ fontSize: 12, color: '#1A1A1A' }}>{text}</span>
    </div>
  );
}

function Tx({ date, desc, pts, positive }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--c-line-soft)' }}>
      <div>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{date}</p>
        <p style={{ fontSize: 12, color: '#1A1A1A' }}>{desc}</p>
      </div>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: positive ? '#2D5A3D' : '#B8956A' }}>{pts}</span>
    </div>
  );
}

function WalletModal({ onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#F5F0E8', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430 }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>

        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2D5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 3.2 C 9.2 5.6, 7.8 8.8, 7.8 12.4 L 12 13 L 16.2 12.4 C 16.2 8.8, 14.8 5.6, 12 3.2 Z" fill="#A8D5B5"/>
            <path d="M12 13 L 12 21" stroke="#A8D5B5" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Lleva tu tarjeta siempre contigo</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>Añade Selva Garden a tu pantalla de inicio para acceder a tu tarjeta y QR sin internet.</p>

        {installed ? (
          <div style={{ background: '#E8F0EA', borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2D5A3D' }}>¡Listo! Ya está en tu pantalla de inicio</p>
          </div>
        ) : isIOS ? (
          <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>En Safari:</p>
            {[
              ['1.', 'Toca el botón compartir (□↑) en la barra inferior'],
              ['2.', "Selecciona 'Añadir a pantalla de inicio'"],
              ['3.', "Toca 'Añadir'"],
            ].map(([n, t]) => (
              <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2D5A3D', minWidth: 18 }}>{n}</span>
                <span style={{ fontSize: 12, color: '#4A4A4A', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#888', marginTop: 8, lineHeight: 1.5 }}>Tu tarjeta Selva Garden estará siempre a un toque en tu iPhone</p>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleAndroidInstall}
            style={{ width: '100%', background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 14, fontWeight: 600, marginBottom: 16 }}
          >
            Añadir a pantalla de inicio
          </button>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Desde el menú de tu navegador:</p>
            <p style={{ fontSize: 12, color: '#4A4A4A', lineHeight: 1.6 }}>Busca la opción <strong>"Añadir a pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong> en el menú (⋮) de tu navegador.</p>
          </div>
        )}

        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#888', fontSize: 13 }}>Cerrar</button>
      </div>
    </div>
  );
}

const BENEFITS = {
  sin_nivel:  [`10% en tu primer pedido online con código BIENV-[socio]`, 'Acumula puntos en cada compra'],
  alhambra:   ['5% descuento en toda la tienda', 'Acceso anticipado a nuevas plantas', '1 taller al año incluido'],
  versailles: ['10% descuento en toda la tienda', 'Envío gratis en Caracas', 'Invitación a cenas botánicas'],
  babilonia:  ['15% descuento en toda la tienda', 'Asesoría personalizada', 'Acceso VIP a eventos', 'Regalo de cumpleaños'],
};

export default function MiTarjeta({ onTab }) {
  const { customer, storeMode } = useCustomer();
  const [transactions, setTransactions] = useState([]);
  const [walletOpen, setWalletOpen] = useState(false);

  const nombre = customer?.nombre || 'Mi Tarjeta';
  const nivel = customer?.nivel_lealtad || 'sin_nivel';
  const puntos = customer?.puntos || 0;
  const consumo = customer?.consumo_anual || 0;
  const numeroSocio = customer?.numero_socio || customer?.qr_code || null;
  const info = nivelInfo(nivel);
  const prog = levelProgress(consumo);
  const joinDate = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' })
    : 'Recientemente';

  useEffect(() => {
    if (customer?.id) fetchLoyaltyTransactions(customer.id).then(setTransactions);
  }, [customer?.id]);

  const benefits = (BENEFITS[nivel] || BENEFITS.sin_nivel).map(b =>
    b.replace('[socio]', numeroSocio || '—')
  );

  return (
    <Phone>
      <div className="scroll" style={{ padding: '8px 0 0' }}>
        <div style={{ padding: '0 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.ArrowLeft size={20}/></button>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.14em', fontWeight: 600 }}>MI TARJETA</span>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.Share size={18}/></button>
        </div>

        <div style={{ padding: '18px 18px 14px', textAlign: 'center' }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>{nombre}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {info.emoji && <span style={{ fontSize: 20 }}>{info.emoji}</span>}
            <h2 className="h-serif" style={{ fontSize: 30, fontWeight: 500 }}><span style={{ fontStyle: 'italic' }}>{info.label}</span></h2>
          </div>
          <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Miembro desde {joinDate}</p>
        </div>

        {/* QR card — store mode shows large QR for cashier scanning */}
        {storeMode && isAdmin(customer) ? (
          <div style={{ margin: '0 14px', padding: '28px 18px 24px', background: '#fff', borderRadius: 20, border: '2.5px solid #2D5A3D', boxShadow: '0 6px 30px rgba(45,90,61,0.15)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50', display: 'inline-block', animation: 'storePulse 1.5s ease-in-out infinite' }}/>
              <span style={{ fontSize: 10, color: '#2D5A3D', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Modo Tienda — Escanear</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 16 }}>
              <RealQR value={numeroSocio} size={290}/>
              <CornerCuts/>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#2D5A3D', marginBottom: 4 }}>{nombre}</p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{info.emoji} {info.label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: '#B8956A' }}>{puntos} pts</p>
          </div>
        ) : (
          <div style={{ margin: '0 14px', padding: '20px 18px', background: '#fff', borderRadius: 20, border: '1px solid var(--c-line)', boxShadow: '0 6px 30px rgba(45,90,61,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <RealQR value={numeroSocio} size={220}/>
              <CornerCuts/>
            </div>
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#888', letterSpacing: '0.1em', fontWeight: 600 }}>{numeroSocio || '—'}</p>
            <p style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: '#888' }}>Escanéalo en caja para acumular puntos</p>
          </div>
        )}

        {/* Points & progress */}
        <div style={{ margin: '18px 14px 0', padding: '16px 18px', background: 'linear-gradient(135deg, #2D5A3D, #3D7A55)', borderRadius: 16, color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Puntos acumulados</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>{puntos}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>= ${(puntos / 10).toFixed(2)} en crédito</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Consumo</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>${consumo.toFixed(0)}</p>
            </div>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, marginTop: 14, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(prog.pct * 100)}%`, background: 'linear-gradient(90deg, #A8D5B5, #B8956A)', borderRadius: 99, transition: 'width 1s ease' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{Math.round(prog.pct * 100)}% del camino</span>
            {prog.next
              ? <span style={{ fontSize: 10, color: '#D4AA6B', fontWeight: 600 }}>Faltan ${prog.remaining.toFixed(0)} para {nivelInfo(prog.next).emoji} {nivelInfo(prog.next).label}</span>
              : <span style={{ fontSize: 10, color: '#D4AA6B', fontWeight: 600 }}>¡Nivel máximo!</span>
            }
          </div>
        </div>

        <SectionHeader title="Beneficios activos"/>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {benefits.map((b, i) => <Benefit key={i} text={b}/>)}
        </div>

        <button
          onClick={() => setWalletOpen(true)}
          style={{ margin: '18px 18px 0', background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '13px', fontSize: 13, fontWeight: 600, width: 'calc(100% - 36px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Icon.Share size={16}/> Añadir a pantalla de inicio
        </button>

        <SectionHeader title="Movimientos recientes"/>
        <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column' }}>
          {transactions.length > 0 ? transactions.map((tx, i) => {
            const pts = tx.puntos_ganados > 0 ? `+${tx.puntos_ganados}` : `-${tx.puntos_usados || 0}`;
            const desc = tx.origen === 'compra' ? 'Compra en tienda'
              : tx.origen === 'bienvenida' ? 'Bono de bienvenida'
              : tx.origen === 'referido' ? 'Referido convertido'
              : tx.origen || 'Movimiento';
            return (
              <Tx
                key={tx.id || i}
                date={new Date(tx.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}
                desc={desc}
                pts={pts}
                positive={tx.puntos_ganados > 0}
              />
            );
          }) : (
            <>
              <Tx date="—" desc="Aún no tienes movimientos" pts="0" positive/>
              <p style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: '8px 0' }}>Realiza tu primera compra para acumular puntos</p>
            </>
          )}
        </div>
      </div>

      <TabBar active="card" onChange={onTab}/>
      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)}/>}
    </Phone>
  );
}
