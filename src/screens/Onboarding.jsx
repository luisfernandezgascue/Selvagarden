import { useState } from 'react';
import { Phone } from '../components';
import { Icon, SelvaLeaf, GoogleG } from '../icons';
import { QRCode } from '../components';
import { supabase } from '../lib/supabase';

const socialBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  background: '#fff', border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-btn)', padding: '13px',
  fontSize: 13, fontWeight: 600, color: '#1A1A1A',
};

function Field({ label, value, type = 'text' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 14, padding: '10px 14px' }}>
      <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2, fontWeight: 600 }}>{label}</div>
      <input type={type} defaultValue={value} style={{
        width: '100%', border: 'none', outline: 'none', background: 'transparent',
        fontFamily: 'var(--font-sans)', fontSize: 15, color: '#1A1A1A', fontWeight: 500,
      }}/>
    </div>
  );
}

export function OnboardWelcome({ onNext }) {
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <img
          src="https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=800"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Plantas"/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,30,18,0.35) 0%, rgba(10,30,18,0.2) 35%, rgba(10,30,18,0.85) 75%, rgba(10,30,18,0.95) 100%)'
        }}/>
      </div>
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 28px 100px', color: '#fff' }}>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="selva-avatar" style={{ width: 34, height: 34 }}>
            <SelvaLeaf size={18}/>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, letterSpacing: '0.16em', fontWeight: 600 }}>SELVA GARDEN</span>
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
            <button onClick={onNext} style={{
              background: '#F5EDD8', color: '#1A3C2E', border: 'none',
              borderRadius: 'var(--r-btn)', padding: '15px 18px',
              fontSize: 14, fontWeight: 600, letterSpacing: '0.02em'
            }}>Crear cuenta</button>
            <button onClick={onNext} style={{
              background: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 'var(--r-btn)', padding: '14px 18px',
              fontSize: 14, fontWeight: 500
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

export function OnboardSignup({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogle() {
    if (!supabase) {
      setError('Configuración de auth pendiente. Contacta al administrador.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://selvagarden.vercel.app' },
    });
    if (err) {
      console.error('[Google OAuth error]', err);
      setError(err.message);
      setLoading(false);
    }
    // On success: browser redirects to Google — no further action needed
  }

  return (
    <Phone>
      <div className="scroll" style={{ padding: '10px 24px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: '#1A1A1A', marginBottom: 32 }}>
          <Icon.ArrowLeft size={22}/>
        </button>

        <div style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Crear cuenta</p>
          <h1 className="h-serif" style={{ fontSize: 34, fontWeight: 500 }}>
            Empieza tu <span style={{ fontStyle: 'italic' }}>Selva</span>
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          <button
            type="button"
            onClick={handleGoogle}
            style={{ ...socialBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            <GoogleG/>
            <span>{loading ? 'Conectando con Google…' : 'Continuar con Google'}</span>
          </button>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', marginBottom: 12 }}>{error}</p>
        )}

        <p style={{ marginTop: 8, fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 1.5 }}>
          Al continuar aceptas nuestros Términos y Política de Privacidad.
        </p>
      </div>
    </Phone>
  );
}

export function OnboardCardReady({ onNext, customer }) {
  const nombre = customer?.nombre || 'Bienvenido';
  const numeroSocio = customer?.numero_socio || '—';
  const joinDate = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' })
    : 'Hoy';

  return (
    <Phone>
      <div className="scroll" style={{ padding: '10px 24px 30px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="selva-avatar breathing" style={{ width: 32, height: 32 }}>
            <SelvaLeaf size={16}/>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, letterSpacing: '0.16em', fontWeight: 600 }}>SELVA GARDEN</span>
        </div>

        <div style={{
          background: 'linear-gradient(160deg, #1A3C2E 0%, #2D6A4F 100%)',
          borderRadius: 20, padding: '26px 22px', color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(26,60,46,0.35)',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,135,58,0.35), transparent 70%)' }}/>
          <p className="eyebrow" style={{ color: '#D4AA6B', marginBottom: 10, position: 'relative' }}>Tarjeta Selva Garden</p>
          <h2 className="h-serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 18, position: 'relative' }}>
            <span style={{ fontStyle: 'italic' }}>{nombre}</span>
          </h2>
          <div style={{ background: '#fff', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <QRCode size={180} dark="#1A3C2E" light="#fff"/>
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

        <div style={{ marginTop: 22, padding: '18px 18px', background: '#F5EDD8', borderRadius: 14, border: '1px solid rgba(181,135,58,0.25)' }}>
          <p className="eyebrow" style={{ color: '#B5873A', marginBottom: 6 }}>Bienvenida</p>
          <h3 className="h-serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Échale Tierra</h3>
          <p style={{ fontSize: 12, color: '#5A4A2A', lineHeight: 1.5, marginBottom: 14 }}>
            Tu primer pedido lleva <b>10% OFF</b> y una suculenta de regalo.<br/>Válido por 14 días.
          </p>
          <button onClick={onNext} style={{
            background: '#1A3C2E', color: '#fff', border: 'none',
            borderRadius: 'var(--r-btn)', padding: '11px 16px',
            fontSize: 12, fontWeight: 600, width: '100%',
          }}>Empezar a comprar →</button>
        </div>

        <button onClick={onNext} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#888', fontSize: 12, padding: '8px' }}>
          Añadir a Apple Wallet
        </button>
      </div>
    </Phone>
  );
}
