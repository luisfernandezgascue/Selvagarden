import { Icon } from './icons';


export function TabBar({ active = 'home', onChange = () => {} }) {
  const Tab = ({ id, icon, label }) => (
    <button className={`tab-btn ${active === id ? 'active' : ''}`} onClick={() => onChange(id)}>
      <div className="tab-icon-wrap">{icon}</div>
      <span className="tab-lbl">{label}</span>
    </button>
  );
  return (
    <div className="tab-bar">
      <Tab id="home" icon={<Icon.Home size={22}/>} label="Inicio"/>
      <Tab id="shop" icon={<Icon.Shop size={22}/>} label="Tienda"/>
      <button className="tab-btn center" onClick={() => onChange('selva')}>
        <div className="tab-center-circle">
          <img src="/brand/SelvaGarden_pictograma_claro.svg" alt="Mi Selva" style={{ width: '28px', height: '28px' }}/>
        </div>
        <span className="tab-lbl" style={{ marginTop: 4, fontWeight: active === 'selva' ? 600 : 500, color: active === 'selva' ? '#2D5A3D' : '#888' }}>Mi Selva</span>
      </button>
      <Tab id="card" icon={<Icon.Card size={22}/>} label="Mi Tarjeta"/>
      <Tab id="me" icon={<Icon.User size={22}/>} label="Yo"/>
    </div>
  );
}

export function Phone({ children }) {
  return <div className="screen-root">{children}</div>;
}

export function PhotoFrame({ label, height = 200, src, style = {}, children, radius = 14 }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, height, ...style }}>
      {src ? (
        <img src={src} alt={label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
      ) : (
        <div className="photo-placeholder" style={{ width: '100%', height: '100%' }}>{label}</div>
      )}
      {children}
    </div>
  );
}

export function SectionHeader({ title, cta, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 18px', margin: '22px 0 12px', ...style }}>
      <h3 className="h-serif" style={{ fontSize: 22, fontWeight: 600 }}>{title}</h3>
      {cta && <a style={{ fontSize: 12, color: 'var(--c-green)', fontWeight: 600 }}>{cta} →</a>}
    </div>
  );
}

export function QRCode({ size = 220, dark = '#2D5A3D', light = 'transparent' }) {
  const n = 25;
  const cell = size / n;
  const seed = (x, y) => ((x * 73856093) ^ (y * 19349663) ^ 2654435761) >>> 0;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if ((seed(x, y) % 100) < 48) {
        cells.push(<rect key={`${x},${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={dark}/>);
      }
    }
  }
  const finder = (cx, cy) => (
    <g key={`f-${cx}-${cy}`}>
      <rect x={cx * cell} y={cy * cell} width={7 * cell} height={7 * cell} fill={light}/>
      <rect x={cx * cell} y={cy * cell} width={7 * cell} height={7 * cell} fill="none" stroke={dark} strokeWidth={cell}/>
      <rect x={(cx + 2) * cell} y={(cy + 2) * cell} width={3 * cell} height={3 * cell} fill={dark}/>
    </g>
  );
  const bg = light === 'transparent' ? '#fff' : light;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill={light}/>
      {cells}
      <rect x={0} y={0} width={7 * cell + cell} height={7 * cell + cell} fill={light}/>
      <rect x={size - 7 * cell - cell} y={0} width={7 * cell + cell} height={7 * cell + cell} fill={light}/>
      <rect x={0} y={size - 7 * cell - cell} width={7 * cell + cell} height={7 * cell + cell} fill={light}/>
      {finder(0, 0)}{finder(n - 7, 0)}{finder(0, n - 7)}
      <rect x={size / 2 - 22} y={size / 2 - 22} width={44} height={44} rx={10} fill={bg}/>
      <rect x={size / 2 - 22} y={size / 2 - 22} width={44} height={44} rx={10} fill="#2D5A3D"/>
      <g transform={`translate(${size / 2 - 10},${size / 2 - 10})`}>
        <path d="M10 1.6 C 7.2 4, 5.8 7.2, 5.8 10.8 L 10 11.4 L 14.2 10.8 C 14.2 7.2, 12.8 4, 10 1.6 Z" fill="#fff"/>
        <path d="M10 11.4 L 10 18" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export const iconBtn = {
  width: 36, height: 36, borderRadius: '50%', background: '#fff',
  border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#1A1A1A',
};
