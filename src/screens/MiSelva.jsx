import { useState, useEffect, useRef } from 'react';
import { Phone, TabBar } from '../components';
import { Icon, SelvaLeaf } from '../icons';
import { useCustomer } from '../context/CustomerContext';
import { fetchOrders } from '../lib/db';
import { fetchProductWithCare } from '../lib/db';

const REMINDERS_KEY = 'selva_reminders';

function loadReminders() {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '{}'); } catch { return {}; }
}

function saveReminder(plantId, days) {
  const all = loadReminders();
  all[plantId] = { days, next: Date.now() + days * 86400000 };
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(all));
}

async function requestAndDemo(plant) {
  if (!('Notification' in window)) return alert('Tu navegador no soporta notificaciones');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;
  setTimeout(() => {
    new Notification(`🌿 ${plant.nombre}`, {
      body: `Recordatorio: es hora de revisar tu ${plant.nombre}`,
      icon: plant.imagen_url || 'https://picsum.photos/seed/plant/64/64',
    });
  }, 5000);
}

function ReminderSheet({ plant, onClose }) {
  const existing = loadReminders()[plant.nombre];
  const [days, setDays] = useState(existing?.days || 7);

  async function handleSave() {
    saveReminder(plant.nombre, days);
    await requestAndDemo(plant);
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#F5F0E8', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430 }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Recordatorio de riego</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>{plant.nombre}</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[7, 14, 21].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${days === d ? '#2D5A3D' : 'var(--c-line)'}`, background: days === d ? '#E8F0EA' : '#fff', fontWeight: 600, fontSize: 13, color: days === d ? '#2D5A3D' : '#888' }}>
              {d} días
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 16, textAlign: 'center' }}>Recibirás una notificación de prueba en 5 segundos</p>
        <button onClick={handleSave} style={{ width: '100%', background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
          Activar recordatorio
        </button>
        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#888', fontSize: 13 }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Mis Plantas tab ────────────────────────────────────────────────────────

function PlantRow({ item, onViewCare, onReminder }) {
  const reminders = loadReminders();
  const hasReminder = !!reminders[item.nombre];

  return (
    <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 14, padding: 10, display: 'flex', gap: 11, alignItems: 'center' }}>
      <div style={{ width: 54, height: 54, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#EDEBE3' }}>
        {item.imagen_url && <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{item.nombre}</p>
        <p style={{ fontSize: 10, color: '#888', marginTop: 1 }}>Comprada · {item.fecha}</p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onReminder(item)}
          style={{ width: 32, height: 32, borderRadius: '50%', background: hasReminder ? '#E8F0EA' : '#F0F0F0', border: 'none', color: hasReminder ? '#2D5A3D' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon.Bell size={14}/>
        </button>
        <button
          onClick={() => onViewCare(item)}
          style={{ background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 18, padding: '6px 12px', fontSize: 10, fontWeight: 600 }}
        >
          Cuidados
        </button>
      </div>
    </div>
  );
}

function CareModal({ plant, onClose }) {
  const [care, setCare] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (plant?.product_id) {
      fetchProductWithCare(plant.product_id).then(data => setCare(data?.plant_care));
    }
  }, [plant?.product_id]);

  if (!plant) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#F5F0E8', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{plant.nombre}</h3>
        {care ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {care.luz && <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon.Sun size={18}/><div><p style={{ fontSize: 12, fontWeight: 600 }}>Luz</p><p style={{ fontSize: 11, color: '#888' }}>{care.luz}</p></div>
            </div>}
            {care.riego && <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon.Droplet size={18}/><div><p style={{ fontSize: 12, fontWeight: 600 }}>Riego</p><p style={{ fontSize: 11, color: '#888' }}>{care.riego}</p></div>
            </div>}
            {care.temperatura && <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon.Thermo size={18}/><div><p style={{ fontSize: 12, fontWeight: 600 }}>Temperatura</p><p style={{ fontSize: 11, color: '#888' }}>{care.temperatura}</p></div>
            </div>}
            {care.notas && <div style={{ background: '#E8F0EA', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Notas</p>
              <p style={{ fontSize: 11, color: '#4A4A4A', lineHeight: 1.5 }}>{care.notas}</p>
            </div>}
            {care.video_url && (
              videoOpen ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
                  <iframe width="100%" height="100%" src={care.video_url.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen style={{ display: 'block' }}/>
                </div>
              ) : (
                <button onClick={() => setVideoOpen(true)} style={{ background: '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon.Play size={14}/> Ver video de cuidados
                </button>
              )
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#888', padding: '16px 0' }}>No hay información de cuidados disponible para esta planta.</p>
        )}
        <button onClick={onClose} style={{ width: '100%', marginTop: 16, background: 'none', border: '1px solid var(--c-line)', borderRadius: 'var(--r-btn)', padding: '12px', fontSize: 13, color: '#888' }}>Cerrar</button>
      </div>
    </div>
  );
}

function MisPlantasTab() {
  const { customer } = useCustomer();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [reminderPlant, setReminderPlant] = useState(null);

  useEffect(() => {
    if (!customer?.id) { setLoading(false); return; }
    fetchOrders(customer.id).then(orders => {
      const items = [];
      orders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            items.push({
              product_id: item.product_id,
              nombre: item.nombre,
              imagen_url: item.imagen_url || null,
              fecha: new Date(order.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }),
            });
          });
        }
      });
      setPlants(items);
      setLoading(false);
    });
  }, [customer?.id]);

  if (loading) return <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E8F0EA', borderTopColor: '#2D5A3D', animation: 'spinSlow 0.8s linear infinite' }}/></div>;

  if (plants.length === 0) return (
    <div style={{ padding: '40px 18px', textAlign: 'center' }}>
      <div className="selva-avatar breathing" style={{ width: 64, height: 64, margin: '0 auto 16px' }}><SelvaLeaf size={32}/></div>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>Tu selva está vacía</p>
      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Las plantas de tus pedidos aparecerán aquí</p>
    </div>
  );

  return (
    <>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plants.map((p, i) => <PlantRow key={i} item={p} onViewCare={setSelectedPlant} onReminder={setReminderPlant}/>)}
      </div>
      {selectedPlant && <CareModal plant={selectedPlant} onClose={() => setSelectedPlant(null)}/>}
      {reminderPlant && <ReminderSheet plant={reminderPlant} onClose={() => setReminderPlant(null)}/>}
    </>
  );
}

