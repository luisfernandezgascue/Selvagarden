import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CustomerContext = createContext(null);

export function nivelInfo(nivel) {
  const map = {
    sin_nivel:  { label: 'Sin nivel',  emoji: '',    descuento: 0,  color: '#888' },
    alhambra:   { label: 'Alhambra',   emoji: '🥉',  descuento: 5,  color: '#A0785A' },
    versailles: { label: 'Versailles', emoji: '🥈',  descuento: 10, color: '#8A8A8A' },
    babilonia:  { label: 'Babilonia',  emoji: '🥇',  descuento: 15, color: '#B5873A' },
  };
  return map[nivel] || map.sin_nivel;
}

export function levelProgress(consumo) {
  const c = consumo || 0;
  if (c < 200)  return { pct: c / 200,       current: 'sin_nivel',  next: 'alhambra',   nextAt: 200,  remaining: 200 - c };
  if (c < 600)  return { pct: (c-200) / 400, current: 'alhambra',   next: 'versailles', nextAt: 600,  remaining: 600 - c };
  if (c < 1500) return { pct: (c-600) / 900, current: 'versailles', next: 'babilonia',  nextAt: 1500, remaining: 1500 - c };
  return         { pct: 1,                   current: 'babilonia',  next: null,         nextAt: null, remaining: 0 };
}

export function calcNivel(consumo) {
  const c = consumo || 0;
  if (c >= 1500) return 'babilonia';
  if (c >= 600)  return 'versailles';
  if (c >= 200)  return 'alhambra';
  return 'sin_nivel';
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [storeMode, setStoreMode] = useState(() => localStorage.getItem('storeMode') === 'true');

  useEffect(() => {
    const handler = () => setStoreMode(localStorage.getItem('storeMode') === 'true');
    window.addEventListener('storeModeChanged', handler);
    return () => window.removeEventListener('storeModeChanged', handler);
  }, []);

  const refreshCustomer = useCallback(async () => {
    if (!supabase || !customer?.id) return;
    const { data } = await supabase.from('customers').select('*').eq('id', customer.id).single();
    if (data) setCustomer(data);
  }, [customer?.id]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => setCart(prev => prev.filter(i => i.product.id !== productId)), []);

  const updateCartQty = useCallback((productId, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== productId));
    else setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  }, []);

  const discount = nivelInfo(customer?.nivel_lealtad).descuento;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + (i.product.precio_venta || 0) * (1 - discount / 100) * i.quantity, 0);

  const checkout = useCallback(async (extraDiscountPct = 0) => {
    if (!supabase || !customer || cart.length === 0) return null;
    const disc = nivelInfo(customer.nivel_lealtad).descuento + extraDiscountPct;

    const items = cart.map(i => ({
      product_id: i.product.id,
      nombre: i.product.nombre,
      precio_unit: i.product.precio_venta || 0,
      precio_final: parseFloat(((i.product.precio_venta || 0) * (1 - disc / 100)).toFixed(2)),
      cantidad: i.quantity,
    }));
    const total = parseFloat(items.reduce((s, i) => s + i.precio_final * i.cantidad, 0).toFixed(2));
    const puntos_ganados = Math.floor(total / 100) * 10;

    const { data: order, error } = await supabase
      .from('ordenes')
      .insert({ customer_id: customer.id, items, total, estado: 'confirmado' })
      .select().single();
    if (error) throw error;

    const newConsumo = parseFloat(((customer.consumo_anual || 0) + total).toFixed(2));
    const newPuntos = (customer.puntos || 0) + puntos_ganados;
    const newNivel = calcNivel(newConsumo);
    const descuento_activo = nivelInfo(newNivel).descuento;

    await supabase.from('customers').update({
      consumo_anual: newConsumo,
      puntos: newPuntos,
      nivel_lealtad: newNivel,
      descuento_activo,
    }).eq('id', customer.id);

    if (puntos_ganados > 0) {
      await supabase.from('loyalty_transactions').insert({
        customer_id: customer.id,
        orden_id: order.id,
        puntos_ganados,
        puntos_usados: 0,
        balance_resultante: newPuntos,
        origen: 'compra',
      });
    }

    await refreshCustomer();
    setCart([]);
    return order;
  }, [cart, customer, refreshCustomer]);

  return (
    <CustomerContext.Provider value={{
      customer, setCustomer,
      cart, cartCount, cartTotal,
      cartOpen, setCartOpen,
      addToCart, removeFromCart, updateCartQty,
      checkout, refreshCustomer,
      discount, storeMode,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}
