import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';
import { registerForPushNotifications } from './notifications';

export default function Home() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityOpen, setCityOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { cart, setCart, addToCart, removeFromCart, getQty, totalItems, totalPrice, lang, setLang, tr, city, setCity } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any | null>(null);



  useEffect(() => {
    async function fetchData() {
      const { data: meds } = await supabase.from('medicines').select('*');
      const { data: pharms } = await supabase.from('pharmacies').select('*').eq('city', city);
      setMedicines(meds || []);
      setPharmacies(pharms || []);
      setLoading(false);
    }
    fetchData();
  }, [city]);

  useEffect(() => {
    registerForPushNotifications();
  }, []);


const handleSearch = () => {
  if (search.trim()) router.push({ pathname: '/search' as any, params: { q: search } });
};


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={styles.container}>
        {/* Header */}
       <View style={styles.header}>
  <Text style={styles.logo}>TM.Pharm</Text>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <TouchableOpacity onPress={() => setLang(lang === 'TM' ? 'RU' : 'TM')} style={{ backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ color: '#374151', fontSize: 13, fontWeight: '500' }}>{lang} ▼</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setCityOpen(!cityOpen)} style={{ backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ color: '#374151', fontSize: 13, fontWeight: '500' }}>{city} ▼</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace('/')}>
      <Text style={styles.logout}>{tr.logout}</Text>
    </TouchableOpacity>
  </View>
</View>
{cityOpen && (
  <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
    {['Asgabat','Arkadag','Turkmenabat','Dashoguz','Turkmenbashy','Mary'].map(c => (
      <TouchableOpacity key={c} style={{ padding: 14, borderBottomWidth: 1, borderColor: '#f3f4f6' }} onPress={() => { setCity(c); setCityOpen(false); }}>
        <Text style={{ fontSize: 16, color: city === c ? '#0d9488' : '#374151', fontWeight: city === c ? 'bold' : 'normal' }}>{c}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}



        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.search}
            placeholder="Gözlemek..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Nav buttons */}
        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/medicines' as any)}>
            <Text style={styles.navText}>💊 {tr.medicines}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/pharmacies' as any)}>
            <Text style={styles.navText}>🏥 {tr.pharmacies}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/compare')}>
            <Text style={styles.navText}>⚖️ {tr.compare}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/news')}>
            <Text style={styles.navText}>📰 {tr.news}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/firstaid')}>
            <Text style={styles.navText}>🚨 {tr.firstaid}</Text>
          </TouchableOpacity>
        </View>

            {/* Medicines scrolling */}
        <Text style={styles.sectionTitle}>{tr.medicines}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medScroll}>
          {medicines.map((med) => {
            const qty = getQty(med.id);
            return (
              <TouchableOpacity key={med.id} style={styles.medCard} onPress={() => setSelectedMed(med)} activeOpacity={0.85}>
                {med.image_url ? (
                  <Image source={{ uri: med.image_url }} style={{ width: 60, height: 60, marginBottom: 8 }} resizeMode="contain" />
                ) : (
                  <Text style={styles.medEmoji}>{med.emoji || '💊'}</Text>
                )}
                <Text style={styles.medName}>{med.name}</Text>
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
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pharmacies */}
        <Text style={styles.sectionTitle}>{tr.pharmacies}</Text>
        <View style={styles.pharmGrid}>
          {pharmacies.map((ph) => (
            <TouchableOpacity
              key={ph.name}
              style={styles.pharmCard}
              onPress={() => router.push({ pathname: '/pharmacy', params: { name: ph.name } })}
            >
              <Text style={styles.pharmEmoji}>{ph.image || '🏥'}</Text>
              <Text style={styles.pharmName}>{ph.name}</Text>
              <Text style={styles.pharmBio} numberOfLines={2}>{ph.bio}</Text>
              {ph.is_top && <Text style={styles.premium}>⭐ Premium</Text>}
            </TouchableOpacity>
          ))}
        </View>

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
            <Text style={styles.cartTotal}>{tr.total} {totalPrice.toFixed(2)} TMT</Text>
            <TouchableOpacity style={styles.orderBtn}>
              <Text style={styles.orderBtnText}>{tr.order}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}


      {/* Medicine detail modal */}
      <Modal visible={!!selectedMed} animationType="slide" transparent onRequestClose={() => setSelectedMed(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', padding: 24, paddingTop: 16 }}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 8 }} onPress={() => setSelectedMed(null)}>
              <Text style={{ fontSize: 22, color: '#6b7280' }}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                {selectedMed?.image_url ? (
                  <Image source={{ uri: selectedMed.image_url }} style={{ width: 160, height: 160 }} resizeMode="contain" />
                ) : (
                  <Text style={{ fontSize: 80 }}>{selectedMed?.emoji || '💊'}</Text>
                )}
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#111827' }}>{selectedMed?.name}</Text>
              {selectedMed?.pharmacy && <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 12 }}>🏥 {selectedMed.pharmacy}</Text>}
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#0d9488', textAlign: 'center', marginBottom: 20 }}>
                {selectedMed?.price ? `${selectedMed.price} TMT` : 'Nyrhy soraň'}
              </Text>
              {selectedMed?.manufacturer && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>🏭 Öndüriji</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{selectedMed.manufacturer}</Text>
                </View>
              )}
              {selectedMed?.country && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>🌍 Ýurt</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{selectedMed.country}</Text>
                </View>
              )}
              {selectedMed?.active_ingredient && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>🧬 Düzümi</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{selectedMed.active_ingredient}</Text>
                </View>
              )}
              {selectedMed?.dosage_form && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>💉 Görnüşi</Text>
                  <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>{selectedMed.dosage_form}</Text>
                </View>
              )}
              {selectedMed?.description && (
                <View style={{ paddingVertical: 12 }}>
                  <Text style={{ color: '#6b7280', fontSize: 15, marginBottom: 8 }}>📋 Düşündiriş</Text>
                  <Text style={{ color: '#374151', fontSize: 15, lineHeight: 22 }}>{selectedMed.description}</Text>
                </View>
              )}
              <TouchableOpacity
                style={{ backgroundColor: '#0d9488', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 24 }}
                onPress={() => { addToCart(selectedMed); setSelectedMed(null); }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{tr.addToCart}</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#0d9488' },
  logout: { color: '#ef4444', fontWeight: '600', backgroundColor: '#fee2e2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  searchRow: { padding: 16, backgroundColor: 'white' },
  search: { backgroundColor: '#f9fafb', borderRadius: 30, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  navGrid: { padding: 16, gap: 10 },
  navBtn: { backgroundColor: 'white', borderWidth: 2, borderColor: '#99f6e4', borderRadius: 16, padding: 16, alignItems: 'center' },
  navText: { color: '#0d9488', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  medScroll: { paddingLeft: 16, marginBottom: 24 },
  medCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginRight: 12, width: 160, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medEmoji: { fontSize: 48, marginBottom: 8 },
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
  pharmGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pharmCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  pharmEmoji: { fontSize: 48, marginBottom: 8 },
  pharmName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  pharmBio: { color: '#9ca3af', fontSize: 12, textAlign: 'center' },
  premium: { backgroundColor: '#fbbf24', color: 'black', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: 'bold', marginTop: 8 },
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  langText: { color: '#374151', fontSize: 13, fontWeight: '500' },
  cityPickerBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  cityPickerText: { color: '#374151', fontSize: 13, fontWeight: '500' },
  cityDropdown: { backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, zIndex: 100 },
  cityDropdownItem: { padding: 14, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  cityDropdownText: { fontSize: 16, color: '#374151' },

});
