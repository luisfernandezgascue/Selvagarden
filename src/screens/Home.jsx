import { useState, useEffect } from 'react';
import { Phone, TabBar, SectionHeader, iconBtn } from '../components';
import { Icon } from '../icons';
import { useCustomer, nivelInfo, levelProgress } from '../context/CustomerContext';
import { fetchEvents, fetchFeaturedProduct } from '../lib/db';
import { isAdmin } from '../lib/admin';

const NOTIF_SEEN_KEY = 'selva_notif_seen';

function NotifPanel({ events, customer, onClose }) {
  const consumo = customer?.consumo_anual || 0;
  const prog = levelProgress(consumo);
  const reminders = JSON.parse(localStorage.getItem('selva_reminders') || '[]');
  const nextEvent = events[0] || null;
  const closeToLevel = prog.next && prog.remaining <= 100;

  const items = [];
  if (reminders.length > 0) {
    reminders.slice(0, 3).forEach(r => items.push({ icon: '💧', text: r.text, sub: r.time, color: '#E8F0EA' }));
  }
  if (nextEvent) {
    const fecha = new Date(nextEvent.fecha).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
    items.push({ icon: '🌿', text: nextEvent.titulo, sub: `Evento · ${fecha}`, color: '#F5EDD8' });
  }
  if (closeToLevel) {
    items.push({ icon: nivelInfo(prog.next).emoji || '⭐', text: `Estás cerca de ${nivelInfo(prog.next).label}`, sub: `Solo faltan $${prog.remaining.toFixed(0)} más`, color: '#E8F0EA' });
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.3)' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#F5F0E8', borderRadius: '0 0 20px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '16px 18px 20px', animation: 'slideDown 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Notificaciones</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888' }}><Icon.Close size={18}/></button>
        </div>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <p style={{ fontSize: 22, marginBottom: 8 }}>✅</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2D5A3D', marginBottom: 4 }}>Todo al día</p>
            <p style={{ fontSize: 12, color: '#888' }}>No hay recordatorios pendientes</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: item.color, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{item.text}</p>
                  <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QA({ icon, label, highlight, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 4px' }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13,
        background: highlight ? '#2D5A3D' : '#F0FAF5',
        color: highlight ? '#F5EDD8' : '#2D5A3D',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <span style={{ fontSize: 9, color: '#555', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function ProductCardSmall({ name, img, price, old, tag, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 130, flexShrink: 0, background: '#fff', borderRadius: 14,
      overflow: 'hidden', border: '1px solid var(--c-line-soft)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer',
    }}>
      <div style={{ height: 95, position: 'relative', background: '#EDEBE3', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : <div className="photo-placeholder" style={{ width: '100%', height: '100%' }}>plant</div>
        }
        {tag && <span style={{ position: 'absolute', top: 7, left: 7, background: 'rgba(45,90,61,0.85)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.06em' }}>{tag}</span>}
      </div>
      <div style={{ padding: '9px 11px 11px' }}>
        <p style={{ fontSize: 10, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.35, marginBottom: 5, height: 26, overflow: 'hidden' }}>{name}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: '#2D5A3D' }}>${price}</span>
          {old && <span style={{ fontSize: 9, color: '#C0C0C0', textDecoration: 'line-through' }}>${old}</span>}
        </div>
      </div>
    </div>
  );
}

function EventModal({ event, onClose }) {
  if (!event) return null;
  const fecha = event.fecha ? new Date(event.fecha).toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#F5F0E8', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430 }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>
        <p style={{ fontSize: 10, color: '#B8956A', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Evento</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, marginBottom: 10 }}>{event.titulo}</h2>
        {event.descripcion && <p style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.6, marginBottom: 14 }}>{event.descripcion}</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {fecha && <span style={{ fontSize: 12, color: '#B8956A', fontWeight: 600, background: 'rgba(184,149,106,0.1)', padding: '5px 12px', borderRadius: 20 }}>{fecha}</span>}
          {event.lugares_disponibles != null && <span style={{ fontSize: 12, color: '#2D5A3D', fontWeight: 600, background: '#E8F0EA', padding: '5px 12px', borderRadius: 20 }}>{event.lugares_disponibles} lugares</span>}
          {event.precio != null && <span style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 700, background: '#fff', padding: '5px 12px', borderRadius: 20, border: '1px solid var(--c-line)' }}>${event.precio}</span>}
        </div>
        <button
          onClick={onClose}
          style={{ width: '100%', background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 14, fontWeight: 600 }}
        >
          Reservar mi lugar
        </button>
      </div>
    </div>
  );
}

