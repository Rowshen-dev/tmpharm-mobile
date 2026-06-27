import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';

export default function PharmacyScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, setCart, addToCart, removeFromCart, getQty, totalItems, totalPrice, tr } = useCart();
  const [showOrderModal, setShowOrderModal] = useState(false);
const [selectedMed, setSelectedMed] = useState<any>(null);
const [customerPhone, setCustomerPhone] = useState('');
const [customerName, setCustomerName] = useState('');
const [isOrdering, setIsOrdering] = useState(false);
const [medInfoModal, setMedInfoModal] = useState<any | null>(null);

const handleOrder = (med: any) => {
  setSelectedMed(med);
  setShowOrderModal(true);
};

const submitOrder = async () => {
  if (!customerPhone) { Alert.alert('Ýalňyşlyk', 'Telefon belgiňizi giriziň'); return; }
  setIsOrdering(true);
  const { error } = await supabase.from('orders').insert({
    pharmacy_name: pharmacy?.name,
    medicine_name: selectedMed.name,
    medicine_price: selectedMed.price,
    quantity: 1,
    customer_phone: customerPhone,
    customer_name: customerName,
  });
  if (error) { Alert.alert('Ýalňyşlyk', error.message); }
  else { Alert.alert('✅', 'Bron edildi! Dermanhana size jaň eder!'); setShowOrderModal(false); setCustomerPhone(''); setCustomerName(''); }
  setIsOrdering(false);
};
  const [cartOpen, setCartOpen] = useState(false);


  useEffect(() => {
    async function fetchData() {
      const { data: ph } = await supabase.from('pharmacies').select('*').eq('name', name).single();
      const { data: meds } = await supabase.from('medicines').select('*').eq('pharmacy', name);
      setPharmacy(ph);
      setMedicines(meds || []);
      setLoading(false);
    }
    fetchData();
  }, [name]);

  if (loading) return (
    <View style={styles.center}>
      <Text style={styles.loading}>{tr.loading}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>{tr.back}</Text>
      </TouchableOpacity>

      {/* Profile */}
      <View style={styles.profile}>
        <Text style={styles.profileEmoji}>{pharmacy?.image || '🏥'}</Text>
        <Text style={styles.profileName}>{pharmacy?.name}</Text>
        <Text style={styles.profileBio}>{pharmacy?.bio}</Text>
        <Text style={styles.profileAddress}>{pharmacy?.address}</Text>
        <Text style={styles.profilePhone}>{pharmacy?.phone}</Text>
      </View>

      {/* Medicines */}
      <Text style={styles.sectionTitle}>{tr.medicines}</Text>
     <View style={styles.grid}>
        {medicines.map((med) => (
          <TouchableOpacity key={med.id} style={styles.medCard} onPress={() => setMedInfoModal(med)} activeOpacity={0.85}>
            {med.image_url ? (
              <Image source={{ uri: med.image_url }} style={{ width: 60, height: 60, marginBottom: 8 }} resizeMode="contain" />
            ) : (
              <Text style={styles.medEmoji}>{med.emoji || '💊'}</Text>
            )}
            <Text style={styles.medName}>{med.name}</Text>
            <Text style={styles.medPrice}>{med.price ? `${med.price} TMT` : 'Nyrhy soraň'}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={(e) => { e.stopPropagation?.(); removeFromCart(med); }}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnGreen]} onPress={(e) => { e.stopPropagation?.(); addToCart(med); }}>
                <Text style={[styles.qtyBtnText, { color: 'white' }]}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={(e) => { e.stopPropagation?.(); addToCart(med); }}>
              <Text style={styles.addBtnText}>{tr.addToCart}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bronBtn} onPress={(e) => { e.stopPropagation?.(); handleOrder(med); }}>
              <Text style={styles.bronBtnText}>Bron etmek</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
                    <Text style={styles.cartItemPrice}>{item.price} TMT × {item.quantity}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item)}
                      style={{ width: 28, height: 28, backgroundColor: '#e5e7eb', borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151' }}>−</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' }}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => addToCart(item)}
                      style={{ width: 28, height: 28, backgroundColor: '#0d9488', borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCart((prev: any) => prev.filter((i: any) => i.id !== item.id))}
                      style={{ marginLeft: 4 }}
                    >
                      <Text style={{ color: '#ef4444', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
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
                {/* Medicine info modal */}
      <Modal visible={!!medInfoModal} animationType="slide" transparent onRequestClose={() => setMedInfoModal(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', padding: 24, paddingTop: 16 }}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 8 }} onPress={() => setMedInfoModal(null)}>
              <Text style={{ fontSize: 22, color: '#6b7280' }}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                {medInfoModal?.image_url ? (
                  <Image source={{ uri: medInfoModal.image_url }} style={{ width: 160, height: 160 }} resizeMode="contain" />
                ) : (
                  <Text style={{ fontSize: 80 }}>{medInfoModal?.emoji || '💊'}</Text>
                )}
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#111827' }}>{medInfoModal?.name}</Text>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#0d9488', textAlign: 'center', marginBottom: 20 }}>
                {medInfoModal?.price ? `${medInfoModal.price} TMT` : 'Nyrhy soraň'}
              </Text>
              {medInfoModal?.manufacturer && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>Öndüriji</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{medInfoModal.manufacturer}</Text>
                </View>
              )}
              {medInfoModal?.country && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>Ýurt</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{medInfoModal.country}</Text>
                </View>
              )}
              {medInfoModal?.active_ingredient && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>Düzümi</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{medInfoModal.active_ingredient}</Text>
                </View>
              )}
              {medInfoModal?.dosage_form && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>Görnüşi</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{medInfoModal.dosage_form}</Text>
                </View>
              )}
              {medInfoModal?.description && (
                <View style={{ paddingVertical: 12 }}>
                  <Text style={{ color: '#6b7280', fontSize: 15, marginBottom: 8 }}>Düşündiriş</Text>
                  <Text style={{ color: '#374151', fontSize: 15, lineHeight: 22 }}>{medInfoModal.description}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#0d9488', borderRadius: 16, padding: 16, alignItems: 'center' }}
                  onPress={() => { addToCart(medInfoModal); setMedInfoModal(null); }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{tr.addToCart}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: 'white', borderWidth: 2, borderColor: '#0d9488', borderRadius: 16, padding: 16, alignItems: 'center' }}
                  onPress={() => { handleOrder(medInfoModal); setMedInfoModal(null); }}
                >
                  <Text style={{ color: '#0d9488', fontWeight: 'bold', fontSize: 16 }}>Bron etmek</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
              {showOrderModal && (
  <Modal transparent animationType="slide">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
      <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Bron etmek</Text>
        <Text style={{ color: '#6b7280', marginBottom: 16 }}>{selectedMed?.name} — {selectedMed?.price}</Text>
        <TextInput
          placeholder="Adyňyz"
          value={customerName}
          onChangeText={setCustomerName}
          style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 14, fontSize: 16, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Telefon belgiňiz (+993...)"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
          style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 14, fontSize: 16, marginBottom: 20 }}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={submitOrder}
            disabled={isOrdering}
            style={{ flex: 1, backgroundColor: '#0d9488', borderRadius: 16, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {isOrdering ? 'Bronlanýar...' : 'Bron et'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowOrderModal(false)}
            style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16 }}>Ýatyr</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}  
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { fontSize: 18, color: '#6b7280' },
  backBtn: { margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  profile: { backgroundColor: 'white', margin: 16, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  profileEmoji: { fontSize: 60, marginBottom: 12 },
  profileName: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  profileBio: { color: '#6b7280', textAlign: 'center', marginBottom: 12, fontSize: 15 },
  profileAddress: { color: '#374151', marginBottom: 4 },
  profilePhone: { color: '#0d9488', fontWeight: '600' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  medCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medEmoji: { fontSize: 36, marginBottom: 8 },
  medName: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  medPrice: { color: '#0d9488', fontWeight: '600', fontSize: 14 },
   qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  qtyBtn: { width: 32, height: 32, backgroundColor: '#e5e7eb', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  qtyBtnGreen: { backgroundColor: '#0d9488' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  qtyNum: { fontSize: 16, fontWeight: '600', width: 24, textAlign: 'center' },
  addBtn: { backgroundColor: '#0d9488', borderRadius: 12, paddingVertical: 8, width: '100%', alignItems: 'center', marginTop: 8 },
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
  bronBtn: { backgroundColor: 'white', borderWidth: 2, borderColor: '#0d9488', borderRadius: 12, paddingVertical: 8, width: '100%', alignItems: 'center', marginTop: 8 },
bronBtnText: { color: '#0d9488', fontWeight: '600', fontSize: 13 },
});
