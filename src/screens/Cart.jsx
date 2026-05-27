import { useState } from 'react';
import { Phone } from '../components';
import { Icon } from '../icons';
import { useCustomer, nivelInfo } from '../context/CustomerContext';

export default function Cart({ onClose }) {
  const { cart, cartTotal, cartCount, updateCartQty, removeFromCart, checkout, customer, discount } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const info = nivelInfo(customer?.nivel_lealtad);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const order = await checkout();
      if (order) setSuccess(true);
      else setError('No se pudo completar el pedido. Verifica tu sesión.');
    } catch (e) {
      setError(e.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Phone>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: '#F4F6F1' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#D8EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 36 }}>🌿</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, color: '#1A3C2E', marginBottom: 10 }}>¡Pedido confirmado!</h2>
          <p style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.6, marginBottom: 8 }}>Tu pedido ha sido registrado exitosamente.</p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 32 }}>Recibirás confirmación en tu correo.</p>
          <button
            onClick={onClose}
            style={{ background: '#1A3C2E', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '14px 32px', fontSize: 14, fontWeight: 600 }}
          >
            Volver a la tienda
          </button>
        </div>
      </Phone>
    );
  }

  return (
    <Phone>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '4px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-line-soft)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          <Icon.ArrowLeft size={18}/> Volver
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: '#1A1A1A' }}>MI CARRITO</span>
        <span style={{ fontSize: 12, color: '#888' }}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
      </div>

      {cart.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#D8EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon.Cart size={28}/>
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#1A1A1A', marginBottom: 8 }}>Tu carrito está vacío</p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Agrega productos desde la tienda</p>
          <button onClick={onClose} style={{ background: '#1A3C2E', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '12px 24px', fontSize: 13, fontWeight: 600 }}>
            Ir a la tienda
          </button>
        </div>
      ) : (
        <>
          <div className="scroll" style={{ flex: 1 }}>
            {/* Discount banner */}
            {discount > 0 && (
              <div style={{ margin: '12px 14px 0', padding: '10px 14px', background: '#D8EDE3', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{info.emoji}</span>
                <p style={{ fontSize: 12, color: '#1A3C2E', fontWeight: 600 }}>Nivel {info.label}: {discount}% OFF aplicado en todos los productos</p>
              </div>
            )}

            {/* Cart items */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cart.map(({ product, quantity }) => {
                const finalPrice = (product.precio_venta || 0) * (1 - discount / 100);
                return (
                  <div key={product.id} style={{ background: '#fff', borderRadius: 14, padding: 12, display: 'flex', gap: 12, border: '1px solid var(--c-line-soft)' }}>
                    <div style={{ width: 70, height: 70, borderRadius: 10, background: '#EDEBE3', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={product.imagen_url || 'https://picsum.photos/seed/plant/200/200'}
                        alt={product.nombre}
                        onError={e => { e.target.src = 'https://picsum.photos/seed/plant/200/200'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 4 }}>{product.nombre}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: '#1A3C2E' }}>${finalPrice.toFixed(2)}</span>
                        {discount > 0 && <span style={{ fontSize: 10, color: '#C0C0C0', textDecoration: 'line-through' }}>${product.precio_venta}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#F0F0F0', borderRadius: 20, overflow: 'hidden' }}>
                          <button
                            onClick={() => updateCartQty(product.id, quantity - 1)}
                            style={{ width: 30, height: 30, background: 'none', border: 'none', fontSize: 16, color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >−</button>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 22, textAlign: 'center' }}>{quantity}</span>
                          <button
                            onClick={() => updateCartQty(product.id, quantity + 1)}
                            style={{ width: 30, height: 30, background: 'none', border: 'none', fontSize: 16, color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >+</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A3C2E' }}>${(finalPrice * quantity).toFixed(2)}</span>
                          <button onClick={() => removeFromCart(product.id)} style={{ background: 'none', border: 'none', color: '#C0C0C0', padding: 4 }}>
                            <Icon.ArrowLeft size={14}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div style={{ margin: '0 14px 24px', background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--c-line-soft)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>Resumen</p>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#888' }}>Descuento {info.label}</span>
                  <span style={{ fontSize: 12, color: '#B5873A', fontWeight: 600 }}>−{discount}%</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--c-line-soft)' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#1A3C2E' }}>${cartTotal.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: 10, color: '#888', marginTop: 6 }}>Ganas ~{Math.floor(cartTotal / 100) * 10} puntos con esta compra</p>
            </div>
          </div>

          {/* Sticky CTA */}
          <div style={{ flexShrink: 0, padding: '12px 18px 22px', background: '#F4F6F1', borderTop: '1px solid var(--c-line-soft)' }}>
            {error && <p style={{ fontSize: 12, color: '#E53935', marginBottom: 10, textAlign: 'center' }}>{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: '100%', background: loading ? '#A8D5B5' : '#1A3C2E', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '15px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.8 : 1 }}
            >
              {loading ? 'Procesando…' : `Comprar ahora · $${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </>
      )}
    </Phone>
  );
}
