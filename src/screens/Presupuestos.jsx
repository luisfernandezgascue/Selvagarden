import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAILS } from '../lib/admin';

const ESTADO_CONFIG = {
  enviado:   { label: 'Enviado',   bg: '#FEF3C7', color: '#92400E' },
  visto:     { label: 'Visto',     bg: '#DBEAFE', color: '#1E40AF' },
  aceptado:  { label: 'Aceptado', bg: '#D1FAE5', color: '#065F46' },
  rechazado: { label: 'Rechazado',bg: '#FEE2E2', color: '#991B1B' },
  expirado:  { label: 'Expirado', bg: '#F3F4F6', color: '#6B7280' },
};

function Badge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.enviado;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, letterSpacing: '0.04em' }}>
      {cfg.label.toUpperCase()}
    </span>
  );
}

function StatCard({ value, label, gold }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8EDE9', borderRadius: 12, padding: '14px 16px', flex: 1 }}>
      <p style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: gold ? '#B8956A' : '#2D5A3D', lineHeight: 1, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 10, color: '#888', marginTop: 5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function BCModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: '#2D5A3D', marginBottom: 10 }}>Business Central</h3>
        <p style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.6, marginBottom: 20 }}>
          BC se conectará cuando actives tu suscripción de Business Central. Los presupuestos aceptados se crearán automáticamente como cotizaciones en BC.
        </p>
        <button onClick={onClose} style={{ background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Entendido</button>
      </div>
    </div>
  );
}

