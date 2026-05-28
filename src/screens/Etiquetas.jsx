import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';

const SITE_URL = 'https://selvagarden.vercel.app';

// cols for screen preview + card height in print
const LAYOUTS = {
  2: { cols: 1, printH: '12.6cm', previewH: '11.2cm' },
  4: { cols: 2, printH: '6.3cm',  previewH: '6.3cm' },
  6: { cols: 2, printH: '4.15cm', previewH: '4.15cm' },
  8: { cols: 2, printH: '3.1cm',  previewH: '3.1cm' },
};

// ── QR widget ─────────────────────────────────────────────────────────────────

function QR({ url = SITE_URL, size = 44 }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(url, { width: size * 2, margin: 1, color: { dark: '#1A3C2E', light: '#ffffff' } })
      .then(setSrc).catch(() => {});
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
    { icon: '☀️', label: 'Luz',         val: care?.luz },
    { icon: '💧', label: 'Riego',       val: care?.riego },
    { icon: '🌡️', label: 'Temperatura', val: care?.temperatura },
    { icon: '🌱', label: 'Abono',       val: care?.abono },
  ].filter(c => c.val);

  const dif = (care?.dificultad || '').toLowerCase();
  const difLabel = dif === 'facil' ? '⭐ Fácil' : dif === 'media' ? '⭐⭐ Media' : dif === 'experto' ? '⭐⭐⭐ Experto' : null;

  return (
    <div className="hablador" style={{
      width: '100%', height: '100%',
      border: '1px solid #D8EDE3', borderRadius: 8,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif', background: '#fff',
    }}>
      <div style={{ background: '#1A3C2E', color: '#fff', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{nombre}</div>
          {cientifico && <div style={{ fontSize: 9, fontStyle: 'italic', color: '#A8D5B5', lineHeight: 1.2, marginTop: 1 }}>{cientifico}</div>}
        </div>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7, marginTop: 2, whiteSpace: 'nowrap' }}>SELVA GARDEN</div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ width: '42%', flexShrink: 0, overflow: 'hidden', borderRight: '1px solid #D8EDE3' }}>
          {product.imagen_url
            ? <img src={product.imagen_url} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            : <div style={{ width: '100%', height: '100%', background: '#D8EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌿</div>
          }
        </div>
        <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, overflow: 'hidden' }}>
          {careItems.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 7, color: '#999', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#1A3C2E', lineHeight: 1.2 }}>{c.val}</div>
              </div>
            </div>
          ))}
          {difLabel && <div style={{ fontSize: 8, color: '#666', marginTop: 2, paddingTop: 3, borderTop: '1px solid #eee' }}>{difLabel}</div>}
          {careItems.length === 0 && <div style={{ fontSize: 9, color: '#bbb', fontStyle: 'italic' }}>Sin datos de cuidados</div>}
        </div>
      </div>

      <div style={{ background: '#F4F6F1', borderTop: '1px solid #D8EDE3', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 700, color: '#1A3C2E', lineHeight: 1 }}>${precio}</div>
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
      width: '100%', height: '100%',
      border: '1px solid #1A3C2E', borderRadius: 6,
      overflow: 'hidden', display: 'flex',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ flex: 1, padding: '6px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, background: '#fff', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1A3C2E', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
        {descripcion && <div style={{ fontSize: 8, color: '#666', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{descripcion}</div>}
        <div style={{ fontSize: 8, color: '#444', fontStyle: 'italic', lineHeight: 1.3 }}>Modo de uso: {modo}</div>
        {sku && <div style={{ fontSize: 7, color: '#bbb', lineHeight: 1, marginTop: 1 }}>SKU: {sku}</div>}
      </div>
      <div style={{ width: '18%', minWidth: 60, flexShrink: 0, background: '#1A3C2E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', gap: 2 }}>
        <div style={{ fontSize: 7, color: '#A8D5B5', fontWeight: 600, letterSpacing: '0.1em' }}>PRECIO</div>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>${precio}</div>
      </div>
    </div>
  );
}

