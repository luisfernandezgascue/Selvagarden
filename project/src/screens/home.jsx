// HOME — main screen. Optional storeMode toggle activates store banner + turno

function Home({ storeMode = false, onTab }) {
  const [pulse, setPulse] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setPulse(p => p+1), 1600); return () => clearInterval(id); }, []);

  return (
    <Phone>
      {/* Header */}
      <div style={{ flexShrink:0, padding:'4px 18px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div className="selva-avatar breathing" style={{ width:32, height:32 }}>
            <SelvaLeaf size={17}/>
          </div>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:15, letterSpacing:'0.18em', fontWeight:600, color:'#1A1A1A' }}>SELVA GARDEN</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={iconBtn}><Icon.Search/></button>
          <button style={{ ...iconBtn, position:'relative' }}>
            <Icon.Bell/>
            <span style={{ position:'absolute', top:6, right:6, width:7, height:7, background:'#B5873A', borderRadius:'50%', border:'1.5px solid #F4F6F1' }}/>
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* Store mode banner */}
        {storeMode && (
          <div style={{
            margin:'0 14px 8px', padding:'10px 14px',
            background:'linear-gradient(135deg,#2D6A4F,#1A3C2E)',
            borderRadius:13, display:'flex', justifyContent:'space-between', alignItems:'center',
            animation:'fadeUp .4s ease',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <span style={{
                width:8, height:8, borderRadius:'50%', background:'#A8D5B5',
                boxShadow:'0 0 0 4px rgba(168,213,181,0.25)',
                animation:'pulseDot 1.6s infinite',
              }}/>
              <span style={{ fontSize:12, color:'#fff', fontWeight:600 }}>Estás en Selva Garden · Las Mercedes</span>
            </div>
            <Icon.Chevron size={14}/>
          </div>
        )}

        {/* Level card */}
        <div style={{
          margin:'10px 14px 0', padding:'18px 18px',
          background:'linear-gradient(140deg, #1A3C2E 0%, #2D6A4F 100%)',
          borderRadius:18, position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', right:-25, top:-30, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(181,135,58,0.32), transparent 70%)' }}/>
          <div style={{ position:'absolute', left:-30, bottom:-30, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,213,181,0.18), transparent 70%)' }}/>

          <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
            <div>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6, fontWeight:600 }}>Hola, Carlos</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>🥈</span>
                <span style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:600, color:'#fff' }}>Versailles</span>
                <span className="chip chip-gold" style={{ background:'rgba(245,237,216,0.18)', borderColor:'rgba(245,237,216,0.4)', color:'#F5EDD8', padding:'2px 8px', fontSize:9 }}>10% OFF</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:9, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2, fontWeight:600 }}>Puntos</p>
              <p style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600, color:'#fff', lineHeight:1 }}>842</p>
            </div>
          </div>

          <div style={{ marginTop:18, position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.55)' }}>$842 acumulados</span>
              <span style={{ fontSize:10, color:'#D4AA6B', fontWeight:600 }}>🥇 Faltan $658 · Babilonia</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.12)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:'56%', background:'linear-gradient(90deg, #A8D5B5, #B5873A)', borderRadius:99, boxShadow:'0 0 12px rgba(181,135,58,0.5)', animation:'barGrow 1.3s cubic-bezier(.4,0,.2,1)' }}/>
            </div>
            <p style={{ marginTop:6, fontSize:9, color:'rgba(255,255,255,0.4)', textAlign:'center', letterSpacing:'0.04em' }}>56% del camino</p>
          </div>
        </div>

        {/* Quick access */}
        <div style={{
          margin:'14px 14px 0', padding:'12px 6px',
          background:'#fff', borderRadius:16,
          display:'flex', justifyContent:'space-around',
          boxShadow:'0 2px 14px rgba(0,0,0,0.06)',
        }}>
          <QA icon={<Icon.Leaf size={20}/>} label="Mi Selva"/>
          <QA icon={<Icon.Camera size={20}/>} label="Diagnóstico"/>
          <QA icon={<Icon.QR size={20}/>} label="Mi QR"/>
          {storeMode
            ? <QA icon={<Icon.Ticket size={20}/>} label="Turno" highlight/>
            : <QA icon={<Icon.Shop size={20}/>} label="Tienda"/>
          }
        </div>

        {/* Turno (store mode) */}
        {storeMode && (
          <div style={{ margin:'12px 14px 0', padding:'14px', background:'#fff', borderRadius:14, border:'1.5px solid rgba(26,60,46,0.12)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:11, alignItems:'center' }}>
              <div style={{ width:42, height:42, borderRadius:11, background:'#D8EDE3', display:'flex', alignItems:'center', justifyContent:'center', color:'#1A3C2E' }}>
                <Icon.Ticket size={20}/>
              </div>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'#1A1A1A' }}>Floristería · Pedir turno</p>
                <p style={{ fontSize:10, color:'#888', marginTop:2 }}>Espera ~8 min · Turno #09 en curso</p>
              </div>
            </div>
            <button style={{ background:'#1A3C2E', color:'#fff', border:'none', borderRadius:18, padding:'8px 14px', fontSize:11, fontWeight:600 }}>Pedir →</button>
          </div>
        )}

        {/* Hero — plant of the week */}
        <div style={{ margin:'18px 14px 0', borderRadius:18, overflow:'hidden', position:'relative', height:230 }}>
          <img
            src="https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=700"
            alt="Monstera"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(110deg, rgba(10,30,18,0.82) 0%, rgba(10,30,18,0.4) 60%, transparent 100%)' }}/>
          <div style={{ position:'absolute', inset:0, padding:'18px 18px', display:'flex', flexDirection:'column', justifyContent:'flex-end', maxWidth:'70%' }}>
            <span className="chip chip-gold" style={{ background:'rgba(181,135,58,0.28)', borderColor:'rgba(181,135,58,0.45)', color:'#F5EDD8', alignSelf:'flex-start', marginBottom:10, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase' }}>Planta de la semana</span>
            <h2 className="h-serif" style={{ fontSize:30, color:'#fff', fontWeight:500, marginBottom:5 }}>
              <span style={{ fontStyle:'italic' }}>Monstera</span><br/>Deliciosa
            </h2>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginBottom:14 }}>Luz indirecta · Riego semanal · Interior</p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button style={{
                background:'#F5EDD8', color:'#1A3C2E', border:'none',
                borderRadius:20, padding:'8px 14px',
                fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6,
              }}>
                <Icon.Cart size={14}/> Ver · $77
              </button>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textDecoration:'line-through' }}>$85</span>
            </div>
          </div>
        </div>

        {/* Section: Esta semana */}
        <SectionHeader title="Esta semana" cta="Ver tienda"/>
        <div style={{ display:'flex', gap:10, overflowX:'auto', padding:'0 18px 4px', scrollbarWidth:'none' }}>
          {weekProducts.map((p, i) => (
            <ProductCardSmall key={i} {...p}/>
          ))}
        </div>

        {/* Event card */}
        <div style={{ margin:'22px 14px 0' }}>
          <div style={{
            display:'flex', background:'linear-gradient(135deg, #F5EDD8, #FBF6ED)',
            borderRadius:15, overflow:'hidden', border:'1px solid rgba(181,135,58,0.2)',
          }}>
            <div style={{ width:4, background:'linear-gradient(180deg, #B5873A, #D4AA6B)' }}/>
            <div style={{ flex:1, padding:'14px 14px', display:'flex', justifyContent:'space-between', gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p className="eyebrow" style={{ color:'#B5873A', marginBottom:4 }}>Próximo evento</p>
                <h3 className="h-serif" style={{ fontSize:18, fontWeight:600, marginBottom:5 }}>Taller de bonsái</h3>
                <p style={{ fontSize:11, color:'#6B5A3A', lineHeight:1.45, marginBottom:9 }}>Iniciación con Hiroshi Tanaka. Materiales incluidos.</p>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'#B5873A', fontWeight:600 }}>Sáb 14 Dic · 10am</span>
                  <span style={{ fontSize:10, background:'rgba(181,135,58,0.14)', color:'#B5873A', padding:'2px 8px', borderRadius:8, fontWeight:600 }}>4 cupos</span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:600, color:'#1A3C2E', marginBottom:8 }}>$45</p>
                <button style={{ background:'#1A3C2E', color:'#fff', border:'none', borderRadius:18, padding:'7px 14px', fontSize:11, fontWeight:600 }}>Reservar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Video card */}
        <div style={{ margin:'14px 14px 0' }}>
          <div style={{ background:'#0A1E10', borderRadius:15, overflow:'hidden', display:'flex', alignItems:'center', position:'relative', height:118 }}>
            <img
              src="https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=600"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.4 }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(10,30,16,0.92), rgba(10,30,16,0.35))' }}/>
            <div style={{ position:'relative', zIndex:1, padding:14, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{
                width:44, height:44, borderRadius:'50%',
                background:'rgba(255,255,255,0.15)',
                border:'1px solid rgba(255,255,255,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'
              }}>
                <Icon.Play size={16}/>
              </div>
              <div>
                <p className="eyebrow" style={{ color:'rgba(255,255,255,0.5)', marginBottom:5 }}>Esta semana en Mi Selva</p>
                <h3 className="h-serif" style={{ fontSize:16, color:'#fff', fontWeight:600 }}>Cómo poda tu Monstera</h3>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.45)', marginTop:4 }}>4:23 · Por María Lemos</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height:24 }}/>
      </div>

      <TabBar active="home" onChange={onTab}/>
    </Phone>
  );
}

