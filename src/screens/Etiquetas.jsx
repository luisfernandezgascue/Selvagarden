import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';

const SITE_URL = 'https://selvagarden.vercel.app';

// ── QR widget ─────────────────────────────────────────────────────────────────

function QR({ url = SITE_URL, size = 44 }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(url, {
      width: size * 2, margin: 1,
      color: { dark: '#1A3C2E', light: '#ffffff' },
    }).then(setSrc).catch(() => {});
  }, [url, size]);
  return src
    ? <img src={src} width={size} height={size} style={{ display: 'block' }}/>
    : <div style={{ width: size, height: size, background: '#eee', borderRadius: 3 }}/>;
}

// ── Format 1 — Hablador de planta ─────────────────────────────────────────────

function Hablador({ product }) {
  const care = product.plant_care?.[0] ?? null;
  const nombre = product.nombre || 'Planta';
  const cientifico = product.nombre_cientifico || product.subfamily?.nombre || '';
  const precio = (product.precio_venta || 0).toFixed(2);

  const careItems = [
    { icon: '☀️', label: 'Luz',          val: care?.luz },
    { icon: '💧', label: 'Riego',        val: care?.riego },
    { icon: '🌡️', label: 'Temperatura',  val: care?.temperatura },
    { icon: '🌱', label: 'Abono',        val: care?.abono },
  ].filter(c => c.val);

  const dif = (care?.dificultad || '').toLowerCase();
  const difLabel = dif === 'facil' ? '⭐ Fácil' : dif === 'media' ? '⭐⭐ Media' : dif === 'experto' ? '⭐⭐⭐ Experto' : null;

  return (
    <div className="hablador" style={{
      width: '10cm', height: '7cm',
      border: '1px solid #D8EDE3', borderRadius: 8,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif', background: '#fff',
      breakInside: 'avoid', pageBreakInside: 'avoid',
    }}>
      {/* Header */}
      <div style={{ background: '#1A3C2E', color: '#fff', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{nombre}</div>
          {cientifico && <div style={{ fontSize: 9, fontStyle: 'italic', color: '#A8D5B5', lineHeight: 1.2, marginTop: 1 }}>{cientifico}</div>}
        </div>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7, marginTop: 2, whiteSpace: 'nowrap' }}>SELVA GARDEN</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Plant image */}
        <div style={{ width: '42%', flexShrink: 0, overflow: 'hidden', borderRight: '1px solid #D8EDE3' }}>
          {product.imagen_url
            ? <img src={product.imagen_url} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            : <div style={{ width: '100%', height: '100%', background: '#D8EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌿</div>
          }
        </div>

        {/* Care icons */}
        <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          {careItems.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 7, color: '#999', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#1A3C2E', lineHeight: 1.2 }}>{c.val}</div>
              </div>
            </div>
          ))}
          {difLabel && (
            <div style={{ fontSize: 8, color: '#666', marginTop: 2, paddingTop: 3, borderTop: '1px solid #eee' }}>{difLabel}</div>
          )}
          {careItems.length === 0 && (
            <div style={{ fontSize: 9, color: '#bbb', fontStyle: 'italic' }}>Sin datos de cuidados</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#F4F6F1', borderTop: '1px solid #D8EDE3', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 700, color: '#1A3C2E', lineHeight: 1 }}>
          ${precio}
        </div>
        <QR url={SITE_URL} size={44}/>
      </div>
    </div>
  );
}

// ── Format 2 — Etiqueta de anaquel ────────────────────────────────────────────

function EtiquetaAnaquel({ product }) {
  const nombre = product.nombre || 'Producto';
  const precio = (product.precio_venta || 0).toFixed(2);
  const descripcion = product.descripcion || '';
  const modo = product.modo_aplicacion || 'Ver instrucciones en el envase';
  const sku = product.sku || '';

  return (
    <div className="etiqueta-anaquel" style={{
      width: '100%', height: '3cm',
      border: '1px solid #1A3C2E', borderRadius: 6,
      overflow: 'hidden', display: 'flex',
      fontFamily: 'Inter, sans-serif',
      breakInside: 'avoid', pageBreakInside: 'avoid',
    }}>
      {/* Left */}
      <div style={{ flex: 1, padding: '6px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, background: '#fff', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1A3C2E', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nombre}
        </div>
        {descripcion && (
          <div style={{ fontSize: 8, color: '#666', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {descripcion}
          </div>
        )}
        <div style={{ fontSize: 8, color: '#444', fontStyle: 'italic', lineHeight: 1.3 }}>
          Modo de uso: {modo}
        </div>
        {sku && <div style={{ fontSize: 7, color: '#bbb', lineHeight: 1, marginTop: 1 }}>SKU: {sku}</div>}
      </div>

      {/* Right: price */}
      <div style={{ width: '18%', minWidth: 56, flexShrink: 0, background: '#1A3C2E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', gap: 2 }}>
        <div style={{ fontSize: 7, color: '#A8D5B5', fontWeight: 600, letterSpacing: '0.1em' }}>PRECIO</div>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
          ${precio}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Etiquetas() {
  const [tab, setTab] = useState('habladores');
  const [habladores, setHabladores] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from('products')
        .select('*, plant_care(*), subfamily:product_subfamilies(nombre)')
        .eq('activo', true)
        .order('nombre');
      const all = data || [];
      setHabladores(all.filter(p => p.plant_care?.length > 0));
      setEtiquetas(all);
      setLoading(false);
    }
    load();
  }, []);

  const items = tab === 'habladores' ? habladores : etiquetas;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f2ed; font-family: Inter, sans-serif; }

        @media print {
          body { background: white; }
          .no-print { display: none !important; }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          .print-area {
            padding: 0 !important;
          }

          .habladores-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 9cm) !important;
            gap: 4mm !important;
            justify-content: start !important;
          }

          .hablador {
            width: 9cm !important;
            height: 6.3cm !important;
          }

          .etiquetas-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 3mm !important;
          }

          .etiqueta-anaquel {
            width: 100% !important;
            height: 3cm !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background: '#1A3C2E', color: '#fff', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>Selva Garden</div>
          <div style={{ fontSize: 11, color: '#A8D5B5', marginTop: 3 }}>Herramienta de impresión de etiquetas</div>
        </div>
        <button
          onClick={() => window.print()}
          style={{ background: '#fff', color: '#1A3C2E', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 24px', display: 'flex', gap: 0 }}>
        {[['habladores', 'Habladores de Plantas'], ['etiquetas', 'Etiquetas de Anaquel']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{ background: 'none', border: 'none', padding: '12px 16px', fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? '#1A3C2E' : '#888', borderBottom: tab === id ? '2px solid #1A3C2E' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {label}
            {!loading && <span style={{ fontSize: 10, background: tab === id ? '#D8EDE3' : '#f0f0f0', color: tab === id ? '#1A3C2E' : '#888', borderRadius: 10, padding: '1px 6px', fontWeight: 600 }}>{(tab === id ? items : (id === 'habladores' ? habladores : etiquetas)).length}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="print-area" style={{ padding: 24 }}>
        {loading ? (
          <div className="no-print" style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 13 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #D8EDE3', borderTopColor: '#1A3C2E', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}/>
            Cargando etiquetas…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : items.length === 0 ? (
          <div className="no-print" style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 13 }}>
            {tab === 'habladores' ? 'No hay productos con información de cuidados registrada.' : 'No hay productos activos.'}
          </div>
        ) : tab === 'habladores' ? (
          <div className="habladores-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 10cm)', gap: 16 }}>
            {habladores.map(p => <Hablador key={p.id} product={p}/>)}
          </div>
        ) : (
          <div className="etiquetas-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '19cm' }}>
            {etiquetas.map(p => <EtiquetaAnaquel key={p.id} product={p}/>)}
          </div>
        )}
      </div>
    </>
  );
}
