import { useState } from 'react';
import { Icon } from '../icons';
import { supabase } from '../lib/supabase';

const inp = {
  background: 'transparent', border: 'none', outline: 'none',
  fontFamily: 'var(--font-sans)', fontSize: 12, color: '#1A1A1A',
  width: '100%', padding: '2px 4px', borderBottom: '1px solid transparent',
};

const btnGhost = {
  background: '#fff', border: '1px solid var(--c-line)', borderRadius: 18,
  padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#1A1A1A',
  display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
};

const fieldStyle = {
  background: '#FAF9F4', border: '1px solid var(--c-line)', borderRadius: 8,
  padding: '9px 11px', fontSize: 12, color: '#1A1A1A', width: '100%',
  fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
};

function PriceRow({ l, r, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid var(--c-line-soft)', fontWeight: bold ? 700 : 400 }}>
      <span style={{ fontSize: bold ? 13 : 12, color: '#1A1A1A' }}>{l}</span>
      <span style={{ fontFamily: bold ? 'var(--font-serif)' : 'var(--font-sans)', fontSize: bold ? 16 : 12, color: bold ? '#2D5A3D' : '#4A4A4A', fontWeight: bold ? 600 : 500 }}>{r}</span>
    </div>
  );
}

function SliderRow({ label, pct, setPct, max = 100 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#4A4A4A' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#2D5A3D', fontWeight: 700 }}>{pct}%</span>
      </div>
      <input type="range" min="0" max={max} value={pct} onChange={e => setPct(+e.target.value)} style={{ width: '100%', accentColor: '#2D5A3D', height: 4 }}/>
    </div>
  );
}

function FieldRow({ label, required, children }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, color: '#888', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>{label}{required && <span style={{ color: '#B8956A' }}> *</span>}</p>
      {children}
    </div>
  );
}

const WA_NUMBER = '584120000000';