const iconBtn = {
  width:36, height:36, borderRadius:'50%', background:'#fff',
  border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)',
  display:'flex', alignItems:'center', justifyContent:'center',
  color:'#1A1A1A',
};

function QA({ icon, label, highlight }) {
  return (
    <button style={{ background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'0 4px' }}>
      <div style={{
        width:42, height:42, borderRadius:13,
        background: highlight ? '#1A3C2E' : '#F0FAF5',
        color: highlight ? '#F5EDD8' : '#1A3C2E',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>{icon}</div>
      <span style={{ fontSize:9, color:'#555', fontWeight:500 }}>{label}</span>
    </button>
  );
}

function ProductCardSmall({ name, img, price, old, tag }) {
  return (
    <div style={{
      width:130, flexShrink:0, background:'#fff', borderRadius:14,
      overflow:'hidden', border:'1px solid var(--c-line-soft)',
      boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
    }}>
      <div style={{ height:95, position:'relative', background:'#EDEBE3', overflow:'hidden' }}>
        {img ? (
          <img src={img} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        ) : (
          <div className="photo-placeholder" style={{ width:'100%', height:'100%' }}>plant</div>
        )}
        {tag && <span style={{ position:'absolute', top:7, left:7, background:'rgba(26,60,46,0.85)', color:'#fff', fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:8, letterSpacing:'0.06em' }}>{tag}</span>}
      </div>
      <div style={{ padding:'9px 11px 11px' }}>
        <p style={{ fontSize:10, color:'#1A1A1A', fontWeight:600, lineHeight:1.35, marginBottom:5, height:26, overflow:'hidden' }}>{name}</p>
        <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:15, fontWeight:600, color:'#1A3C2E' }}>${price}</span>
          {old && <span style={{ fontSize:9, color:'#C0C0C0', textDecoration:'line-through' }}>${old}</span>}
        </div>
      </div>
    </div>
  );
}

const weekProducts = [
  { name:'Orquídea Phalaenopsis', img:'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&w=400', price:54, old:60, tag:'FLORES' },
  { name:'Pothos Marble Queen', img:'https://images.pexels.com/photos/6913404/pexels-photo-6913404.jpeg?auto=compress&w=400', price:18, old:20, tag:'PLANTA' },
  { name:'Matero Herstera Lino 24', img:'https://images.pexels.com/photos/1084188/pexels-photo-1084188.jpeg?auto=compress&w=400', price:32, old:36, tag:'MATERO' },
  { name:'Sansevieria Zeylanica', img:'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=400', price:27, old:30, tag:'PLANTA' },
];

Object.assign(window, { Home, weekProducts, ProductCardSmall, QA });
