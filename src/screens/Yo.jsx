import { useState, useEffect } from 'react';
import { Phone, TabBar, SectionHeader, iconBtn } from '../components';
import { Icon } from '../icons';
import { signOut } from '../lib/auth';
import { useCustomer, nivelInfo } from '../context/CustomerContext';
import { fetchOrders, fetchAffiliateLink } from '../lib/db';

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

function OrdersModal({ orders, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#F4F6F1', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Mis pedidos</h3>
        {orders.length === 0 ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px 0' }}>Aún no tienes pedidos</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--c-line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Pedido #{order.id?.slice(-6)?.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: order.estado === 'confirmado' ? '#2D6A4F' : '#B5873A', fontWeight: 600 }}>{order.estado}</span>
                </div>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{new Date(order.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: '#1A3C2E' }}>${order.total?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{ width: '100%', marginTop: 16, background: 'none', border: '1px solid var(--c-line)', borderRadius: 'var(--r-btn)', padding: '12px', fontSize: 13, color: '#888' }}>Cerrar</button>
      </div>
    </div>
  );
}

export default function Yo({ onTab }) {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [affiliateLink, setAffiliateLink] = useState(null);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const nombre = customer?.nombre || 'Mi perfil';
  const nivel = customer?.nivel_lealtad || 'sin_nivel';
  const puntos = customer?.puntos || 0;
  const info = nivelInfo(nivel);
  const nivelLabel = info.emoji ? `${info.emoji} ${info.label}` : info.label;

  useEffect(() => {
    if (customer?.id) {
      fetchOrders(customer.id).then(setOrders);
      fetchAffiliateLink(customer.id).then(setAffiliateLink);
    }
  }, [customer?.id]);

  const shareLink = affiliateLink
    ? `selva.garden/r/${affiliateLink.codigo}`
    : `selva.garden/r/${customer?.id?.slice(0, 8) || '—'}`;

  function handleShare() {
    const url = `https://${shareLink}`;
    if (navigator.share) {
      navigator.share({ title: 'Selva Garden', text: '10% OFF en tu primera compra', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      alert('Link copiado al portapapeles');
    }
  }

  const referidosCount = affiliateLink?.total_referidos || 0;
  const conversionCount = affiliateLink?.total_conversiones || 0;
  const comision = affiliateLink?.comision_total || 0;

  return (
    <Phone>
      <div className="scroll">
        <div style={{ padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleShare} style={{ background: 'none', border: 'none' }}><Icon.Share size={20}/></button>
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

        {/* Échale Tierra — only if has orders */}
        {orders.length > 0 ? (
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
              <Stat n={referidosCount} lbl="Referidos"/>
              <Stat n={conversionCount} lbl="Conversiones"/>
              <Stat n={`$${comision}`} lbl="Comisión" gold/>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '9px 12px', border: '1px dashed rgba(181,135,58,0.3)', position: 'relative' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1A3C2E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareLink}</span>
              <button onClick={handleShare} style={{ background: '#1A3C2E', color: '#F5EDD8', border: 'none', borderRadius: 18, padding: '6px 12px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon.Share size={12}/> Compartir
              </button>
            </div>
          </div>
        ) : (
          <div style={{ margin: '14px 14px 0', padding: '16px 18px', background: '#F0FAF5', border: '1px solid rgba(45,106,79,0.15)', borderRadius: 16 }}>
            <p className="eyebrow" style={{ color: '#2D6A4F', marginBottom: 6 }}>Programa de referidos</p>
            <p style={{ fontSize: 12, color: '#4A4A4A', lineHeight: 1.5, marginBottom: 12 }}>Haz tu primera compra para desbloquear el programa de referidos y ganar comisiones.</p>
            <button onClick={() => onTab?.('shop')} style={{ background: '#1A3C2E', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '10px 18px', fontSize: 12, fontWeight: 600 }}>Ver tienda →</button>
          </div>
        )}

        <SectionHeader title="Mi cuenta"/>
        <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MenuRow
            icon={<Icon.Cart/>}
            text="Mis pedidos"
            sub={orders.length > 0 ? `${orders.length} pedido${orders.length !== 1 ? 's' : ''}` : 'Sin pedidos aún'}
            onClick={() => setOrdersOpen(true)}
          />
          <MenuRow icon={<Icon.Sparkle/>} text="Mis beneficios" sub={`${nivelLabel} activo`}/>
          <MenuRow icon={<Icon.Card/>} text="Wallet digital" sub="Tarjeta Selva Garden" onClick={() => onTab?.('card')}/>
          <MenuRow icon={<Icon.Bell/>} text="Notificaciones"/>
          <MenuRow icon={<Icon.Settings/>} text="Ajustes y privacidad"/>
        </div>

        <div style={{ padding: '22px 18px 24px', textAlign: 'center' }}>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#B5873A', fontSize: 12, fontWeight: 600 }}>Cerrar sesión</button>
          <p style={{ fontSize: 10, color: '#BBB', marginTop: 14 }}>Selva Garden · v2.5.0</p>
        </div>
      </div>

      <TabBar active="me" onChange={onTab}/>

      {ordersOpen && <OrdersModal orders={orders} onClose={() => setOrdersOpen(false)}/>}
    </Phone>
  );
}