// ── Checkbox UI (hidden in print) ─────────────────────────────────────────────

function CheckBox({ checked, onClick }) {
  return (
    <div
      className="no-print"
      onClick={onClick}
      style={{
        position: 'absolute', top: 6, left: 6, zIndex: 10,
        width: 20, height: 20,
        background: checked ? '#1A3C2E' : '#fff',
        borderRadius: 5,
        border: `2px solid ${checked ? '#1A3C2E' : '#ccc'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'background .12s, border-color .12s',
      }}
    >
      {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Etiquetas() {
  const [tab, setTab] = useState('habladores');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [perPage, setPerPage] = useState(4);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from('products')
        .select('*, plant_care(*), subfamily:product_subfamilies(nombre, family:product_families(nombre))')
        .eq('activo', true)
        .order('nombre');
      const all = data || [];
      setAllProducts(all);
      setSelected(new Set(all.map(p => p.id)));
      setLoading(false);
    }
    load();
  }, []);

  const habladores = useMemo(() => allProducts.filter(p => p.plant_care?.length > 0), [allProducts]);

  const families = useMemo(() => {
    const source = tab === 'habladores' ? habladores : allProducts;
    return [...new Set(source.map(p => p.subfamily?.family?.nombre).filter(Boolean))].sort();
  }, [tab, habladores, allProducts]);

  const baseItems = tab === 'habladores' ? habladores : allProducts;
  const filteredItems = categoryFilter === 'all'
    ? baseItems
    : baseItems.filter(p => p.subfamily?.family?.nombre === categoryFilter);

  const selectedCount = filteredItems.filter(p => selected.has(p.id)).length;
  const layout = LAYOUTS[perPage];

  function toggleSelect(id) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function selectAll()   { setSelected(prev => new Set([...prev, ...filteredItems.map(p => p.id)])); }
  function deselectAll() { setSelected(prev => { const s = new Set(prev); filteredItems.forEach(p => s.delete(p.id)); return s; }); }

  // Dynamic print CSS — injected so perPage choice affects print layout
  const printCSS = `
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }

      @page { size: A4 portrait; margin: 10mm; }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      .print-area { padding: 0 !important; }

      .label-wrapper:not(.is-selected) { display: none !important; }

      /* ── Habladores ── */
      .habladores-grid {
        display: grid !important;
        grid-template-columns: repeat(${layout.cols}, 1fr) !important;
        gap: 5mm !important;
        width: 190mm !important;
        margin: 0 !important;
      }
      .hablador-box {
        width: 100% !important;
        height: ${layout.printH} !important;
      }
      .hablador {
        width: 100% !important;
        height: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }

      /* ── Etiquetas anaquel ── */
      .etiquetas-list {
        display: flex !important;
        flex-direction: column !important;
        gap: 3mm !important;
        width: 190mm !important;
      }
      .etiqueta-box {
        width: 100% !important;
        height: 3cm !important;
      }
      .etiqueta-anaquel {
        width: 100% !important;
        height: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
    }
  `;

  const btnStyle = (active) => ({
    background: active ? '#1A3C2E' : '#F0F2ED',
    color: active ? '#fff' : '#555',
    border: 'none', borderRadius: 20,
    padding: '5px 13px', fontSize: 11,
    fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'background .1s',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f2ed; font-family: Inter, sans-serif; }
        @keyframes sg-spin { to { transform: rotate(360deg); } }
      `}</style>
      <style>{printCSS}</style>

      {/* ── Header ── */}
      <div className="no-print" style={{ background: '#1A3C2E', color: '#fff', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>Selva Garden</div>
          <div style={{ fontSize: 11, color: '#A8D5B5', marginTop: 3 }}>Etiquetas de impresión</div>
        </div>
        <button
          onClick={() => window.print()}
          disabled={selectedCount === 0}
          style={{ background: selectedCount > 0 ? '#fff' : 'rgba(255,255,255,0.3)', color: selectedCount > 0 ? '#1A3C2E' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: selectedCount > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .15s' }}
        >
          🖨️ Imprimir seleccionados ({selectedCount})
        </button>
      </div>

      {/* ── Format tabs ── */}
      <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 24px', display: 'flex' }}>
        {[['habladores', 'Habladores de Plantas'], ['etiquetas', 'Etiquetas de Anaquel']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setCategoryFilter('all'); }}
            style={{ background: 'none', border: 'none', padding: '12px 16px', fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? '#1A3C2E' : '#888', borderBottom: tab === id ? '2px solid #1A3C2E' : '2px solid transparent', cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Controls bar ── */}
      {!loading && (
        <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #eaeaea', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

          {/* Category filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...families].map(f => (
              <button key={f} onClick={() => setCategoryFilter(f)} style={btnStyle(categoryFilter === f)}>
                {f === 'all' ? 'Todas' : f}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 22, background: '#e0e0e0', flexShrink: 0 }}/>

          {/* Select / deselect */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={selectAll} style={{ fontSize: 11, color: '#1A3C2E', fontWeight: 600, background: 'none', border: '1px solid #D8EDE3', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
              Seleccionar todo
            </button>
            <button onClick={deselectAll} style={{ fontSize: 11, color: '#888', fontWeight: 500, background: 'none', border: '1px solid #e0e0e0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
              Deseleccionar todo
            </button>
            <span style={{ fontSize: 11, color: '#aaa' }}>{selectedCount} de {filteredItems.length} seleccionados</span>
          </div>

          <div style={{ flex: 1 }}/>

          {/* Per page — only for habladores */}
          {tab === 'habladores' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>Etiquetas por página:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[2, 4, 6, 8].map(n => (
                  <button
                    key={n}
                    onClick={() => setPerPage(n)}
                    style={{ width: 30, height: 28, background: perPage === n ? '#1A3C2E' : '#F0F2ED', color: perPage === n ? '#fff' : '#555', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background .1s' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Print area ── */}
      <div className="print-area" style={{ padding: 24 }}>
        {loading ? (
          <div className="no-print" style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 13 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #D8EDE3', borderTopColor: '#1A3C2E', animation: 'sg-spin 0.8s linear infinite', margin: '0 auto 12px' }}/>
            Cargando etiquetas…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="no-print" style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 13 }}>
            Sin productos en esta categoría.
          </div>
        ) : tab === 'habladores' ? (

          // ── Habladores grid ──
          <div
            className="habladores-grid"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${layout.cols}, auto)`, gap: 14, justifyContent: 'start' }}
          >
            {filteredItems.map(p => {
              const isSelected = selected.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`label-wrapper${isSelected ? ' is-selected' : ''}`}
                  style={{ position: 'relative' }}
                >
                  <CheckBox checked={isSelected} onClick={() => toggleSelect(p.id)}/>
                  <div
                    className="hablador-box"
                    style={{
                      width: layout.cols === 1 ? '16cm' : '9cm',
                      height: layout.previewH,
                      outline: isSelected ? '2.5px solid #1A3C2E' : '2.5px solid transparent',
                      outlineOffset: 3,
                      borderRadius: 10,
                      overflow: 'hidden',
                      transition: 'outline-color .12s',
                    }}
                  >
                    <Hablador product={p}/>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          // ── Etiquetas anaquel list ──
          <div className="etiquetas-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '19cm' }}>
            {filteredItems.map(p => {
              const isSelected = selected.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`label-wrapper${isSelected ? ' is-selected' : ''}`}
                  style={{ position: 'relative' }}
                >
                  <CheckBox checked={isSelected} onClick={() => toggleSelect(p.id)}/>
                  <div
                    className="etiqueta-box"
                    style={{
                      height: '3cm',
                      outline: isSelected ? '2.5px solid #1A3C2E' : '2.5px solid transparent',
                      outlineOffset: 3,
                      borderRadius: 8,
                      overflow: 'hidden',
                      transition: 'outline-color .12s',
                    }}
                  >
                    <EtiquetaAnaquel product={p}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
