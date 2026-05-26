import { Phone, TabBar, SectionHeader } from '../components';
import { Icon, SelvaLeaf } from '../icons';

function ActionCard({ icon, title, sub, color, badge }) {
  return (
    <button style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%' }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: color, color: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        {icon}
        {badge && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#B5873A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, padding: '2px 6px', minWidth: 16, border: '2px solid #F4F6F1' }}>{badge}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 11, color: '#888' }}>{sub}</p>
      </div>
      <Icon.Chevron size={16}/>
    </button>
  );
}

function PlantRow({ name, sub, img, status, statusColor, alert }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 14, padding: 10, display: 'flex', gap: 11, alignItems: 'center' }}>
      <div style={{ width: 54, height: 54, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#EDEBE3' }}>
        {img && <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{name}</p>
        <p style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{sub}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
          {alert && <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, animation: 'pulseDot 1.6s infinite' }}/>}
          <span style={{ fontSize: 10, color: statusColor, fontWeight: 600 }}>{status}</span>
        </div>
      </div>
      <Icon.Chevron size={14}/>
    </div>
  );
}

function ReminderRow({ icon, text, time, on }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#D8EDE3', color: '#1A3C2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600 }}>{text}</p>
        <p style={{ fontSize: 10, color: '#888' }}>{time}</p>
      </div>
      <div style={{ width: 34, height: 20, borderRadius: 99, background: on ? '#2D6A4F' : '#D8D8D8', position: 'relative', transition: 'background .2s' }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
      </div>
    </div>
  );
}

export default function MiSelva({ onTab }) {
  return (
    <Phone>
      <div className="scroll">
        <div style={{ padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.Settings size={20}/></button>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.14em', fontWeight: 600 }}>MI SELVA</span>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.Bell size={20}/></button>
        </div>

        {/* Avatar hero */}
        <div style={{ margin: '18px 14px 0', padding: '28px 22px 22px', background: 'linear-gradient(160deg, #F5EDD8 0%, #FBF6ED 80%)', borderRadius: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(168,213,181,0.25), transparent 60%)' }}/>
          <div className="selva-avatar breathing" style={{ width: 84, height: 84, margin: '0 auto 14px', position: 'relative' }}>
            <SelvaLeaf size={44}/>
            <span style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px dashed rgba(26,60,46,0.18)', animation: 'spinSlow 30s linear infinite' }}/>
          </div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Selva · tu asistente</p>
          <h2 className="h-serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.15, marginBottom: 6, position: 'relative' }}>
            Hola Carlos,<br/>
            <span style={{ fontStyle: 'italic' }}>¿cómo están tus plantas hoy?</span>
          </h2>
          <p style={{ fontSize: 12, color: '#6B5A3A', position: 'relative' }}>Tienes <b>2 plantas</b> esperando agua esta semana</p>
        </div>

        {/* 3 main actions */}
        <div style={{ padding: '18px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ActionCard icon={<Icon.Camera/>} title="Diagnosticar mi planta" sub="Sube una foto y te digo qué tiene" color="#1A3C2E"/>
          <ActionCard icon={<Icon.Leaf/>} title="Mis plantas" sub="4 plantas activas · 2 necesitan agua" color="#2D6A4F" badge="2"/>
          <ActionCard icon={<Icon.Play size={20}/>} title="Cuidados y videos" sub="Esta semana: poda de monstera" color="#B5873A"/>
        </div>

        {/* Mis plantas */}
        <SectionHeader title="Mis plantas" cta="Ver todas"/>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PlantRow name="Monstera Deliciosa" sub="Comprada Nov 14 · Riego cada 7 días" img="https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&w=200" status="Próximo riego en 2 días" statusColor="#2D6A4F"/>
          <PlantRow name="Sansevieria Zeylanica" sub="Comprada Oct 28 · Riego cada 14 días" img="https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=200" status="Riego pendiente · ayer" statusColor="#B5873A" alert/>
          <PlantRow name="Pothos Marble Queen" sub="Comprada Sep 04 · Riego cada 10 días" img="https://images.pexels.com/photos/6913404/pexels-photo-6913404.jpeg?auto=compress&w=200" status="Próximo riego en 5 días" statusColor="#2D6A4F"/>
        </div>

        {/* Inspiración de ramos */}
        <div style={{ margin: '22px 14px 0', padding: '18px 18px', background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,213,181,0.3), transparent 70%)' }}/>
          <p className="eyebrow" style={{ marginBottom: 6, position: 'relative' }}>Nueva función</p>
          <h3 className="h-serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, position: 'relative' }}>¿Viste un ramo que te gustó?</h3>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 14, position: 'relative' }}>Sube la foto y te lo hacemos, o te recomendamos algo similar.</p>
          <button style={{ background: '#1A3C2E', color: '#F5EDD8', border: 'none', borderRadius: 'var(--r-btn)', padding: '10px 16px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <Icon.Camera size={16}/> Inspirar un ramo
          </button>
        </div>

        {/* Recordatorios */}
        <SectionHeader title="Recordatorios"/>
        <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ReminderRow icon={<Icon.Droplet/>} text="Regar Monstera" time="Miércoles 9am" on/>
          <ReminderRow icon={<Icon.Sparkle/>} text="Abonar Sansevieria" time="Domingo 8am" on/>
          <ReminderRow icon={<Icon.Sun/>} text="Rotar Pothos" time="Cada 14 días"/>
        </div>
      </div>

      <TabBar active="selva" onChange={onTab}/>
    </Phone>
  );
}
