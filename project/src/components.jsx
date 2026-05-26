// Shared layout primitives

function StatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#1A1A1A';
  return (
    <div className={`status-bar ${dark ? 'dark' : ''}`} style={{ color: c }}>
      <span className="s-time">{time}</span>
      <div className="notch" />
      <div className="s-right">
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}>
          <rect x="0" y="6" width="3" height="5" rx="1"/>
          <rect x="4" y="4" width="3" height="7" rx="1"/>
          <rect x="8" y="2" width="3" height="9" rx="1"/>
          <rect x="12" y="0" width="3" height="11" rx="1"/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke={c} strokeWidth="1.4">
          <path d="M1 4.5 a 9 9 0 0 1 14 0"/>
          <path d="M3 6.5 a 6 6 0 0 1 10 0"/>
          <path d="M5 8.5 a 3 3 0 0 1 6 0"/>
          <circle cx="8" cy="10" r="0.7" fill={c}/>
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke={c} strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={c}/>
          <path d="M24 4v4c0.7-0.3 1.2-1 1.2-2s-0.5-1.7-1.2-2z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function TabBar({ active = 'home', onChange = () => {} }) {
  const Tab = ({ id, icon, label }) => (
    <button
      className={`tab-btn ${active === id ? 'active' : ''}`}
      onClick={() => onChange(id)}>
      <div className="tab-icon-wrap">{icon}</div>
      <span className="tab-lbl">{label}</span>
    </button>
  );
  return (
    <div className="tab-bar">
      <Tab id="home" icon={<Icon.Home size={22}/>} label="Inicio"/>
      <Tab id="shop" icon={<Icon.Shop size={22}/>} label="Tienda"/>
      <button
        className="tab-btn center"
        onClick={() => onChange('selva')}>
        <div className="tab-center-circle">
          <SelvaLeaf size={22} color={active === 'selva' ? '#F5EDD8' : '#fff'}/>
        </div>
        <span className="tab-lbl" style={{ marginTop: 4, fontWeight: active==='selva'?600:500, color: active==='selva' ? '#1A3C2E' : '#888' }}>Mi Selva</span>
      </button>
      <Tab id="card" icon={<Icon.Card size={22}/>} label="Mi Tarjeta"/>
      <Tab id="me" icon={<Icon.User size={22}/>} label="Yo"/>
    </div>
  );
}

// Editorial striped placeholder for plant photos when we don't want pexels
function PhotoFrame({ label, height = 200, src, style = {}, children, dark = false, radius = 14 }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: radius, height,
      ...style,
    }}>
      {src ? (
        <img src={src} alt={label||''} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      ) : (
        <div className="photo-placeholder" style={{ width:'100%', height:'100%' }}>{label}</div>
      )}
      {children}
    </div>
  );
}

// Phone host
function Phone({ children, statusBarDark = false, homeLight = false }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <StatusBar dark={statusBarDark}/>
        {children}
      </div>
      <div className={`home-indicator ${homeLight ? 'light' : ''}`}/>
    </div>
  );
}

// Section header
function SectionHeader({ title, cta, style = {} }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', padding:'0 18px', margin:'22px 0 12px', ...style }}>
      <h3 className="h-serif" style={{ fontSize: 22, fontWeight: 600 }}>{title}</h3>
      {cta && <a style={{ fontSize: 12, color:'var(--c-green)', fontWeight: 600 }}>{cta} →</a>}
    </div>
  );
}

// QR — generated svg for tarjeta screens (decorative, real-looking)
function QRCode({ size = 220, dark = '#1A3C2E', light = 'transparent' }) {
  // Use a deterministic pseudo-random pattern that *looks* like a QR
  const n = 25;
  const cell = size / n;
  // Deterministic seeded pattern
  const seed = (x,y) => ((x*73856093) ^ (y*19349663) ^ 2654435761) >>> 0;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const on = (seed(x,y) % 100) < 48;
      if (on) cells.push(<rect key={`${x},${y}`} x={x*cell} y={y*cell} width={cell} height={cell} fill={dark}/>);
    }
  }
  // Corner finders
  const finder = (cx, cy) => (
    <g key={`f-${cx}-${cy}`}>
      <rect x={cx*cell} y={cy*cell} width={7*cell} height={7*cell} fill={light}/>
      <rect x={cx*cell} y={cy*cell} width={7*cell} height={7*cell} fill="none" stroke={dark} strokeWidth={cell}/>
      <rect x={(cx+2)*cell} y={(cy+2)*cell} width={3*cell} height={3*cell} fill={dark}/>
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block' }}>
      <rect width={size} height={size} fill={light}/>
      {cells}
      {/* mask finders */}
      <rect x={0} y={0} width={7*cell+cell} height={7*cell+cell} fill={light}/>
      <rect x={size - 7*cell - cell} y={0} width={7*cell+cell} height={7*cell+cell} fill={light}/>
      <rect x={0} y={size - 7*cell - cell} width={7*cell+cell} height={7*cell+cell} fill={light}/>
      {finder(0,0)}
      {finder(n-7,0)}
      {finder(0,n-7)}
      {/* center logo bg */}
      <rect x={size/2 - 22} y={size/2 - 22} width={44} height={44} rx={10} fill={light==='transparent'?'#fff':light}/>
      <rect x={size/2 - 22} y={size/2 - 22} width={44} height={44} rx={10} fill="#1A3C2E"/>
      <g transform={`translate(${size/2 - 10},${size/2 - 10})`}>
        <path d="M10 1.6 C 7.2 4, 5.8 7.2, 5.8 10.8 L 10 11.4 L 14.2 10.8 C 14.2 7.2, 12.8 4, 10 1.6 Z" fill="#fff"/>
        <path d="M10 11.4 L 10 18" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

Object.assign(window, { StatusBar, TabBar, PhotoFrame, Phone, SectionHeader, QRCode });
