import { useState, useEffect } from 'react';
import { Phone, TabBar, SectionHeader, QRCode } from '../components';
import { Icon, AppleA } from '../icons';
import { useCustomer, nivelInfo, levelProgress } from '../context/CustomerContext';
import { fetchLoyaltyTransactions } from '../lib/db';

function CornerCuts() {
  const s = 18;
  const piece = (orient) => ({
    position: 'absolute', width: s, height: s,
    borderColor: '#1A3C2E', borderStyle: 'solid', borderWidth: 0,
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
      <span style={{ color: '#B5873A' }}><Icon.Sparkle size={16}/></span>
      <span style={{ fontSize: 12, color: '#1A1A1A' }}>{text}</span>
    </div>
  );
}

function Tx({ date, desc, pts, gold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--c-line-soft)' }}>
      <div>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{date}</p>
        <p style={{ fontSize: 12, color: '#1A1A1A' }}>{desc}</p>
      </div>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: gold ? '#B5873A' : '#1A3C2E' }}>{pts}</span>
    </div>
  );
}

function WalletModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#F4F6F1', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430 }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Wallet digital</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>Añade tu tarjeta Selva Garden a tu wallet para tenerla siempre a mano en caja.</p>
        <button style={{ width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <AppleA/> Añadir a Apple Wallet
        </button>
        <button style={{ width: '100%', background: '#4285F4', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          Añadir a Google Wallet
        </button>
        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#888', fontSize: 13 }}>Cancelar</button>
      </div>
    </div>
  );
}

const BENEFITS = {
  sin_nivel: ['Acumula puntos en cada compra', 'Acceso a eventos Selva Garden'],
  alhambra:  ['5% OFF en toda la tienda', 'Acumula puntos en cada compra', 'Invitaciones a eventos especiales'],
  versailles:['10% OFF en toda la tienda', 'Suculenta gratis cada 3 meses', 'Acceso a talleres con $5 OFF', 'Línea directa de cuidados Selva'],
  babilonia: ['15% OFF en toda la tienda', 'Suculenta gratis cada mes', 'Talleres gratuitos', 'Asesoría botánica ilimitada', 'Envíos gratis en Caracas'],
};

export default function MiTarjeta({ onTab }) {
  const { customer } = useCustomer();
  const [transactions, setTransactions] = useState([]);
  const [walletOpen, setWalletOpen] = useState(false);

  const nombre = customer?.nombre || 'Mi Tarjeta';
  const nivel = customer?.nivel_lealtad || 'sin_nivel';
  const puntos = customer?.puntos || 0;
  const consumo = customer?.consumo_anual || 0;
  const numeroSocio = customer?.numero_socio || '—';
  const info = nivelInfo(nivel);
  const prog = levelProgress(consumo);
  const joinDate = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' })
    : 'Recientemente';

  useEffect(() => {
    if (customer?.id) {
      fetchLoyaltyTransactions(customer.id).then(setTransactions);
    }
  }, [customer?.id]);

  const benefits = BENEFITS[nivel] || BENEFITS.sin_nivel;

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

        {/* QR card */}
        <div style={{ margin: '0 14px', padding: '20px 18px', background: '#fff', borderRadius: 20, border: '1px solid var(--c-line)', boxShadow: '0 6px 30px rgba(26,60,46,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <QRCode size={220}/>
            <CornerCuts/>
          </div>
          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#888', letterSpacing: '0.08em' }}>{numeroSocio}</p>
          <p style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: '#888', letterSpacing: '0.04em' }}>Escanéalo en caja para acumular</p>
        </div>

        {/* Points & progress */}
        <div style={{ margin: '18px 14px 0', padding: '16px 18px', background: 'linear-gradient(135deg, #1A3C2E, #2D6A4F)', borderRadius: 16, color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Puntos</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>{puntos}</p>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(prog.pct * 100)}%`, background: 'linear-gradient(90deg, #A8D5B5, #B5873A)', borderRadius: 99 }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>${consumo.toFixed(0)} gastados</span>
            {prog.next
              ? <span style={{ fontSize: 10, color: '#D4AA6B', fontWeight: 600 }}>Faltan ${prog.remaining.toFixed(0)} para {nivelInfo(prog.next).label}</span>
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
          style={{ margin: '18px 18px 0', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '13px', fontSize: 13, fontWeight: 600, width: 'calc(100% - 36px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <AppleA/> Añadir a Wallet
        </button>

        <SectionHeader title="Movimientos recientes"/>
        <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {transactions.length > 0 ? transactions.map((tx, i) => (
            <Tx
              key={tx.id || i}
              date={new Date(tx.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}
              desc={tx.descripcion || 'Transacción'}
              pts={tx.tipo === 'ganado' ? `+${tx.puntos}` : `-${tx.puntos}`}
              gold={tx.tipo === 'bonus'}
            />
          )) : (
            <>
              <Tx date="—" desc="Aún no tienes movimientos" pts="0"/>
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