// ─── Diagnosticar tab ────────────────────────────────────────────────────────

function DiagnosticarTab() {
  const { customer } = useCustomer();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview({ src: ev.target.result, file });
    reader.readAsDataURL(file);
    setResult(null);
    setError(null);
  }

  async function handleDiagnose() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = preview.src.split(',')[1];
      const mimeType = preview.file.type || 'image/jpeg';
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el diagnóstico');
      setResult(data.result || data.diagnosis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '12px 14px 24px' }}>
      <div style={{ margin: '0 0 16px', padding: '20px 18px', background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#2D5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#F5EDD8' }}>
          <Icon.Camera size={24}/>
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Diagnosticar planta</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 16 }}>Sube una foto y nuestro experto botánico virtual analiza tu planta al instante.</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }}/>
        <button
          onClick={() => fileRef.current?.click()}
          style={{ background: '#F0FAF5', color: '#2D5A3D', border: '1.5px dashed #A8D5B5', borderRadius: 12, padding: '14px 24px', fontSize: 13, fontWeight: 600, width: '100%' }}
        >
          {preview ? 'Cambiar foto' : 'Subir foto de tu planta'}
        </button>
      </div>

      {preview && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', height: 220, marginBottom: 12 }}>
            <img src={preview.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <button
            onClick={handleDiagnose}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#A8D5B5' : '#2D5A3D', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 14, fontWeight: 600 }}
          >
            {loading ? 'Analizando…' : 'Analizar esta planta'}
          </button>
        </div>
      )}

      {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: '#C62828' }}>{error}</p>
      </div>}

      {result && (
        <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="selva-avatar" style={{ width: 36, height: 36, flexShrink: 0 }}><SelvaLeaf size={18}/></div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2D5A3D' }}>Diagnóstico de Selva Garden</p>
          </div>
          <p style={{ fontSize: 13, color: '#333', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{result}</p>
        </div>
      )}
    </div>
  );
}

