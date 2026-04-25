import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';

export default function Medicines() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
    const { cart, setCart, addToCart, removeFromCart, getQty, totalItems, totalPrice, tr } = useCart();
    const [cartOpen, setCartOpen] = useState(false);

  const categories = [
    { name: tr.headache, emoji: '🧠', keyword: 'headache' },
    { name: tr.stomach, emoji: '🤢', keyword: 'stomach' },
    { name: tr.cold, emoji: '🤧', keyword: 'cold' },
    { name: tr.allergy, emoji: '🌸', keyword: 'allergy' },
    { name: tr.antibiotic, emoji: '💊', keyword: 'antibiotic' },
  ];

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('medicines').select('*');
      setMedicines(data || []);
    }
    fetch();
  }, []);

  const filtered = selected ? medicines.filter(m => m.category === selected) : medicines;



  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>{tr.back}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>💊 {tr.medicines}</Text>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        <TouchableOpacity
          style={[styles.catBtn, !selected && styles.catBtnActive]}
          onPress={() => setSelected(null)}
        >
          <Text style={[styles.catText, !selected && styles.catTextActive]}>{tr.all}</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.keyword}
            style={[styles.catBtn, selected === cat.keyword && styles.catBtnActive]}
            onPress={() => setSelected(cat.keyword)}
          >
            <Text style={[styles.catText, selected === cat.keyword && styles.catTextActive]}>
              {cat.emoji} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Medicines grid */}
      <View style={styles.grid}>
        {filtered.map((med) => {
          const qty = getQty(med.id);
          return (
            <View key={med.id} style={styles.medCard}>
              <Text style={styles.medEmoji}>{med.emoji || '💊'}</Text>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medPrice}>{med.price}</Text>
              <Text style={styles.medPharm}>{med.pharmacy}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => {
                  
                }}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{qty}</Text>
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnGreen]} onPress={() => addToCart(med)}>
                  <Text style={[styles.qtyBtnText, { color: 'white' }]}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(med)}>
                <Text style={styles.addBtnText}>{tr.addToCart}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
           {/* Cart button */}
            <TouchableOpacity style={styles.cartBtn} onPress={() => setCartOpen(true)}>
              <Text style={styles.cartIcon}>🛒</Text>
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
      
            {/* Cart modal */}
            {cartOpen && (
              <View style={styles.cartModal}>
                <View style={styles.cartHeader}>
                  <Text style={styles.cartTitle}>🛒 {tr.cart}</Text>
                  <TouchableOpacity onPress={() => setCartOpen(false)}>
                    <Text style={styles.cartClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.cartList}>
                  {cart.length === 0 ? (
                    <Text style={styles.cartEmpty}>{tr.cartEmpty}</Text>
                  ) : (
                    cart.map((item: any) => (
                      <View key={item.id} style={styles.cartItem}>
                        <Text style={styles.cartItemEmoji}>{item.emoji || '💊'}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cartItemName}>{item.name}</Text>
                          <Text style={styles.cartItemPrice}>{item.price} × {item.quantity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setCart((prev: any) => prev.filter((i: any) => i.id !== item.id))}>
                          <Text style={{ color: '#ef4444', fontSize: 20 }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
                <View style={styles.cartFooter}>
                  <Text style={styles.cartTotal}>{tr.total}: {totalPrice.toFixed(2)} TMT</Text>
                  <TouchableOpacity style={styles.orderBtn}>
                    <Text style={styles.orderBtnText}>{tr.order}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  backBtn: { margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  catRow: { paddingHorizontal: 16, marginBottom: 16 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#99f6e4', backgroundColor: 'white', marginRight: 8, height: 44, justifyContent: 'center' },
  catBtnActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  catText: { color: '#0d9488', fontWeight: '500' },
  catTextActive: { color: 'white' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  medCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medEmoji: { fontSize: 40, marginBottom: 8 },
  medName: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  medPrice: { color: '#0d9488', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  medPharm: { color: '#9ca3af', fontSize: 12, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  qtyBtn: { width: 32, height: 32, backgroundColor: '#e5e7eb', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  qtyBtnGreen: { backgroundColor: '#0d9488' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  qtyNum: { fontSize: 16, fontWeight: '600', width: 24, textAlign: 'center' },
  addBtn: { backgroundColor: '#0d9488', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, width: '100%', alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  cartBtn: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#0d9488', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cartIcon: { fontSize: 28 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  cartModal: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  cartTitle: { fontSize: 22, fontWeight: 'bold' },
  cartClose: { fontSize: 24, color: '#6b7280' },
  cartList: { padding: 20, maxHeight: 300 },
  cartEmpty: { textAlign: 'center', color: '#9ca3af', fontSize: 16, paddingVertical: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cartItemEmoji: { fontSize: 32 },
  cartItemName: { fontWeight: '600', fontSize: 15 },
  cartItemPrice: { color: '#6b7280', fontSize: 13 },
  cartFooter: { padding: 20, borderTopWidth: 1, borderColor: '#e5e7eb' },
  cartTotal: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
   orderBtn: { backgroundColor: '#0d9488', borderRadius: 16, padding: 16, alignItems: 'center' },
  orderBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
