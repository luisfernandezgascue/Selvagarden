import { useState } from 'react';
import { Phone } from '../components';
import { Icon, SelvaLeaf } from '../icons';
import { weekProducts } from '../data';

const floatBtn = {
  width: 38, height: 38, borderRadius: '50%',
  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
  border: 'none', color: '#1A1A1A',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

function CareTile({ icon, label, val }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 2px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FAF5', color: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>{icon}</div>
      <p style={{ fontSize: 8.5, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 10.5, color: '#1A1A1A', fontWeight: 600 }}>{val}</p>
    </div>
  );
}

function SpecRow({ l, r, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--c-line-soft)', fontSize: 12 }}>
      <span style={{ color: '#888' }}>{l}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{r}</span>
    </div>
  );
}

function ProductCardSmall({ name, img, price, old, tag }) {
  return (
    <div style={{ width: 130, flexShrink: 0, background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--c-line-soft)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ height: 95, position: 'relative', background: '#EDEBE3', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : <div className="photo-placeholder" style={{ width: '100%', height: '100%' }}>plant</div>
        }
        {tag && <span style={{ position: 'absolute', top: 7, left: 7, background: 'rgba(26,60,46,0.85)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 8 }}>{tag}</span>}
      </div>
      <div style={{ padding: '9px 11px 11px' }}>
        <p style={{ fontSize: 10, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.35, marginBottom: 5, height: 26, overflow: 'hidden' }}>{name}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: '#1A3C2E' }}>${price}</span>
          {old && <span style={{ fontSize: 9, color: '#C0C0C0', textDecoration: 'line-through' }}>${old}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Producto({ onBack }) {
  const [galleryIdx, setGalleryIdx] = useState(0);
  const images = [
    'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg?auto=compress&w=800',
  ];

  return (
    <Phone>
      {/* Floating back/action bar */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, zIndex: 20, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
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
          <img src={images[galleryIdx]} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)} style={{ width: i === galleryIdx ? 22 : 7, height: 7, borderRadius: 99, background: i === galleryIdx ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', transition: 'width .2s' }}/>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 14, bottom: 48, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {images.map((src, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)} style={{ width: 44, height: 44, borderRadius: 8, padding: 0, overflow: 'hidden', border: i === galleryIdx ? '2px solid #fff' : '2px solid rgba(255,255,255,0.4)', background: '#fff' }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 18px 0', background: '#F4F6F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: '#888', marginBottom: 4 }}>Monstera deliciosa</p>
              <h1 className="h-serif" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.05 }}>
                <span style={{ fontStyle: 'italic' }}>Monstera</span><br/>Deliciosa
              </h1>
            </div>
            <div style={{ textAlign: 'right', marginLeft: 10 }}>
              <p style={{ fontSize: 11, color: '#C0C0C0', textDecoration: 'line-through' }}>$85</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, color: '#1A3C2E', lineHeight: 1 }}>$77</p>
              <p style={{ fontSize: 10, color: '#B5873A', fontWeight: 600, marginTop: 3 }}>−10% Versailles</p>
            </div>
          </div>

          <div className="divider-rule" style={{ margin: '12px 0 16px' }}>cuidados</div>

          {/* Care infographic */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px 14px', border: '1px solid var(--c-line)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            <CareTile icon={<Icon.Sun/>} label="Luz" val="Indirecta"/>
            <CareTile icon={<Icon.Droplet/>} label="Riego" val="7 días"/>
            <CareTile icon={<Icon.Thermo/>} label="Temp" val="18–28°"/>
            <CareTile icon={<Icon.Leaf/>} label="Tipo" val="Tropical"/>
            <CareTile icon={<Icon.Sparkle/>} label="Cuido" val="Fácil"/>
          </div>

          {/* Add to Mi Selva nudge */}
          <div style={{ margin: '14px 0 0', background: '#D8EDE3', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="selva-avatar" style={{ width: 36, height: 36, flexShrink: 0 }}>
              <SelvaLeaf size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#1A3C2E' }}>¿Ya la tienes en casa?</p>
              <p style={{ fontSize: 10, color: '#2D6A4F', marginTop: 2 }}>Añádela a Mi Selva para recordatorios</p>
            </div>
            <button style={{ background: 'transparent', border: '1.5px solid #1A3C2E', color: '#1A3C2E', borderRadius: 18, padding: '5px 12px', fontSize: 11, fontWeight: 600 }}>Añadir</button>
          </div>

          <div className="divider-rule" style={{ margin: '22px 0 14px' }}>la planta</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic', color: '#1A1A1A', lineHeight: 1.5, marginBottom: 10 }}>Una escultura viva.</p>
          <p style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.65, marginBottom: 14 }}>
            La Monstera Deliciosa abre sus hojas en gestos arquitectónicos que cambian el ánimo de un salón.
            Tropical y generosa, perdona los olvidos y celebra la luz indirecta. La nuestra creció en
            invernadero propio, lista para vivir contigo.
          </p>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-line)', padding: '4px 14px', marginBottom: 16 }}>
            <SpecRow l="Altura" r="60–80 cm"/>
            <SpecRow l="Matero incluido" r="Sí · Herstera Lino 18"/>
            <SpecRow l="Origen" r="Invernadero Selva · Galipán"/>
            <SpecRow l="Entrega" r="2–3 días en Caracas" last/>
          </div>

          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 10 }}>Combina perfectamente con…</p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 24, paddingBottom: 4, scrollbarWidth: 'none' }}>
            {weekProducts.slice(0, 3).map((p, i) => <ProductCardSmall key={i} {...p}/>)}
          </div>
        </div>

        <div style={{ height: 80 }}/>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 18px 22px', background: 'linear-gradient(180deg, transparent 0%, rgba(244,246,241,0.95) 30%, #F4F6F1 100%)' }}>
        <button style={{ background: '#1A3C2E', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '15px', fontSize: 14, fontWeight: 600, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 22px rgba(26,60,46,0.25)' }}>
          <Icon.Cart size={16}/> Añadir al carrito · $77
        </button>
      </div>
    </Phone>
  );
}
