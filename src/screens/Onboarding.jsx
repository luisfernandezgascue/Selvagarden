import { useState } from 'react';
import { Phone } from '../components';
import { Icon, GoogleG } from '../icons';
import { QRCode } from '../components';
import { supabase } from '../lib/supabase';
import { signUpWithEmail, signInWithEmail } from '../lib/auth';

const input = {
  width: '100%', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'var(--font-sans)', fontSize: 15, color: '#1A1A1A', fontWeight: 500,
  padding: '2px 0',
};

const fieldWrap = {
  background: '#fff', border: '1px solid var(--c-line)', borderRadius: 14, padding: '10px 14px',
};

const lbl = {
  fontSize: 10, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase',
  marginBottom: 3, fontWeight: 600, display: 'block',
};

function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div style={fieldWrap}>
      <span style={lbl}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        autoComplete={autoComplete}
        style={input}
      />
    </div>
  );
}

const primaryBtn = {
  background: '#2D5A3D', color: '#fff', border: 'none',
  borderRadius: 'var(--r-btn)', padding: '15px', width: '100%',
  fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', cursor: 'pointer',
};

const googleBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  background: '#fff', border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-btn)', padding: '13px', width: '100%',
  fontSize: 13, fontWeight: 600, color: '#1A1A1A', cursor: 'pointer',
};

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.4 }}>
      {msg}
    </p>
  );
}

