// TIENDA — catalog

function Tienda({ onTab }) {
  const [cat, setCat] = React.useState('FLORES');
  const cats = ['FLORES','PLANTAS','MATEROS','CUIDADO','JARDÍN'];
  const subs = {
    'FLORES': ['Orquídeas','Rosas','Ramos','Arreglos','Funerarios'],
    'PLANTAS': ['Interior','Exterior','Aromáticas','Tropicales','Suculentas'],
    'MATEROS': ['Herstera','Por talla','Colecciones'],
    'CUIDADO': ['Sustratos','Fertilizantes','Plagas'],
    'JARDÍN': ['Herramientas','Decoración','Iluminación'],
  };
  const [sub, setSub] = React.useState('Orquídeas');
  React.useEffect(() => { setSub(subs[cat][0]); }, [cat]);

  return (
    <Phone>
      {/* Header */}
      <div style={{ flexShrink:0, padding:'4px 18px 12px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h1 className="h-serif" style={{ fontSize:24, fontWeight:600 }}>
            <span style={{ fontStyle:'italic' }}>Tienda</span>
          </h1>
          <div style={{ display:'flex', gap:8 }}>
            <button style={iconBtn}><Icon.Search/></button>
            <button style={iconBtn}><Icon.Cart/></button>
          </div>
        </div>
        {/* Search */}
        <div style={{
          background:'#fff', borderRadius:14, padding:'10px 14px',
          display:'flex', alignItems:'center', gap:10,
          border:'1px solid var(--c-line)',
        }}>
          <Icon.Search size={16} weight={1.8}/>
          <input placeholder="Busca orquídeas, materos…" style={{
            flex:1, border:'none', outline:'none', background:'transparent',
            fontSize:13, fontFamily:'var(--font-sans)',
          }} defaultValue=""/>
          <span style={{ fontSize:10, color:'#888', letterSpacing:'0.04em' }}>Filtros</span>
        </div>
      </div>

      <div className="scroll">
        {/* Cat tabs */}
        <div style={{ display:'flex', gap:18, overflowX:'auto', padding:'4px 18px 8px', borderBottom:'1px solid var(--c-line-soft)' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              background:'none', border:'none', padding:'8px 0',
              fontSize:11, letterSpacing:'0.14em', fontWeight: cat === c ? 700 : 500,
              color: cat === c ? '#1A1A1A' : '#888',
              borderBottom: cat === c ? '2px solid #1A3C2E' : '2px solid transparent',
              whiteSpace:'nowrap',
            }}>{c}</button>
          ))}
        </div>

        {/* Sub-categories */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'12px 18px' }}>
          {subs[cat].map(s => (
            <button key={s} onClick={() => setSub(s)} style={{
              flexShrink:0, padding:'7px 14px', borderRadius:99,
              background: sub === s ? '#1A3C2E' : 'transparent',
              color: sub === s ? '#F5EDD8' : '#4A4A4A',
              border: sub === s ? 'none' : '1px solid var(--c-line)',
              fontSize:11, fontWeight: sub === s ? 600 : 500,
            }}>{s}</button>
          ))}
        </div>

        {/* Editorial feature row */}
        {cat === 'FLORES' && sub === 'Orquídeas' && (
          <div style={{ margin:'4px 14px 18px', borderRadius:18, overflow:'hidden', position:'relative', height:170 }}>
            <img src="https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&w=700" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 30%, rgba(10,30,18,0.85) 100%)' }}/>
            <div style={{ position:'absolute', left:18, right:18, bottom:14, color:'#fff' }}>
              <p className="eyebrow" style={{ color:'#D4AA6B', marginBottom:6 }}>Edición casa</p>
              <h2 className="h-serif" style={{ fontSize:24, fontWeight:500, lineHeight:1.1 }}>
                Orquídeas <span style={{ fontStyle:'italic' }}>raras</span>
              </h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:4 }}>12 piezas seleccionadas esta semana</p>
            </div>
          </div>
        )}

        {/* Sort row */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'0 18px 12px', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#888' }}>32 productos · {sub}</span>
          <span style={{ fontSize:11, color:'#1A1A1A', fontWeight:600 }}>Novedad ↓</span>
        </div>

        {/* Grid 2col */}
        <div style={{ padding:'0 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {tiendaProducts.map((p, i) => <ProductCardLarge key={i} {...p}/>)}
        </div>

        <div style={{ height:24 }}/>
      </div>

      <TabBar active="shop" onChange={onTab}/>
    </Phone>
  );
}

function ProductCardLarge({ name, img, price, old, tag, lat='Phalaenopsis sp.' }) {
  return (
    <div style={{
      background:'#fff', borderRadius:14, overflow:'hidden',
      border:'1px solid var(--c-line-soft)',
    }}>
      <div style={{ aspectRatio:'1/1.05', position:'relative', background:'#EDEBE3', overflow:'hidden' }}>
        {img ? (
          <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        ) : (
          <div className="photo-placeholder" style={{ width:'100%', height:'100%' }}>plant photo</div>
        )}
        <span style={{ position:'absolute', top:8, left:8, background:'rgba(26,60,46,0.85)', color:'#fff', fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:8, letterSpacing:'0.08em' }}>{tag}</span>
        <button style={{
          position:'absolute', top:7, right:7, width:28, height:28, borderRadius:'50%',
          background:'rgba(255,255,255,0.88)', border:'none', color:'#1A3C2E',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><Icon.Heart size={14}/></button>
      </div>
      <div style={{ padding:'10px 11px 12px' }}>
        <p style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:10, color:'#888', marginBottom:2 }}>{lat}</p>
        <p style={{ fontSize:12, color:'#1A1A1A', fontWeight:600, lineHeight:1.3, marginBottom:8, height:30, overflow:'hidden' }}>{name}</p>
        <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:600, color:'#1A3C2E' }}>${price}</span>
          {old && <span style={{ fontSize:10, color:'#C0C0C0', textDecoration:'line-through' }}>${old}</span>}
        </div>
      </div>
    </div>
  );
}

const tiendaProducts = [
  { name:'Orquídea Phalaenopsis blanca', lat:'Phalaenopsis amabilis', img:'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&w=500', price:54, old:60, tag:'ORQUÍDEA' },
  { name:'Cymbidium amarillo en vara', lat:'Cymbidium hybridum', img:'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&w=500', price:72, old:80, tag:'ORQUÍDEA' },
  { name:'Vanda azul rara', lat:'Vanda coerulea', img:'https://images.pexels.com/photos/1407310/pexels-photo-1407310.jpeg?auto=compress&w=500', price:135, old:150, tag:'ORQUÍDEA' },
  { name:'Dendrobium nobile', lat:'Dendrobium nobile', img:'https://images.pexels.com/photos/2693644/pexels-photo-2693644.jpeg?auto=compress&w=500', price:58, old:64, tag:'ORQUÍDEA' },
  { name:'Oncidium amarillo lluvia', lat:'Oncidium hybridum', img:'https://images.pexels.com/photos/4503266/pexels-photo-4503266.jpeg?auto=compress&w=500', price:48, old:54, tag:'ORQUÍDEA' },
  { name:'Mini phal en matero cerámica', lat:'Phalaenopsis × Herstera', img:'https://images.pexels.com/photos/931163/pexels-photo-931163.jpeg?auto=compress&w=500', price:38, old:42, tag:'EDICIÓN' },
];

Object.assign(window, { Tienda, ProductCardLarge, tiendaProducts });
