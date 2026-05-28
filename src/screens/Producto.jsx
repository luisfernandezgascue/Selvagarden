import { useState, useEffect } from 'react';
import { Phone } from '../components';
import { Icon, SelvaLeaf } from '../icons';
import { useCustomer, nivelInfo } from '../context/CustomerContext';
import { fetchProductWithCare } from '../lib/db';
import { supabase } from '../lib/supabase';

const floatBtn = {
  width: 38, height: 38, borderRadius: '50%',
  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
  border: 'none', color: '#1A1A1A',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

function SpecRow({ l, r, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--c-line-soft)', fontSize: 12 }}>
      <span style={{ color: '#888' }}>{l}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{r}</span>
    </div>
  );
}

export default function Producto({ product: productProp, onBack }) {
  const { addToCart, customer } = useCustomer();
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [product, setProduct] = useState(productProp || null);
  const [careData, setCareData] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!productProp?.id) return;

    async function load() {
      console.log('Product ID:', productProp?.id);

      const data = await fetchProductWithCare(productProp.id);
      if (data) setProduct(data);

      if (supabase) {
        const { data: care, error: careError } = await supabase
          .from('plant_care')
          .select('*')
          .eq('product_id', productProp.id)
          .maybeSingle();
        console.log('Care data:', care);
        console.log('Care error:', careError);
        setCareData(care);
      }
    }

    load();
  }, [productProp?.id]);

  const discount = nivelInfo(customer?.nivel_lealtad).descuento;

  if (!product) {
    return (
      <Phone>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #D8EDE3', borderTopColor: '#1A3C2E', animation: 'spinSlow 0.8s linear infinite' }}/>
        </div>
      </Phone>
    );
  }

  const images = product.imagen_url
    ? [product.imagen_url]
    : ['https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&w=800'];

  const finalPrice = (product.precio_venta || 0) * (1 - discount / 100);
  const subfamily = product.subfamily?.nombre || '';
  const fullName = [product.nombre, product.color, product.talla].filter(Boolean).join(' ');

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Phone>
      {/* Floating back/action bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 14px 8px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <button onClick={onBack} style={{ ...floatBtn, pointerEvents: 'auto' }}>
          <Icon.ArrowLeft size={18}/>
        </button>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button style={floatBtn}><Icon.Heart size={16}/></button>
          <button style={floatBtn}><Icon.Share size={16}/></button>
        </div>
      </div>

      <div className="scroll">
        {/* Hero image */}
        <div style={{ position: 'relative', height: 430, background: '#EDEBE3' }}>
          <img src={images[galleryIdx]} alt={product.nombre} onError={e => { e.target.src = 'https://picsum.photos/seed/plant/800/800'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setGalleryIdx(i)} style={{ width: i === galleryIdx ? 22 : 7, height: 7, borderRadius: 99, background: i === galleryIdx ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', transition: 'width .2s' }}/>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 18px 0', background: '#F4F6F1' }}>
          {/* Name + price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {subfamily && <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: '#888', marginBottom: 4 }}>{subfamily}</p>}
              <h1 className="h-serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>{fullName}</h1>
            </div>
            <div style={{ textAlign: 'right', marginLeft: 10 }}>
              {discount > 0 && <p style={{ fontSize: 11, color: '#C0C0C0', textDecoration: 'line-through' }}>${product.precio_venta}</p>}
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, color: '#1A3C2E', lineHeight: 1 }}>${finalPrice.toFixed(2)}</p>
              {discount > 0 && <p style={{ fontSize: 10, color: '#B5873A', fontWeight: 600, marginTop: 3 }}>−{discount}% {nivelInfo(customer?.nivel_lealtad).label}</p>}
            </div>
          </div>

          {/* Mi Selva nudge */}
          <div style={{ margin: '0 0 14px', background: '#D8EDE3', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="selva-avatar" style={{ width: 36, height: 36, flexShrink: 0 }}>
              <SelvaLeaf size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#1A3C2E' }}>¿Ya la tienes en casa?</p>
              <p style={{ fontSize: 10, color: '#2D6A4F', marginTop: 2 }}>Añádela a Mi Selva para recordatorios</p>
            </div>
            <button style={{ background: 'transparent', border: '1.5px solid #1A3C2E', color: '#1A3C2E', borderRadius: 18, padding: '5px 12px', fontSize: 11, fontWeight: 600 }}>Añadir</button>
          </div>

          {/* Description */}
          {product.descripcion && (
            <>
              <div className="divider-rule" style={{ margin: '6px 0 14px' }}>la planta</div>
              <p style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.65, marginBottom: 14 }}>{product.descripcion}</p>
            </>
          )}

          {/* Care infographic */}
          {careData && (
            <div style={{ margin: '16px 0' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1A3C2E', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Cuidados
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: '☀️', label: 'Luz',         value: careData.luz },
                  { icon: '💧', label: 'Riego',       value: careData.riego },
                  { icon: '🌡️', label: 'Temperatura', value: careData.temperatura },
                  { icon: '🌱', label: 'Abono',       value: careData.abono },
                ].map(item => item.value ? (
                  <div key={item.label} style={{ background: '#F0FAF5', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22 }}>{item.icon}</div>
                    <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', margin: '3px 0 2px', letterSpacing: '0.06em' }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3C2E' }}>{item.value}</div>
                  </div>
                ) : null)}
              </div>
              {careData.dificultad && (
                <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: '#2D6A4F' }}>
                  {careData.dificultad === 'Facil'   && '⭐ Fácil'}
                  {careData.dificultad === 'Media'   && '⭐⭐ Nivel medio'}
                  {careData.dificultad === 'Experto' && '⭐⭐⭐ Para expertos'}
                  {careData.dificultad === 'facil'   && '⭐ Fácil'}
                  {careData.dificultad === 'media'   && '⭐⭐ Nivel medio'}
                  {careData.dificultad === 'experto' && '⭐⭐⭐ Para expertos'}
                </div>
              )}
            </div>
          )}

          {/* Delivery */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-line)', padding: '4px 14px', marginBottom: 16 }}>
            <SpecRow l="Entrega" r="2–3 días en Caracas" last/>
          </div>

          <div style={{ height: 80 }}/>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 18px max(22px, env(safe-area-inset-bottom))', background: 'linear-gradient(180deg, transparent 0%, rgba(244,246,241,0.95) 30%, #F4F6F1 100%)' }}>
        <button
          onClick={handleAddToCart}
          style={{ background: added ? '#2D6A4F' : '#1A3C2E', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '15px', fontSize: 14, fontWeight: 600, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 22px rgba(26,60,46,0.25)', transition: 'background .2s' }}
        >
          <Icon.Cart size={16}/> {added ? '¡Añadido al carrito!' : `Añadir al carrito · $${finalPrice.toFixed(2)}`}
        </button>
      </div>
    </Phone>
  );
}
