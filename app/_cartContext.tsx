import { createContext, useContext, useState } from 'react';
import { t } from '../translation';


const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: any }) {
  const [cart, setCart] = useState<any[]>([]);
  const [lang, setLang] = useState('TM');
  const [city, setCity] = useState('Asgabat');
  const tr = t[lang as 'TM' | 'RU'];


  const addToCart = (med: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing) return prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const removeFromCart = (med: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing && existing.quantity > 1) return prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== med.id);
    });
  };

  const getQty = (id: number) => cart.find(i => i.id === id)?.quantity || 0;
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, getQty, totalItems, totalPrice, lang, setLang, tr, city, setCity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
