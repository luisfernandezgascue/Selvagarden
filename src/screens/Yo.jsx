import { Phone, TabBar, SectionHeader, iconBtn } from '../components';
import { Icon } from '../icons';
import { signOut } from '../lib/auth';

function Stat({ n, lbl, gold }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: gold ? '#B5873A' : '#1A3C2E', lineHeight: 1 }}>{n}</p>
      <p style={{ fontSize: 10, color: '#6B5A3A', marginTop: 4, letterSpacing: '0.04em' }}>{lbl}</p>
    </div>
  );
}

function MenuRow({ icon, text, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', width: '100%' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#D8EDE3', color: '#1A3C2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{text}</p>
        {sub && <p style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{sub}</p>}
      </div>
      <Icon.Chevron size={14}/>
    </button>
  );
}

export default function Yo({ onTab, onCalc, customer }) {
  const nombre = customer?.nombre || 'Mi perfil';
  const nivel = customer?.nivel_lealtad || 'semilla';
  const puntos = customer?.puntos || 0;
  const nivelLabel = { sin_nivel: '', semilla: '🌱 Semilla', versailles: '🥈 Versailles', babilonia: '🥇 Babilonia' }[nivel] || '🌱 Semilla';

  return (
    <Phone>
      <div className="scroll">
        <div style={{ padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none' }}><Icon.Share size={20}/></button>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.14em', fontWeight: 600 }}>YO</span>
          <button style={{ background: 'none', border: 'none' }}><Icon.Settings size={20}/></button>
        </div>

        {/* Profile */}
        <div style={{ padding: '18px 18px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#D8EDE3', border: '2px solid #fff', boxShadow: '0 4px 14px rgba(26,60,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {customer?.avatar_url
              ? <img src={customer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, color: '#1A3C2E' }}>{nombre[0]}</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="h-serif" style={{ fontSize: 22, fontWeight: 600 }}>{nombre}</h2>
            <p style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{nivelLabel} · {puntos} pts</p>
          </div>
          <button style={{ ...iconBtn, color: '#1A1A1A' }}><Icon.Chevron size={14}/></button>
        </div>

        {/* Échale Tierra referral */}
        <div style={{ margin: '14px 14px 0', padding: '20px 18px', background: 'linear-gradient(135deg, #F5EDD8 0%, #FBF6ED 70%)', border: '1px solid rgba(181,135,58,0.2)', borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -25, top: -25, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,135,58,0.22), transparent 70%)' }}/>
          <p className="eyebrow" style={{ color: '#B5873A', marginBottom: 6, position: 'relative' }}>Programa de referidos</p>
          <h3 className="h-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 6, position: 'relative' }}>
            <span style={{ fontStyle: 'italic' }}>Échale Tierra</span>
          </h3>
          <p style={{ fontSize: 12, color: '#6B5A3A', lineHeight: 1.45, marginBottom: 14, position: 'relative' }}>
            Comparte tu link. Tus amigos llevan 10% OFF, tú llevas <b>15% en comisión</b>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14, position: 'relative' }}>
            <Stat n="12" lbl="Referidos"/>
            <Stat n="8" lbl="Conversiones"/>
            <Stat n="$184" lbl="Comisión" gold/>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '9px 12px', border: '1px dashed rgba(181,135,58,0.3)', position: 'relative' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1A3C2E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>selva.garden/r/carlos</span>
            <button style={{ background: '#1A3C2E', color: '#F5EDD8', border: 'none', borderRadius: 18, padding: '6px 12px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon.Share size={12}/> Compartir
            </button>
          </div>
        </div>

        {/* Affiliate dashboard */}
        <SectionHeader title="Dashboard afiliado" cta="Ver detalle"/>
        <div style={{ padding: '0 14px' }}>
          <div style={{ background: '#1A3C2E', borderRadius: 16, padding: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,213,181,0.18), transparent 70%)' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, position: 'relative' }}>
              <div>
                <p className="eyebrow" style={{ color: '#D4AA6B', marginBottom: 5 }}>Revenue generado</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>$1,224</p>
              </div>
              <span className="chip" style={{ background: 'rgba(245,237,216,0.18)', color: '#F5EDD8', border: '1px solid rgba(245,237,216,0.35)' }}>Nivel · Embajador</span>
            </div>
            <svg width="100%" height="42" viewBox="0 0 280 42" preserveAspectRatio="none" style={{ position: 'relative' }}>
              <defs>
                <linearGradient id="spk" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#B5873A" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#B5873A" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 30 L 30 28 L 60 24 L 90 25 L 120 20 L 150 18 L 180 14 L 210 16 L 240 9 L 280 5 L 280 42 L 0 42 Z" fill="url(#spk)"/>
              <path d="M0 30 L 30 28 L 60 24 L 90 25 L 120 20 L 150 18 L 180 14 L 210 16 L 240 9 L 280 5" fill="none" stroke="#B5873A" strokeWidth="1.5"/>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 4, letterSpacing: '0.04em' }}>
              <span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
            </div>
          </div>
        </div>

        <SectionHeader title="Mi cuenta"/>
        <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MenuRow icon={<Icon.Cart/>} text="Mis pedidos" sub="2 en camino"/>
          <MenuRow icon={<Icon.Sparkle/>} text="Mis beneficios" sub="4 activos"/>
          <MenuRow icon={<Icon.Card/>} text="Wallet digital" sub="$24.50 en crédito"/>
          <MenuRow icon={<Icon.Bell/>} text="Notificaciones" sub="3 categorías activas"/>
          <MenuRow icon={<Icon.Settings/>} text="Ajustes y privacidad"/>
          {onCalc && <MenuRow icon={<Icon.Sparkle/>} text="Calculadora de ramos" sub="Herramienta interna" onClick={onCalc}/>}
        </div>

        <div style={{ padding: '22px 18px 24px', textAlign: 'center' }}>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#B5873A', fontSize: 12, fontWeight: 600 }}>Cerrar sesión</button>
          <p style={{ fontSize: 10, color: '#BBB', marginTop: 14 }}>Selva Garden · v2.4.0</p>
        </div>
      </div>

      <TabBar active="me" onChange={onTab}/>
    </Phone>
  );
}