// ─── Inspiración tab ─────────────────────────────────────────────────────────

function InspiracionTab() {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview({ src: ev.target.result, file });
    reader.readAsDataURL(file);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = preview.src.split(',')[1];
      const mimeType = preview.file.type || 'image/jpeg';
      const res = await fetch('/api/ramo-inspiration', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el análisis');
      setResult(data.result || data.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const whatsappMsg = result ? encodeURIComponent(`Hola Selva Garden! Me gustaría un ramo similar a este. Análisis: ${result.slice(0, 200)}`) : '';

  return (
    <div style={{ padding: '12px 14px 24px' }}>
      <div style={{ margin: '0 0 16px', padding: '20px 18px', background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#B8956A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff' }}>
          <Icon.Sparkle size={24}/>
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Inspiración floral</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 16 }}>Sube la foto de un ramo que te gustó y te decimos cómo recrearlo.</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }}/>
        <button
          onClick={() => fileRef.current?.click()}
          style={{ background: '#FBF6ED', color: '#B8956A', border: '1.5px dashed rgba(184,149,106,0.4)', borderRadius: 12, padding: '14px 24px', fontSize: 13, fontWeight: 600, width: '100%' }}
        >
          {preview ? 'Cambiar foto' : 'Subir foto de inspiración'}
        </button>
      </div>

      {preview && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', height: 220, marginBottom: 12 }}>
            <img src={preview.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#D4AA6B' : '#B8956A', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px', fontSize: 14, fontWeight: 600 }}
          >
            {loading ? 'Analizando…' : 'Analizar este ramo'}
          </button>
        </div>
      )}

      {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: '#C62828' }}>{error}</p>
      </div>}

      {result && (
        <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: '18px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#B8956A', marginBottom: 10 }}>Análisis floral</p>
          <p style={{ fontSize: 13, color: '#333', lineHeight: 1.65, whiteSpace: 'pre-line', marginBottom: 16 }}>{result}</p>
          <a
            href={`https://wa.me/584000000000?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '13px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Pedir por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Cuidados tab ─────────────────────────────────────────────────────────────

const CARE_DATA = [
  { nombre: 'Monstera Deliciosa', emoji: '🌿', luz: 'Indirecta', riego: '7 días', temp: '18–28°', img: 'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&w=300' },
  { nombre: 'Sansevieria Zeylanica', emoji: '🗡️', luz: 'Indirecta/Sombra', riego: '14 días', temp: '15–30°', img: 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=300' },
  { nombre: 'Pothos Marble Queen', emoji: '🍃', luz: 'Indirecta', riego: '10 días', temp: '15–25°', img: 'https://images.pexels.com/photos/6913404/pexels-photo-6913404.jpeg?auto=compress&w=300' },
  { nombre: 'Orquídea Phalaenopsis', emoji: '🌸', luz: 'Indirecta', riego: '10 días', temp: '18–25°', img: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&w=300' },
  { nombre: 'Cactus variado', emoji: '🌵', luz: 'Sol directo', riego: '21 días', temp: '10–35°', img: 'https://images.pexels.com/photos/1048036/pexels-photo-1048036.jpeg?auto=compress&w=300' },
  { nombre: 'Ficus Lyrata', emoji: '🌳', luz: 'Directa suave', riego: '7 días', temp: '18–24°', img: 'https://images.pexels.com/photos/6297517/pexels-photo-6297517.jpeg?auto=compress&w=300' },
];

function CuidadosTab() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = CARE_DATA.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '12px 14px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--c-line)', marginBottom: 14 }}>
        <Icon.Search size={14}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar planta…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'var(--font-sans)' }}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map((plant, i) => (
          <div key={i} onClick={() => setSelected(plant)} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--c-line-soft)', cursor: 'pointer' }}>
            <div style={{ height: 90, overflow: 'hidden' }}>
              <img src={plant.img} alt={plant.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <div style={{ padding: '10px 10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 6 }}>{plant.nombre}</p>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 9, background: '#E8F0EA', color: '#2D5A3D', borderRadius: 6, padding: '2px 6px', fontWeight: 600 }}>{plant.riego}</span>
                <span style={{ fontSize: 9, background: '#FBF6ED', color: '#B8956A', borderRadius: 6, padding: '2px 6px', fontWeight: 600 }}>{plant.luz}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#F5F0E8', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 430 }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: '#D0D0D0', margin: '0 auto 20px' }}/>
            <div style={{ height: 160, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              <img src={selected.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 14 }}>{selected.nombre}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[['Luz', selected.luz], ['Riego', selected.riego], ['Temperatura', selected.temp]].map(([k, v]) => (
                <div key={k} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>{k}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#2D5A3D' }}>{v}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', background: 'none', border: '1px solid var(--c-line)', borderRadius: 'var(--r-btn)', padding: '12px', fontSize: 13, color: '#888' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'plantas',      label: 'Mis Plantas',   sub: 'Tu colección personal',    emoji: '🌿', bg: '#E8F0EA' },
  { id: 'diagnosticar', label: 'Diagnosticar',  sub: 'Analiza tu planta con IA', emoji: '📸', bg: '#F0FAF5' },
  { id: 'inspiracion',  label: 'Inspirar Ramo', sub: 'Diseña tu ramo ideal',     emoji: '🎨', bg: '#FBF6ED' },
  { id: 'cuidados',     label: 'Cuidados',       sub: 'Guías y videos',           emoji: '📹', bg: '#F5EDD8' },
];

export default function MiSelva({ onTab }) {
  const { customer } = useCustomer();
  const [section, setSection] = useState(null);

  const nombre = customer?.nombre?.split(' ')[0] || 'viajero';
  const active = SECTIONS.find(s => s.id === section);

  if (section) {
    return (
      <Phone>
        <div style={{ flexShrink: 0 }}>
          <div style={{ padding: '8px 18px 0', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <button onClick={() => setSection(null)} style={{ background: 'none', border: 'none', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
              <Icon.ArrowLeft size={18}/> Mi Selva
            </button>
          </div>
          <div style={{ padding: '6px 18px 12px', borderBottom: '1px solid var(--c-line-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{active?.emoji}</span>
            <p style={{ fontSize: 11, color: '#888', letterSpacing: '0.14em', fontWeight: 600 }}>{active?.label.toUpperCase()}</p>
          </div>
        </div>
        <div className="scroll">
          {section === 'plantas'      && <MisPlantasTab/>}
          {section === 'diagnosticar' && <DiagnosticarTab/>}
          {section === 'inspiracion'  && <InspiracionTab/>}
          {section === 'cuidados'     && <CuidadosTab/>}
        </div>
        <TabBar active="selva" onChange={onTab}/>
      </Phone>
    );
  }

  return (
    <Phone>
      <div style={{ flexShrink: 0 }}>
        <div style={{ padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.Settings size={20}/></button>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.14em', fontWeight: 600 }}>MI SELVA</span>
          <button style={{ background: 'none', border: 'none', color: '#1A1A1A' }}><Icon.Bell size={20}/></button>
        </div>
      </div>

      <div className="scroll">
        {/* Greeting */}
        <div style={{ padding: '4px 18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="selva-avatar breathing" style={{ width: 48, height: 48, flexShrink: 0 }}><SelvaLeaf size={24}/></div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2 }}>Hola, {nombre}</p>
            <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>¿Qué hacemos hoy con tu selva?</p>
          </div>
        </div>

        {/* 2×2 grid */}
        <div style={{ padding: '0 14px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{ background: '#fff', border: '1px solid var(--c-line-soft)', borderRadius: 18, padding: '18px 14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {s.emoji}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>{s.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <TabBar active="selva" onChange={onTab}/>
    </Phone>
  );
}