// ── Welcome ──────────────────────────────────────────────────────
export function OnboardWelcome({ onNext, onLogin }) {
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, minHeight: '100dvh' }}>
        <img
          src="https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=800"
          style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '100dvh' }} alt="Plantas"/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,30,18,0.35) 0%, rgba(10,30,18,0.2) 35%, rgba(10,30,18,0.85) 75%, rgba(10,30,18,0.95) 100%)'
        }}/>
      </div>
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 28px max(40px, env(safe-area-inset-bottom))', color: '#fff', minHeight: '100dvh' }}>
        <div style={{ marginTop: 18 }}>
          <img src="/brand/SelvaGarden_apilado_claro_512.png" alt="Selva Garden" style={{ height: 70, width: 'auto', filter: 'brightness(0) invert(1)' }}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <p className="eyebrow" style={{ color: '#D4AA6B', marginBottom: 14 }}>Caracas · Est. 2025</p>
            <h1 className="h-serif" style={{ fontSize: 46, lineHeight: 1, fontWeight: 500, marginBottom: 14 }}>
              Bienvenido a<br/>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Selva</span> Garden
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: 280 }}>
              Cultiva lo que amas. Plantas, flores y materos curados con criterio editorial.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" onClick={onNext} style={{
              background: '#F5EDD8', color: '#2D5A3D', border: 'none',
              borderRadius: 'var(--r-btn)', padding: '15px 18px',
              fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', cursor: 'pointer',
            }}>Crear cuenta</button>
            <button type="button" onClick={onLogin} style={{
              background: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 'var(--r-btn)', padding: '14px 18px',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>Ya tengo cuenta</button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              Al continuar aceptas Términos y Privacidad
            </p>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ── Signup ────────────────────────────────────────────────────────
export function OnboardSignup({ onBack, onSignedUp }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleGoogle() {
    if (!supabase) { setError('Auth no configurado. Contacta al administrador.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://selvagarden.vercel.app',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (err) {
      console.error('[Google OAuth error]', err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleEmailSignup() {
    if (!nombre.trim()) { setError('Ingresa tu nombre.'); return; }
    if (!email.trim()) { setError('Ingresa tu correo.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }

    setLoading(true);
    setError(null);
    try {
      const { needsConfirmation: needsConf } = await signUpWithEmail(nombre.trim(), email.trim(), telefono.trim(), password);
      if (needsConf) {
        setNeedsConfirmation(true);
      }
      // If no confirmation needed, onAuthStateChange in App.jsx handles navigation automatically
    } catch (e) {
      console.error('[signUpWithEmail error]', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <Phone>
        <div className="scroll" style={{ padding: '10px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Icon.Bell size={28}/>
          </div>
          <h2 className="h-serif" style={{ fontSize: 26, fontWeight: 500, marginBottom: 10, textAlign: 'center' }}>
            Revisa tu correo
          </h2>
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 1.55, marginBottom: 24 }}>
            Te enviamos un enlace de confirmación a<br/>
            <b style={{ color: '#1A1A1A' }}>{email}</b>
          </p>
          <button type="button" onClick={onBack} style={{ ...primaryBtn, background: 'transparent', color: '#2D5A3D', border: '1.5px solid #2D5A3D' }}>
            Volver
          </button>
        </div>
      </Phone>
    );
  }

  return (
    <Phone>
      <div className="scroll" style={{ padding: '10px 24px 32px' }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: '#1A1A1A', marginBottom: 24 }}>
          <Icon.ArrowLeft size={22}/>
        </button>

        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Nueva cuenta</p>
          <h1 className="h-serif" style={{ fontSize: 34, fontWeight: 500 }}>
            Empieza tu <span style={{ fontStyle: 'italic' }}>Selva</span>
          </h1>
        </div>

        {/* Google */}
        <button type="button" onClick={handleGoogle} disabled={loading}
          style={{ ...googleBtn, opacity: loading ? 0.7 : 1, marginBottom: 18 }}>
          <GoogleG/>
          <span>{loading ? 'Conectando…' : 'Continuar con Google'}</span>
        </button>

        <div className="divider-rule" style={{ marginBottom: 18 }}>o con email</div>

        {/* Email form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <InputField label="Nombre" value={nombre} onChange={setNombre} placeholder="Tu nombre completo" autoComplete="name"/>
          <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" autoComplete="email"/>
          <InputField label="Teléfono" type="tel" value={telefono} onChange={setTelefono} placeholder="+58 414 000 0000" autoComplete="tel"/>
          <InputField label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" autoComplete="new-password"/>
        </div>

        <button type="button" onClick={handleEmailSignup} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <ErrorMsg msg={error}/>

        <p style={{ marginTop: 16, fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 1.5 }}>
          Al continuar aceptas nuestros Términos y Política de Privacidad.
        </p>
      </div>
    </Phone>
  );
}

// ── Login ─────────────────────────────────────────────────────────
export function OnboardLogin({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email.trim()) { setError('Ingresa tu correo.'); return; }
    if (!password) { setError('Ingresa tu contraseña.'); return; }

    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
      // onAuthStateChange in App.jsx handles navigation
    } catch (e) {
      console.error('[signInWithEmail error]', e);
      setError(e.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : e.message);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!supabase) { setError('Auth no configurado. Contacta al administrador.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://selvagarden.vercel.app',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (err) {
      console.error('[Google OAuth error]', err);
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Phone>
      <div className="scroll" style={{ padding: '10px 24px 32px' }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: '#1A1A1A', marginBottom: 24 }}>
          <Icon.ArrowLeft size={22}/>
        </button>

        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Bienvenido de vuelta</p>
          <h1 className="h-serif" style={{ fontSize: 34, fontWeight: 500 }}>
            Inicia <span style={{ fontStyle: 'italic' }}>sesión</span>
          </h1>
        </div>

        {/* Google */}
        <button type="button" onClick={handleGoogle} disabled={loading}
          style={{ ...googleBtn, opacity: loading ? 0.7 : 1, marginBottom: 18 }}>
          <GoogleG/>
          <span>Continuar con Google</span>
        </button>

        <div className="divider-rule" style={{ marginBottom: 18 }}>o con email</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" autoComplete="email"/>
          <InputField label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Tu contraseña" autoComplete="current-password"/>
        </div>

        <button type="button" onClick={handleLogin} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <ErrorMsg msg={error}/>

        <p style={{ marginTop: 20, fontSize: 12, color: '#888', textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#2D5A3D', fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0 }}>
            Crear cuenta
          </button>
        </p>
      </div>
    </Phone>
  );
}

// ── Card Ready ────────────────────────────────────────────────────
export function OnboardCardReady({ onNext, customer }) {
  const nombre = customer?.nombre || 'Bienvenido';
  const numeroSocio = customer?.numero_socio || '—';
  const joinDate = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' })
    : 'Hoy';

  return (
    <Phone>
      <div className="scroll" style={{ padding: '10px 24px 30px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 14, marginBottom: 18 }}>
          <img src="/brand/SelvaGarden_horizontal_claro.svg?v=3" alt="Selva Garden" className="header-logo" style={{ height: '72px', width: 'auto', display: 'block', flexShrink: 0 }}/>
        </div>

        <div style={{
          background: 'linear-gradient(160deg, #2D5A3D 0%, #3D7A55 100%)',
          borderRadius: 20, padding: '26px 22px', color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(45,90,61,0.35)',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.35), transparent 70%)' }}/>
          <p className="eyebrow" style={{ color: '#D4AA6B', marginBottom: 10, position: 'relative' }}>Tarjeta Selva Garden</p>
          <h2 className="h-serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 18, position: 'relative' }}>
            <span style={{ fontStyle: 'italic' }}>{nombre}</span>
          </h2>
          <div style={{ background: '#fff', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <QRCode size={180} dark="#2D5A3D" light="#fff"/>
          </div>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', position: 'relative' }}>{numeroSocio}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Nivel</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>🌱 Semilla</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Miembro desde</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{joinDate}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22, padding: '18px 18px', background: '#F5EDD8', borderRadius: 14, border: '1px solid rgba(184,149,106,0.25)' }}>
          <p className="eyebrow" style={{ color: '#B8956A', marginBottom: 6 }}>Bienvenida</p>
          <h3 className="h-serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Échale Tierra</h3>
          <p style={{ fontSize: 12, color: '#5A4A2A', lineHeight: 1.5, marginBottom: 14 }}>
            Tu primer pedido lleva <b>10% OFF</b> y una suculenta de regalo.<br/>Válido por 14 días.
          </p>
          <button type="button" onClick={onNext} style={{ ...primaryBtn }}>
            Empezar a comprar →
          </button>
        </div>
      </div>
    </Phone>
  );
}
