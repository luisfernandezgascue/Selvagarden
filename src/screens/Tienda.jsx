import { useState, useEffect, useRef } from 'react';
import { Phone, TabBar, iconBtn } from '../components';
import { Icon } from '../icons';
import { fetchProducts } from '../lib/db';
import { useCustomer } from '../context/CustomerContext';

const FALLBACK_IMG = 'https://picsum.photos/seed/plant/400/400';

const CATEGORY_ORDER = ['flores', 'plantas', 'arreglos', 'materos', 'jardin', 'otros'];
const CATEGORY_LABELS = {
  flores: 'Flores', plantas: 'Plantas', arreglos: 'Arreglos',
  materos: 'Materos', jardin: 'Jardin', otros: 'Otros',
};

function displayName(p) {
  return p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1).toLowerCase();
}

function ProductCardLarge({ product, discount, onProduct, onAddToCart }) {
  const finalPrice = (product.precio_venta || 0) * (1 - discount / 100);
  const subfamilyName = product.subfamily?.nombre || '';

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--c-line-soft)', cursor: 'pointer' }}>
      <div onClick={() => onProduct(product)} style={{ aspectRatio: '1/1.05', position: 'relative', background: '#EDEBE3', overflow: 'hidden' }}>
        <img
          src={product.imagen_url || FALLBACK_IMG}
          alt={product.nombre}
          onError={e => { e.target.src = FALLBACK_IMG; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          onClick={e => e.stopPropagation()}
          style={{ position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.88)', border: 'none', color: '#2D5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon.Heart size={14}/>
        </button>
      </div>
      <div style={{ padding: '10px 11px 12px' }}>
        {subfamilyName && <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 10, color: '#888', marginBottom: 2 }}>{subfamilyName}</p>}
        <p onClick={() => onProduct(product)} style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.3, marginBottom: 8, height: 30, overflow: 'hidden' }}>{displayName(product)}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: '#2D5A3D' }}>${finalPrice.toFixed(2)}</span>
            {discount > 0 && <span style={{ fontSize: 10, color: '#C0C0C0', textDecoration: 'line-through' }}>${product.precio_venta}</span>}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
            style={{ width: 28, height: 28, borderRadius: '50%', background: '#2D5A3D', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
  const [cat, setCat] = useState('todos');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchProducts().then(data => { setProducts(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function openSearch() { setSearchOpen(true); }
  function closeSearch() { setSearchOpen(false); setSearch(''); }

  // Build sorted category list from products
  const familyMap = {};
  products.forEach(p => {
    const fam = p.subfamily?.family;
    if (fam?.slug && !familyMap[fam.slug]) familyMap[fam.slug] = { slug: fam.slug, nombre: fam.nombre, orden: fam.orden ?? 99 };
  });
  const sortedFamilies = Object.values(familyMap).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug);
    const bi = CATEGORY_ORDER.indexOf(b.slug);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.orden - b.orden;
  });

  const filtered = products.filter(p => {
    const matchesCat = cat === 'todos' || p.subfamily?.family?.slug === cat;
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
      <div style={{ flexShrink: 0, padding: '4px 18px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: searchOpen ? 10 : 0 }}>
          <h1 className="h-serif" style={{ fontSize: 24, fontWeight: 600 }}><span style={{ fontStyle: 'italic' }}>Tienda</span></h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={searchOpen ? closeSearch : openSearch} style={iconBtn}>
              {searchOpen ? <Icon.Close/> : <Icon.Search/>}
            </button>
            <button onClick={() => setCartOpen(true)} style={{ ...iconBtn, position: 'relative' }}>
              <Icon.Cart/>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#B8956A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid #F5F0E8' }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--c-line)' }}>
            <Icon.Search size={16}/>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Busca plantas, flores, materos…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'var(--font-sans)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#888', padding: 2, display: 'flex' }}>
                <Icon.Close size={14}/>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="scroll">
        {/* Category tabs */}
        {sortedFamilies.length > 0 && (
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '0 18px', borderBottom: '1px solid var(--c-line-soft)', scrollbarWidth: 'none' }}>
            <button onClick={() => setCat('todos')} style={{
              background: 'none', border: 'none', padding: '10px 14px 10px 0',
              fontSize: 11, letterSpacing: '0.12em', fontWeight: cat === 'todos' ? 700 : 500,
              color: cat === 'todos' ? '#1A1A1A' : '#888',
              borderBottom: cat === 'todos' ? '2px solid #2D5A3D' : '2px solid transparent',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>TODOS</button>
            {sortedFamilies.map(f => (
              <button key={f.slug} onClick={() => setCat(f.slug)} style={{
                background: 'none', border: 'none', padding: '10px 14px',
                fontSize: 11, letterSpacing: '0.12em', fontWeight: cat === f.slug ? 700 : 500,
                color: cat === f.slug ? '#1A1A1A' : '#888',
                borderBottom: cat === f.slug ? '2px solid #2D5A3D' : '2px solid transparent',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{(CATEGORY_LABELS[f.slug] || f.nombre)?.toUpperCase()}</button>
            ))}
          </div>
        )}

        {discount > 0 && (
          <div style={{ margin: '12px 14px 0', padding: '10px 14px', background: '#E8F0EA', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Sparkle size={14}/>
            <span style={{ fontSize: 12, color: '#2D5A3D', fontWeight: 600 }}>{discount}% OFF activo · nivel {['Alhambra','Versailles','Babilonia'][[5,10,15].indexOf(discount)]}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#888' }}>{loading ? 'Cargando…' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}</span>
          {cat !== 'todos' && <button onClick={() => setCat('todos')} style={{ background: 'none', border: 'none', fontSize: 11, color: '#888' }}>Ver todos</button>}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E8F0EA', borderTopColor: '#2D5A3D', animation: 'spinSlow 0.8s linear infinite' }}/>
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
                <ProductCardLarge product={product} discount={discount} onProduct={onProduct} onAddToCart={handleAddToCart}/>
                {addedId === product.id && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(45,90,61,0.85)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
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