export default function Home({ onTab, onProduct }) {
  const { customer, storeMode } = useCustomer();
  const [events, setEvents] = useState([]);
  const [hero, setHero] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(() => localStorage.getItem(NOTIF_SEEN_KEY) === 'true');

  const nombre = customer?.nombre?.split(' ')[0] || 'Hola';
  const nivel = customer?.nivel_lealtad || 'sin_nivel';
  const puntos = customer?.puntos || 0;
  const consumo = customer?.consumo_anual || 0;
  const info = nivelInfo(nivel);
  const prog = levelProgress(consumo);

  useEffect(() => {
    fetchEvents().then(setEvents);
    fetchFeaturedProduct().then(setHero);
  }, []);

  function openNotif() {
    setNotifOpen(true);
    setNotifSeen(true);
    localStorage.setItem(NOTIF_SEEN_KEY, 'true');
  }

  const nextEvent = events[0] || null;
  const eventFecha = nextEvent?.fecha
    ? new Date(nextEvent.fecha).toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })
    : null;

  return (
    <Phone>
      <div style={{ flexShrink: 0, padding: '4px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
          <img src="/brand/SelvaGarden_horizontal_claro_1024.png" alt="Selva Garden" style={{ height: '100%', width: 'auto', display: 'block' }}/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onTab?.('shop')} style={iconBtn}><Icon.Search/></button>
          <button onClick={openNotif} style={{ ...iconBtn, position: 'relative' }}>
            <Icon.Bell/>
            {!notifSeen && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#B8956A', borderRadius: '50%', border: '1.5px solid #F5F0E8' }}/>}
          </button>
        </div>
      </div>

      {/* Store mode banner */}
      {storeMode && isAdmin(customer) && (
        <div style={{ flexShrink: 0, background: '#2D5A3D', padding: '7px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', flexShrink: 0, boxShadow: '0 0 0 3px rgba(76,175,80,0.25)', animation: 'storePulse 1.5s ease-in-out infinite' }}/>
          <span style={{ fontSize: 11, color: '#A8D5B5', fontWeight: 600, letterSpacing: '0.04em' }}>Modo Tienda Activo · Square POS conectado</span>
        </div>
      )}

      <div className="scroll">
        {/* Level card */}
        <div style={{
          margin: '10px 14px 0', padding: '18px 18px',
          background: 'linear-gradient(140deg, #2D5A3D 0%, #3D7A55 100%)',
          borderRadius: 18, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -25, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.32), transparent 70%)' }}/>
          <div style={{ position: 'absolute', left: -30, bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,213,181,0.18), transparent 70%)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Hola, {nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {info.emoji && <span style={{ fontSize: 18 }}>{info.emoji}</span>}
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#fff' }}>{info.label}</span>
                {info.descuento > 0 && <span className="chip" style={{ background: 'rgba(245,237,216,0.18)', borderColor: 'rgba(245,237,216,0.4)', border: '1px solid rgba(245,237,216,0.4)', color: '#F5EDD8', padding: '2px 8px', fontSize: 9 }}>{info.descuento}% OFF</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2, fontWeight: 600 }}>Puntos</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{puntos}</p>
            </div>
          </div>
          <div style={{ marginTop: 18, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>${consumo.toFixed(0)} acumulados</span>
              {prog.next
                ? <span style={{ fontSize: 10, color: '#D4AA6B', fontWeight: 600 }}>{nivelInfo(prog.next).emoji} Faltan ${prog.remaining.toFixed(0)} · {nivelInfo(prog.next).label}</span>
                : <span style={{ fontSize: 10, color: '#D4AA6B', fontWeight: 600 }}>Nivel máximo</span>
              }
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(prog.pct * 100)}%`, background: 'linear-gradient(90deg, #A8D5B5, #B8956A)', borderRadius: 99, boxShadow: '0 0 12px rgba(184,149,106,0.5)', animation: 'barGrow 1.3s cubic-bezier(.4,0,.2,1)' }}/>
            </div>
            <p style={{ marginTop: 6, fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: '0.04em' }}>{Math.round(prog.pct * 100)}% del camino</p>
          </div>
        </div>

        {/* Quick access */}
        <div style={{
          margin: '14px 14px 0', padding: '12px 6px',
          background: '#fff', borderRadius: 16,
          display: 'flex', justifyContent: 'space-around',
          boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
        }}>
          <QA icon={<Icon.Leaf size={20}/>} label="Mi Selva" onClick={() => onTab?.('selva')}/>
          <QA icon={<Icon.Camera size={20}/>} label="Diagnóstico" onClick={() => onTab?.('selva')}/>
          <QA icon={<Icon.QR size={20}/>} label="Mi QR" onClick={() => onTab?.('card')}/>
          <QA icon={<Icon.Shop size={20}/>} label="Tienda" onClick={() => onTab?.('shop')}/>
          {storeMode && isAdmin(customer) && (
            <QA icon={<span style={{ fontSize: 18 }}>🏪</span>} label="Turno" highlight onClick={() => onTab?.('card')}/>
          )}
        </div>

        {/* Hero */}
        {hero && (
          <div style={{ margin: '18px 14px 0', borderRadius: 18, overflow: 'hidden', position: 'relative', height: 230, cursor: 'pointer' }} onClick={() => onProduct?.(hero)}>
            <img
              src={hero.imagen_url || 'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=700'}
              alt={hero.nombre}
              onError={e => { e.target.src = 'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=700'; }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(10,30,18,0.82) 0%, rgba(10,30,18,0.4) 60%, transparent 100%)' }}/>
            <div style={{ position: 'absolute', inset: 0, padding: '18px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', maxWidth: '75%' }}>
              <span className="chip" style={{ background: 'rgba(184,149,106,0.28)', border: '1px solid rgba(184,149,106,0.45)', color: '#F5EDD8', alignSelf: 'flex-start', marginBottom: 10, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Planta de la semana</span>
              <h2 className="h-serif" style={{ fontSize: 28, color: '#fff', fontWeight: 500, marginBottom: 5, lineHeight: 1.15 }}>
                {hero.nombre.charAt(0).toUpperCase() + hero.nombre.slice(1).toLowerCase()}
              </h2>
              {hero.subfamily?.nombre && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>{hero.subfamily.nombre}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button style={{ background: '#F5EDD8', color: '#2D5A3D', border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon.Cart size={14}/> Ver · ${(hero.precio_venta || 0).toFixed(0)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Esta semana */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 18px', margin: '22px 0 12px' }}>
          <h3 className="h-serif" style={{ fontSize: 22, fontWeight: 600 }}>Esta semana</h3>
          <button onClick={() => onTab?.('shop')} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--c-green)', fontWeight: 600 }}>Ver tienda →</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 18px 4px', scrollbarWidth: 'none' }}>
          {[
            { name: 'Orquídea Phalaenopsis', img: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&w=400', price: 54, old: 60, tag: 'FLORES' },
            { name: 'Pothos Marble Queen', img: 'https://images.pexels.com/photos/6913404/pexels-photo-6913404.jpeg?auto=compress&w=400', price: 18, old: 20, tag: 'PLANTA' },
            { name: 'Matero Herstera Lino 24', img: 'https://images.pexels.com/photos/1084188/pexels-photo-1084188.jpeg?auto=compress&w=400', price: 32, old: 36, tag: 'MATERO' },
            { name: 'Sansevieria Zeylanica', img: 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=400', price: 27, old: 30, tag: 'PLANTA' },
          ].map((p, i) => (
            <ProductCardSmall key={i} {...p} onClick={() => onTab?.('shop')}/>
          ))}
        </div>

        {/* Event card */}
        {nextEvent ? (
          <div style={{ margin: '22px 14px 0' }}>
            <div onClick={() => setSelectedEvent(nextEvent)} style={{ display: 'flex', background: 'linear-gradient(135deg, #F5EDD8, #FBF6ED)', borderRadius: 15, overflow: 'hidden', border: '1px solid rgba(184,149,106,0.2)', cursor: 'pointer' }}>
              <div style={{ width: 4, background: 'linear-gradient(180deg, #B8956A, #D4AA6B)' }}/>
              <div style={{ flex: 1, padding: '14px 14px', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="eyebrow" style={{ color: '#B8956A', marginBottom: 4 }}>Próximo evento</p>
                  <h3 className="h-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 5 }}>{nextEvent.titulo || 'Evento especial'}</h3>
                  {nextEvent.descripcion && <p style={{ fontSize: 11, color: '#6B5A3A', lineHeight: 1.45, marginBottom: 9 }}>{nextEvent.descripcion.slice(0, 80)}{nextEvent.descripcion.length > 80 ? '…' : ''}</p>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {eventFecha && <span style={{ fontSize: 11, color: '#B8956A', fontWeight: 600 }}>{eventFecha}</span>}
                    {nextEvent.lugares_disponibles != null && <span style={{ fontSize: 10, background: 'rgba(184,149,106,0.14)', color: '#B8956A', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>{nextEvent.lugares_disponibles} lugares</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {nextEvent.precio != null && <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#2D5A3D', marginBottom: 8 }}>${nextEvent.precio}</p>}
                  <button style={{ background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 18, padding: '7px 14px', fontSize: 11, fontWeight: 600 }}>Reservar</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ margin: '22px 14px 0' }}>
            <div style={{ display: 'flex', background: 'linear-gradient(135deg, #F5EDD8, #FBF6ED)', borderRadius: 15, overflow: 'hidden', border: '1px solid rgba(184,149,106,0.2)' }}>
              <div style={{ width: 4, background: 'linear-gradient(180deg, #B8956A, #D4AA6B)' }}/>
              <div style={{ flex: 1, padding: '14px 14px' }}>
                <p className="eyebrow" style={{ color: '#B8956A', marginBottom: 4 }}>Próximo evento</p>
                <h3 className="h-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 5 }}>Taller de bonsái</h3>
                <p style={{ fontSize: 11, color: '#6B5A3A', lineHeight: 1.45 }}>Iniciación con Hiroshi Tanaka. Materiales incluidos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Video card */}
        <div style={{ margin: '14px 14px 0' }}>
          {videoOpen ? (
            <div style={{ borderRadius: 15, overflow: 'hidden', aspectRatio: '16/9' }}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/0CvjNNCv5_s?rel=0&modestbranding=1&autoplay=1"
                title="Selva Garden video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block' }}
              />
            </div>
          ) : (
            <div onClick={() => setVideoOpen(true)} style={{ background: '#0A1E10', borderRadius: 15, overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative', height: 118, cursor: 'pointer' }}>
              <img src="https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}/>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,30,16,0.92), rgba(10,30,16,0.35))' }}/>
              <div style={{ position: 'relative', zIndex: 1, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Icon.Play size={16}/>
                </div>
                <div>
                  <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 5 }}>Esta semana en Mi Selva</p>
                  <h3 className="h-serif" style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>Cómo podas tu Monstera</h3>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Ver en YouTube →</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 24 }}/>
      </div>

      <TabBar active="home" onChange={onTab}/>

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)}/>}
      {notifOpen && <NotifPanel events={events} customer={customer} onClose={() => setNotifOpen(false)}/>}
    </Phone>
  );
}
