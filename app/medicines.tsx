import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';

export default function Medicines() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedMed, setSelectedMed] = useState<any | null>(null);
  const { cart, setCart, addToCart, removeFromCart, getQty, totalItems, totalPrice, tr } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
const [orderMed, setOrderMed] = useState<any>(null);
const [customerPhone, setCustomerPhone] = useState('');
const [customerName, setCustomerName] = useState('');
const [isOrdering, setIsOrdering] = useState(false);

const handleOrder = (med: any) => {
  setOrderMed(med);
  setShowOrderModal(true);
};

const submitOrder = async () => {
  if (!customerPhone) { Alert.alert('Ýalňyşlyk', 'Telefon belgiňizi giriziň'); return; }
  setIsOrdering(true);
  const { error } = await supabase.from('orders').insert({
    pharmacy_name: orderMed?.pharmacy,
    medicine_name: orderMed?.name,
    medicine_price: orderMed?.price,
    quantity: 1,
    customer_phone: customerPhone,
    customer_name: customerName,
  });
  if (error) { Alert.alert('Ýalňyşlyk', error.message); }
  else { Alert.alert('✅', 'Bron edildi! Dermanhana size jaň eder!'); setShowOrderModal(false); setCustomerPhone(''); setCustomerName(''); }
  setIsOrdering(false);
};

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
            <Ionicons name="chevron-back" size={20} color="#374151" />
          <Text style={styles.backText}>{tr.back}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{tr.medicines}</Text>

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
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Medicines grid */}
        <View style={styles.grid}>
          {filtered.map((med) => {
            const qty = getQty(med.id);
            return (
              <TouchableOpacity key={med.id} style={styles.medCard} onPress={() => setSelectedMed(med)} activeOpacity={0.85}>
                {med.image_url ? (
                  <Image source={{ uri: med.image_url }} style={styles.medImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.medEmoji}>{med.emoji || '💊'}</Text>
                )}
                <Text style={styles.medName} numberOfLines={2}>{med.name}</Text>
                <Text style={styles.medPrice}>{med.price ? `${med.price} TMT` : 'Nyrhy soraň'}</Text>
                <Text style={styles.medPharm}>{med.pharmacy}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={(e) => { e.stopPropagation?.(); removeFromCart(med); }}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{qty}</Text>
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
            );
          })}
        </View>
      </ScrollView>

      {/* Cart button */}
      <TouchableOpacity style={styles.cartBtn} onPress={() => setCartOpen(true)}>
        <Ionicons name="cart-outline" size={28} color="white" />
        {totalItems > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Medicine detail modal */}
      <Modal visible={!!selectedMed} animationType="slide" transparent onRequestClose={() => setSelectedMed(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedMed(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image or emoji */}
              <View style={styles.modalImageContainer}>
                {selectedMed?.image_url ? (
                  <Image source={{ uri: selectedMed.image_url }} style={styles.modalImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.modalEmoji}>{selectedMed?.emoji || '💊'}</Text>
                )}
              </View>

              {/* Name */}
              <Text style={styles.modalName}>{selectedMed?.name}</Text>

              {/* Pharmacy */}
              {selectedMed?.pharmacy && (
                <Text style={styles.modalPharm}>{selectedMed.pharmacy}</Text>
              )}

              {/* Price */}
              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPrice}>
                  {selectedMed?.price ? `${selectedMed.price} TMT` : 'Nyrhy soraň'}
                </Text>
                {selectedMed?.prescription_only && (
                  <View style={styles.rxBadge}>
                    <Text style={styles.rxText}>Rx</Text>
                  </View>
                )}
              </View>

              {/* Info rows */}
              {selectedMed?.manufacturer && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Öndüriji</Text>
                  <Text style={styles.infoValue}>{selectedMed.manufacturer}</Text>
                </View>
              )}

              {selectedMed?.country && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ýurt</Text>
                  <Text style={styles.infoValue}>{selectedMed.country}</Text>
                </View>
              )}

              {selectedMed?.active_ingredient && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Düzümi</Text>
                  <Text style={styles.infoValue}>{selectedMed.active_ingredient}</Text>
                </View>
              )}

              {selectedMed?.dosage_form && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Görnüşi</Text>
                  <Text style={styles.infoValue}>{selectedMed.dosage_form}</Text>
                </View>
              )}

              {selectedMed?.description && (
                <View style={styles.descContainer}>
                  <Text style={styles.infoLabel}>Düşündiriş</Text>
                  <Text style={styles.descText}>{selectedMed.description}</Text>
                </View>
              )}

              {/* Add to cart */}
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={() => { addToCart(selectedMed); setSelectedMed(null); }}
              >
                <Text style={styles.modalAddBtnText}>{tr.addToCart}</Text>
              </TouchableOpacity>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cart modal */}
      {cartOpen && (
        <View style={styles.cartModal}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>{tr.cart}</Text>
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
      {/* Order modal */}
      {showOrderModal && (
        <Modal transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Bron etmek</Text>
              <Text style={{ color: '#6b7280', marginBottom: 16 }}>{orderMed?.name} — {orderMed?.price} TMT</Text>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  catRow: { paddingHorizontal: 16, marginBottom: 16 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#99f6e4', backgroundColor: 'white', marginRight: 8, height: 44, justifyContent: 'center' },
  catBtnActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  catText: { color: '#0d9488', fontWeight: '500' },
  catTextActive: { color: 'white' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  medCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medImage: { width: 80, height: 80, marginBottom: 8 },
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
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', padding: 24, paddingTop: 16 },
  modalClose: { alignSelf: 'flex-end', padding: 8 },
  modalCloseText: { fontSize: 22, color: '#6b7280' },
  modalImageContainer: { alignItems: 'center', marginVertical: 16 },
  modalImage: { width: 160, height: 160 },
  modalEmoji: { fontSize: 80 },
  modalName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#111827' },
  modalPharm: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 12 },
  modalPriceRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 },
  modalPrice: { fontSize: 26, fontWeight: 'bold', color: '#0d9488' },
  rxBadge: { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  rxText: { color: '#d97706', fontWeight: 'bold', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  infoLabel: { fontSize: 15, color: '#6b7280', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 15, color: '#111827', fontWeight: '600', flex: 1, textAlign: 'right' },
  descContainer: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  descText: { fontSize: 15, color: '#374151', lineHeight: 22, marginTop: 8 },
  modalAddBtn: { backgroundColor: '#0d9488', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 24 },
  modalAddBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  // Cart styles
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