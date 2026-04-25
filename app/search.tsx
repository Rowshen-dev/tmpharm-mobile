import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';

export default function Search() {
  const router = useRouter();
  const { q } = useLocalSearchParams();
  const [query, setQuery] = useState((q as string) || '');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { cart, setCart, addToCart, removeFromCart, getQty, totalItems, totalPrice } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const { tr } = useCart();

  useEffect(() => {
    if (q) doSearch(q as string);
  }, [q]);

  const doSearch = async (text: string) => {
    setLoading(true);
    setSearched(true);
    const { data: meds } = await supabase.from('medicines').select('*').ilike('name', `%${text}%`);
    const { data: pharms } = await supabase.from('pharmacies').select('*').ilike('name', `%${text}%`);
    setMedicines(meds || []);
    setPharmacies(pharms || []);
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{tr.back}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🔍 {tr.searchpage}: "{q}"</Text>

        {loading && <Text style={styles.info}>Gözlenýär...</Text>}

        {!loading && searched && medicines.length === 0 && pharmacies.length === 0 && (
          <Text style={styles.info}>{tr.notFound}</Text>
        )}

        {medicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 {tr.medicines}</Text>
            <View style={styles.grid}>
              {medicines.map((med) => (
                <View key={med.id} style={styles.card}>
                  <Text style={styles.emoji}>{med.emoji || '💊'}</Text>
                  <Text style={styles.name}>{med.name}</Text>
                  <Text style={styles.price}>{med.price}</Text>
                  <Text style={styles.pharm}>{med.pharmacy}</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(med)}>
                    <Text style={styles.addBtnText}>{tr.addToCart}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {pharmacies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 {tr.pharmacies}</Text>
            <View style={styles.grid}>
              {pharmacies.map((ph) => (
                <TouchableOpacity
                  key={ph.name}
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/pharmacy', params: { name: ph.name } })}
                >
                  <Text style={styles.emoji}>{ph.image || '🏥'}</Text>
                  <Text style={styles.name}>{ph.name}</Text>
                  <Text style={styles.pharm} numberOfLines={2}>{ph.bio}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
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
                        <Text style={styles.cartTitle}>🛒 Sebet</Text>
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
  container: { flex: 1 },
  backBtn: { margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, paddingHorizontal: 16 },
  info: { textAlign: 'center', color: '#6b7280', fontSize: 16, marginTop: 40 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emoji: { fontSize: 36, marginBottom: 8 },
  name: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  price: { color: '#0d9488', fontWeight: '700', fontSize: 15, marginBottom: 2 },
  pharm: { color: '#9ca3af', fontSize: 12, marginBottom: 8, textAlign: 'center' },
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