export default function Calculadora({ onBack }) {
  const [flowers, setFlowers] = useState([
    { name: 'Rosa roja ecuatoriana', qty: 24, unit: 1.20 },
    { name: 'Eucalipto plateado',    qty: 6,  unit: 0.80 },
    { name: 'Gypsophila',            qty: 3,  unit: 1.10 },
    { name: 'Hortensia azul',        qty: 2,  unit: 4.50 },
  ]);
  const [materials, setMaterials] = useState(3.50);
  const [servicePct, setServicePct] = useState(35);
  const [marginPct, setMarginPct] = useState(20);

  // Client fields
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [notas, setNotas] = useState('');

  // Send state
  const [sendStatus, setSendStatus] = useState('idle'); // idle | loading | ok | error
  const [sendMsg, setSendMsg] = useState('');

  const flowerCost = flowers.reduce((s, f) => s + f.qty * f.unit, 0);
  const subtotal = flowerCost + materials;
  const service = subtotal * (servicePct / 100);
  const beforeMargin = subtotal + service;
  const margin = beforeMargin * (marginPct / 100);
  const total = beforeMargin + margin;
  const rounded = Math.ceil(total / 5) * 5;
  const manoDeObra = parseFloat((service + margin).toFixed(2));

  const updateFlower = (i, field, val) => setFlowers(f => f.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  const addFlower = () => setFlowers(f => [...f, { name: 'Nueva flor', qty: 1, unit: 1.00 }]);
  const removeFlower = (i) => setFlowers(f => f.filter((_, idx) => idx !== i));

  const waMsg = `🌿 *Cotización Selva Garden*\n\n${flowers.map(f => `${f.qty}× ${f.name} — $${(f.qty * f.unit).toFixed(2)}`).join('\n')}\n\nMateriales: $${materials.toFixed(2)}\nServicio (${servicePct}%): $${service.toFixed(2)}\nSubtotal: $${beforeMargin.toFixed(2)}\n\n*Total: $${rounded}*\n\nEntrega Caracas 24h.`;
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  async function handleEnviar() {
    if (!clienteEmail.trim()) {
      setSendMsg('⚠️ El email del cliente es obligatorio');
      return;
    }
    if (!supabase) {
      setSendMsg('⚠️ Supabase no configurado');
      return;
    }
    setSendStatus('loading');
    setSendMsg('');

    const items = flowers.map(f => ({
      nombre: f.name,
      cantidad: f.qty,
      precio_unit: f.unit,
      subtotal: parseFloat((f.qty * f.unit).toFixed(2)),
    }));

    const payload = {
      cliente_email: clienteEmail.trim(),
      cliente_nombre: clienteNombre.trim() || null,
      cliente_telefono: clienteTelefono.trim() || null,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      porcentaje_servicio: servicePct,
      mano_de_obra: manoDeObra,
      total: rounded,
      notas: notas.trim() || null,
      estado: 'enviado',
    };

    const { data: presupuesto, error } = await supabase
      .from('presupuestos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      setSendStatus('error');
      setSendMsg(`⚠️ Error guardando: ${error.message}`);
      return;
    }

    try {
      await fetch('/api/send-presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuesto.id, ...payload }),
      });
    } catch (e) {
      console.warn('[Calculadora] send-presupuesto fetch failed:', e.message);
    }

    setSendStatus('ok');
    setSendMsg(`✅ Presupuesto enviado a ${clienteEmail}`);
  }

  return (
    <div style={{ width: 760, height: 920, background: '#fff', fontFamily: 'var(--font-sans)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
      {/* Window chrome */}
      <div style={{ height: 36, background: '#F8F7F2', borderBottom: '1px solid var(--c-line)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 7, flexShrink: 0 }}>
        <span onClick={onBack} style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57', cursor: 'pointer', display: 'block' }}/>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E', display: 'block' }}/>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840', display: 'block' }}/>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#888', letterSpacing: '0.04em' }}>Calculadora · Floristería Selva Garden — herramienta interna</span>
        <div style={{ width: 33 }}/>
      </div>

      {/* Header */}
      <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid var(--c-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2D5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><img src="/brand/SelvaGarden_pictograma_oscuro_512.png" alt="Selva" style={{ width: 22, height: 22, objectFit: 'contain' }}/></div>
          <div>
            <p className="eyebrow" style={{ color: '#B8956A' }}>Selva Garden · interna</p>
            <h2 className="h-serif" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1 }}>
              Calculadora de <span style={{ fontStyle: 'italic' }}>arreglos</span>
            </h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost}><Icon.Camera size={16}/> Subir foto del cliente</button>
          <button style={btnGhost} onClick={() => { setFlowers([{ name: 'Nueva flor', qty: 1, unit: 1.00 }]); setClienteNombre(''); setClienteEmail(''); setClienteTelefono(''); setNotas(''); setSendStatus('idle'); setSendMsg(''); }}>Limpiar</button>
        </div>
      </div>

      {/* Body 2-col */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', overflow: 'hidden', minHeight: 0 }}>

        {/* Left: flower list + client fields */}
        <div style={{ padding: '22px 28px', overflowY: 'auto', borderRight: '1px solid var(--c-line)' }}>
          <div style={{ background: '#F5EDD8', border: '1px dashed rgba(184,149,106,0.4)', borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#B8956A' }}><Icon.Sparkle size={18}/></span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6B5A3A' }}>AI detectó 4 tipos de flor en la foto del cliente</p>
              <p style={{ fontSize: 10.5, color: '#8B7A4F', marginTop: 2 }}>Rosas (24), eucalipto, gypsophila, hortensia · ajusta abajo</p>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#B8956A', fontSize: 11, fontWeight: 600 }}>Ver foto</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Flores</h3>
            <button onClick={addFlower} style={{ ...btnGhost, padding: '5px 10px', fontSize: 11 }}>
              <Icon.Plus size={14}/> Añadir flor
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 90px 24px', gap: 8, padding: '0 8px', fontSize: 9.5, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              <span>Flor</span><span style={{ textAlign: 'center' }}>Cantidad</span><span style={{ textAlign: 'right' }}>Unitario</span><span style={{ textAlign: 'right' }}>Subtotal</span><span/>
            </div>
            {flowers.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 90px 24px', gap: 8, background: '#FAF9F4', borderRadius: 10, padding: '9px 8px', alignItems: 'center' }}>
                <input value={f.name} onChange={e => updateFlower(i, 'name', e.target.value)} style={inp}/>
                <input type="number" value={f.qty} onChange={e => updateFlower(i, 'qty', +e.target.value || 0)} style={{ ...inp, textAlign: 'center' }}/>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                  <span style={{ fontSize: 11, color: '#888' }}>$</span>
                  <input type="number" step="0.10" value={f.unit} onChange={e => updateFlower(i, 'unit', +e.target.value || 0)} style={{ ...inp, textAlign: 'right', width: 60 }}/>
                </div>
                <span style={{ textAlign: 'right', fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600, color: '#2D5A3D' }}>
                  ${(f.qty * f.unit).toFixed(2)}
                </span>
                <button onClick={() => removeFlower(i)} style={{ background: 'none', border: 'none', color: '#C0C0C0', fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>

          {/* Client section */}
          <div style={{ marginTop: 26, borderTop: '1px solid var(--c-line)', paddingTop: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Cliente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FieldRow label="Nombre del cliente">
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  style={fieldStyle}
                />
              </FieldRow>
              <FieldRow label="Email del cliente" required>
                <input
                  type="email"
                  value={clienteEmail}
                  onChange={e => setClienteEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  style={{ ...fieldStyle, borderColor: !clienteEmail && sendMsg.includes('email') ? '#B8956A' : undefined }}
                />
              </FieldRow>
              <FieldRow label="Teléfono">
                <input
                  type="tel"
                  value={clienteTelefono}
                  onChange={e => setClienteTelefono(e.target.value)}
                  placeholder="+58 412 0000000"
                  style={fieldStyle}
                />
              </FieldRow>
              <FieldRow label="Notas adicionales">
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Instrucciones especiales, fecha de entrega, etc."
                  rows={3}
                  style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </FieldRow>
            </div>
          </div>
        </div>

        {/* Right: pricing summary */}
        <div style={{ background: '#FAF9F4', padding: '22px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Precio</h3>

          <PriceRow l="Flores" r={`$${flowerCost.toFixed(2)}`}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--c-line-soft)' }}>
            <span style={{ fontSize: 12, color: '#4A4A4A' }}>Materiales</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 11, color: '#888' }}>$</span>
              <input type="number" step="0.10" value={materials} onChange={e => setMaterials(+e.target.value || 0)} style={{ ...inp, textAlign: 'right', width: 64 }}/>
            </div>
          </div>
          <PriceRow l="Subtotal" r={`$${subtotal.toFixed(2)}`} bold/>

          <div style={{ margin: '14px 0 4px' }}>
            <SliderRow label="Servicio" pct={servicePct} setPct={setServicePct} max={80}/>
            <SliderRow label="Margen"   pct={marginPct}  setPct={setMarginPct}  max={60}/>
          </div>

          <PriceRow l={`+ Servicio (${servicePct}%)`} r={`$${service.toFixed(2)}`}/>
          <PriceRow l={`+ Margen (${marginPct}%)`} r={`$${margin.toFixed(2)}`}/>

          <div style={{ flex: 1 }}/>

          {/* Total */}
          <div style={{ background: 'linear-gradient(135deg, #2D5A3D 0%, #3D7A55 100%)', color: '#fff', borderRadius: 14, padding: '16px 18px', marginTop: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -15, top: -15, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.3), transparent 70%)' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', position: 'relative' }}>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Total redondeado</p>
                <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>De ${total.toFixed(2)} → $5 más cercano</p>
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 600, lineHeight: 1 }}>${rounded}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => navigator.clipboard?.writeText(waMsg)}
              style={{ background: '#fff', color: '#1A1A1A', border: '1px solid var(--c-line)', borderRadius: 'var(--r-btn)', padding: '11px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.4 14c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9 0 .1.1.3 0 .5l-.3.4c-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.6-.2.2.1 1.5.7 1.7.8.2.1.4.2.5.3.1.1.1.6-.1 1.2z"/></svg>
              Copiar para WhatsApp
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#25D366', color: '#fff', borderRadius: 'var(--r-btn)', padding: '11px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.4 14c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9 0 .1.1.3 0 .5l-.3.4c-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.6-.2.2.1 1.5.7 1.7.8.2.1.4.2.5.3.1.1.1.6-.1 1.2z"/></svg>
              📱 Abrir WhatsApp
            </a>

            <button
              onClick={handleEnviar}
              disabled={sendStatus === 'loading'}
              style={{ background: sendStatus === 'ok' ? '#3D7A55' : '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '13px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: sendStatus === 'loading' ? 'default' : 'pointer', opacity: sendStatus === 'loading' ? 0.75 : 1 }}
            >
              {sendStatus === 'loading'
                ? <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', animation: 'spinSlow 0.8s linear infinite' }}/>
                : '📧'
              }
              {sendStatus === 'loading' ? 'Enviando…' : sendStatus === 'ok' ? '¡Enviado!' : 'Enviar presupuesto'}
            </button>

            {sendMsg && (
              <p style={{ fontSize: 11, color: sendStatus === 'error' ? '#B8956A' : '#3D7A55', textAlign: 'center', lineHeight: 1.4 }}>{sendMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
