import { Phone, TabBar, SectionHeader, QRCode } from '../components';
import { Icon, AppleA } from '../icons';

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

export default function MiTarjeta({ storeMode = false, onTab }) {
  return (
    <Phone>
      <div className="scroll" style={{ padding: '8px 0 0' }}>
        <div style={{ padding: '0 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.ArrowLeft size={20}/></button>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.14em', fontWeight: 600 }}>MI TARJETA</span>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.Share size={18}/></button>
        </div>

        {storeMode && (
          <div style={{ margin: '12px 14px 0', padding: '9px 14px', background: 'linear-gradient(135deg,#2D6A4F,#1A3C2E)', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A8D5B5', boxShadow: '0 0 0 4px rgba(168,213,181,0.25)', animation: 'pulseDot 1.6s infinite' }}/>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Muéstralo en caja · Las Mercedes</span>
          </div>
        )}

        <div style={{ padding: '18px 18px 14px', textAlign: 'center' }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Carlos Mendoza</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🥈</span>
            <h2 className="h-serif" style={{ fontSize: 30, fontWeight: 500 }}><span style={{ fontStyle: 'italic' }}>Versailles</span></h2>
          </div>
          <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Miembro desde Nov 2024</p>
        </div>

        {/* QR card */}
        <div style={{ margin: '0 14px', padding: storeMode ? '24px 18px' : '20px 18px', background: '#fff', borderRadius: 20, border: '1px solid var(--c-line)', boxShadow: '0 6px 30px rgba(26,60,46,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <QRCode size={storeMode ? 260 : 220}/>
            <CornerCuts/>
          </div>
          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: '#888', letterSpacing: '0.04em' }}>
            {storeMode ? 'Muestra este código al cajero' : 'Escanéalo en caja para acumular'}
          </p>
        </div>

        {!storeMode && (
          <div style={{ margin: '18px 14px 0', padding: '16px 18px', background: 'linear-gradient(135deg, #1A3C2E, #2D6A4F)', borderRadius: 16, color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Puntos</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>842</p>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '56%', background: 'linear-gradient(90deg,#A8D5B5,#B5873A)', borderRadius: 99 }}/>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>$658 más para llegar a <b style={{ color: '#D4AA6B' }}>🥇 Babilonia</b></p>
          </div>
        )}

        <SectionHeader title="Beneficios activos"/>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Benefit text="10% OFF en toda la tienda"/>
          <Benefit text="Suculenta gratis cada 3 meses"/>
          <Benefit text="Acceso a talleres con $5 OFF"/>
          <Benefit text="Línea directa de cuidados Selva"/>
        </div>

        <button style={{ margin: '18px 18px 0', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '13px', fontSize: 13, fontWeight: 600, width: 'calc(100% - 36px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <AppleA/> Añadir a Apple Wallet
        </button>

        <SectionHeader title="Movimientos recientes"/>
        <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Tx date="Hoy" desc="Compra · Floristería Las Mercedes" pts="+42"/>
          <Tx date="Nov 18" desc="Compra online · Pothos & matero" pts="+58"/>
          <Tx date="Nov 12" desc="Bonus referido · Daniela R." pts="+100" gold/>
          <Tx date="Nov 04" desc="Compra · Orquídea Phalaenopsis" pts="+54"/>
        </div>
      </div>

      <TabBar active="card" onChange={onTab}/>
    </Phone>
  );
}