function DetailModal({ p, onClose, onEstadoChange }) {
  const [saving, setSaving] = useState(false);
  const [showBC, setShowBC] = useState(false);

  async function cambiarEstado(nuevoEstado) {
    setSaving(true);
    await supabase.from('presupuestos').update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq('id', p.id);
    onEstadoChange(p.id, nuevoEstado);
    setSaving(false);
  }

  const fecha = new Date(p.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
  const otros = Object.keys(ESTADO_CONFIG).filter(e => e !== p.estado);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#F5F0E8', borderRadius: '20px 20px 0 0', padding: '0 0 32px', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Handle */}
          <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0' }}/>
          </div>

          {/* Header */}
          <div style={{ padding: '12px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <Badge estado={p.estado}/>
                <span style={{ fontSize: 10, color: '#888' }}>{fecha}</span>
              </div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: '#2D5A3D', margin: 0 }}>{p.cliente_nombre || 'Sin nombre'}</h2>
              {p.cliente_email && <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{p.cliente_email}{p.cliente_telefono ? ` · ${p.cliente_telefono}` : ''}</p>}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {/* Items */}
          <div style={{ margin: '0 14px 14px', background: '#fff', borderRadius: 12, border: '1px solid #E8EDE9', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 80px', gap: 8, padding: '8px 14px', background: '#F5F0E8', fontSize: 9.5, color: '#888', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Elemento</span><span style={{ textAlign: 'center' }}>Cant.</span><span style={{ textAlign: 'right' }}>Unit.</span><span style={{ textAlign: 'right' }}>Total</span>
            </div>
            {(p.items || []).map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 80px', gap: 8, padding: '9px 14px', borderTop: '1px solid #F0F2EE', fontSize: 12 }}>
                <span style={{ color: '#1A1A1A' }}>{item.nombre || item.name}</span>
                <span style={{ textAlign: 'center', color: '#4A4A4A' }}>{item.cantidad || item.qty}</span>
                <span style={{ textAlign: 'right', color: '#4A4A4A' }}>${Number(item.precio_unit ?? item.unit ?? 0).toFixed(2)}</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#2D5A3D' }}>${Number(item.subtotal ?? ((item.qty || item.cantidad) * (item.unit || item.precio_unit)) ?? 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ margin: '0 14px 14px', background: '#fff', borderRadius: 12, border: '1px solid #E8EDE9', padding: '12px 16px' }}>
            {[
              ['Subtotal', `$${Number(p.subtotal).toFixed(2)}`],
              [`Servicio (${p.porcentaje_servicio}%) + margen`, `$${Number(p.mano_de_obra).toFixed(2)}`],
            ].map(([l, r]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F0F2EE', fontSize: 12, color: '#4A4A4A' }}>
                <span>{l}</span><span>{r}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', fontSize: 16, fontWeight: 700, color: '#2D5A3D' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: 22 }}>${Number(p.total)}</span>
            </div>
          </div>

          {p.notas && (
            <div style={{ margin: '0 14px 14px', background: '#FBF6ED', borderRadius: 12, border: '1px solid rgba(184,149,106,0.2)', padding: '12px 16px' }}>
              <p style={{ fontSize: 10, color: '#B8956A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 5, textTransform: 'uppercase' }}>Notas</p>
              <p style={{ fontSize: 12, color: '#4A4A4A', lineHeight: 1.5, margin: 0 }}>{p.notas}</p>
            </div>
          )}

          {/* Estado change */}
          <div style={{ margin: '0 14px 10px' }}>
            <p style={{ fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Cambiar estado</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {otros.map(e => {
                const cfg = ESTADO_CONFIG[e];
                return (
                  <button
                    key={e}
                    onClick={() => cambiarEstado(e)}
                    disabled={saving}
                    style={{ background: cfg.bg, color: cfg.color, border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BC button */}
          <div style={{ margin: '0 14px' }}>
            <button
              onClick={() => setShowBC(true)}
              style={{ width: '100%', background: '#fff', border: '1px dashed #C0C0C0', borderRadius: 12, padding: '12px', fontSize: 12, fontWeight: 600, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              🏢 Crear en Business Central
              {p.bc_quote_id && <span style={{ fontSize: 10, color: '#3D7A55' }}>· {p.bc_quote_id}</span>}
            </button>
          </div>
        </div>
      </div>

      {showBC && <BCModal onClose={() => setShowBC(false)}/>}
    </>
  );
}

export default function Presupuestos() {
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [presupuestos, setPresupuestos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    async function init() {
      if (!supabase) { setAuthError(true); setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email || !ADMIN_EMAILS.includes(email)) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('presupuestos')
        .select('*')
        .order('created_at', { ascending: false });
      setPresupuestos(data || []);
      setLoading(false);
    }
    init();
  }, []);

  function handleEstadoChange(id, nuevoEstado) {
    setPresupuestos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    if (selected?.id === id) setSelected(s => ({ ...s, estado: nuevoEstado }));
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(45,90,61,0.2)', borderTopColor: '#2D5A3D', animation: 'spinSlow 0.9s linear infinite' }}/>
    </div>
  );

  if (authError) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', textAlign: 'center', maxWidth: 340 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#2D5A3D', marginBottom: 8 }}>Acceso restringido</h2>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Inicia sesión con una cuenta de administrador para ver los presupuestos.</p>
      </div>
    </div>
  );

  const total = presupuestos.length;
  const aceptados = presupuestos.filter(p => p.estado === 'aceptado').length;
  const tasa = total > 0 ? Math.round(aceptados / total * 100) : 0;
  const ticketMedio = total > 0 ? Math.round(presupuestos.reduce((s, p) => s + Number(p.total), 0) / total) : 0;

  const filtered = filtroEstado === 'todos'
    ? presupuestos
    : presupuestos.filter(p => p.estado === filtroEstado);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#2D5A3D', padding: '20px 24px 18px' }}>
        <p style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>Selva Garden · Admin</p>
        <h1 style={{ margin: 0, fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: '#fff' }}>Presupuestos</h1>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatCard value={total} label="Enviados"/>
          <StatCard value={aceptados} label="Aceptados" gold/>
          <StatCard value={`${tasa}%`} label="Conversión"/>
          <StatCard value={`$${ticketMedio}`} label="Ticket medio" gold/>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
          {['todos', ...Object.keys(ESTADO_CONFIG)].map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              style={{
                background: filtroEstado === e ? '#2D5A3D' : '#fff',
                color: filtroEstado === e ? '#fff' : '#4A4A4A',
                border: '1px solid',
                borderColor: filtroEstado === e ? '#2D5A3D' : '#E8EDE9',
                borderRadius: 99, padding: '5px 13px', fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer',
              }}
            >
              {e === 'todos' ? 'Todos' : ESTADO_CONFIG[e].label}
              {e !== 'todos' && <span style={{ marginLeft: 5, opacity: 0.6 }}>{presupuestos.filter(p => p.estado === e).length}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888', fontSize: 13 }}>No hay presupuestos{filtroEstado !== 'todos' ? ` con estado "${ESTADO_CONFIG[filtroEstado]?.label}"` : ''}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => {
              const fecha = new Date(p.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  style={{ background: '#fff', border: '1px solid #E8EDE9', borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', width: '100%' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.cliente_nombre || p.cliente_email || 'Sin nombre'}
                      </span>
                      <Badge estado={p.estado}/>
                    </div>
                    <span style={{ fontSize: 11, color: '#888' }}>{fecha}{p.cliente_email ? ` · ${p.cliente_email}` : ''}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#2D5A3D', margin: 0 }}>${Number(p.total)}</p>
                    <p style={{ fontSize: 10, color: '#888', margin: '2px 0 0' }}>{(p.items || []).length} elementos</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          p={selected}
          onClose={() => setSelected(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </div>
  );
}
