import { useState, useEffect } from 'react';
import { Phone, TabBar, iconBtn } from '../components';
import { Icon } from '../icons';
import { fetchProducts } from '../lib/db';
import { useCustomer } from '../context/CustomerContext';

function ProductCardLarge({ product, discount, onProduct, onAddToCart }) {
  const finalPrice = (product.precio_venta || 0) * (1 - discount / 100);
  const familyName = product.subfamily?.family?.nombre || '';
  const subfamilyName = product.subfamily?.nombre || '';

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--c-line-soft)', cursor: 'pointer' }}>
      <div onClick={() => onProduct(product)} style={{ aspectRatio: '1/1.05', position: 'relative', background: '#EDEBE3', overflow: 'hidden' }}>
        {product.imagen_url
          ? <img src={product.imagen_url} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : <div className="photo-placeholder" style={{ width: '100%', height: '100%' }}>plant photo</div>
        }
        {product.destacado && <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(26,60,46,0.85)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.08em' }}>DESTACADO</span>}
        <button style={{ position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.88)', border: 'none', color: '#1A3C2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Heart size={14}/>
        </button>
      </div>
      <div style={{ padding: '10px 11px 12px' }}>
        {subfamilyName && <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 10, color: '#888', marginBottom: 2 }}>{subfamilyName}</p>}
        <p onClick={() => onProduct(product)} style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.3, marginBottom: 8, height: 30, overflow: 'hidden' }}>{product.nombre}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: '#1A3C2E' }}>${finalPrice.toFixed(2)}</span>
            {discount > 0 && <span style={{ fontSize: 10, color: '#C0C0C0', textDecoration: 'line-through' }}>${product.precio_venta}</span>}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            style={{ width: 28, height: 28, borderRadius: '50%', background: '#1A3C2E', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.Plus size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tienda({ onTab, onProduct }) {
  const { addToCart, cartCount, setCartOpen, discount } = useCustomer();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  // Build category list from product families
  const families = ['TODOS', ...Array.from(new Set(
    products.map(p => p.subfamily?.family?.nombre?.toUpperCase()).filter(Boolean)
  ))];

  const filtered = products.filter(p => {
    const matchesCat = cat === 'TODOS' || p.subfamily?.family?.nombre?.toUpperCase() === cat;
    const matchesSearch = !search || p.nombre?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function handleAddToCart(product) {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <Phone>
      <div style={{ flexShrink: 0, padding: '4px 18px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 className="h-serif" style={{ fontSize: 24, fontWeight: 600 }}>
            <span style={{ fontStyle: 'italic' }}>Tienda</span>
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={iconBtn}><Icon.Search/></button>
            <button
              onClick={() => setCartOpen(true)}
              style={{ ...iconBtn, position: 'relative' }}
            >
              <Icon.Cart/>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#B5873A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid #F4F6F1' }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--c-line)' }}>
          <Icon.Search size={16} weight={1.8}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Busca plantas, flores, materos…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'var(--font-sans)' }}
          />
        </div>
      </div>

      <div className="scroll">
        {/* Category tabs */}
        {families.length > 1 && (
          <div style={{ display: 'flex', gap: 18, overflowX: 'auto', padding: '4px 18px 8px', borderBottom: '1px solid var(--c-line-soft)', scrollbarWidth: 'none' }}>
            {families.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                background: 'none', border: 'none', padding: '8px 0',
                fontSize: 11, letterSpacing: '0.14em', fontWeight: cat === c ? 700 : 500,
                color: cat === c ? '#1A1A1A' : '#888',
                borderBottom: cat === c ? '2px solid #1A3C2E' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}>{c}</button>
            ))}
          </div>
        )}

        {/* Discount banner */}
        {discount > 0 && (
          <div style={{ margin: '12px 14px 0', padding: '10px 14px', background: '#D8EDE3', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Sparkle size={14}/>
            <span style={{ fontSize: 12, color: '#1A3C2E', fontWeight: 600 }}>{discount}% OFF activo en todos los productos</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#888' }}>{loading ? 'Cargando…' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}</span>
          <span style={{ fontSize: 11, color: '#1A1A1A', fontWeight: 600 }}>Destacados ↓</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #D8EDE3', borderTopColor: '#1A3C2E', animation: 'spinSlow 0.8s linear infinite' }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 18px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>Sin resultados</p>
            <p style={{ fontSize: 13, color: '#888' }}>Prueba con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(product => (
              <div key={product.id} style={{ position: 'relative' }}>
                <ProductCardLarge
                  product={product}
                  discount={discount}
                  onProduct={onProduct}
                  onAddToCart={handleAddToCart}
                />
                {addedId === product.id && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,60,46,0.85)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>¡Añadido!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        <div style={{ height: 24 }}/>
      </div>

      <TabBar active="shop" onChange={onTab}/>
    </Phone>
  );
}
