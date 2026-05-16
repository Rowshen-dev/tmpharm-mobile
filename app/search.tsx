import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';


export default function Search() {
  const router = useRouter();
  const params = useLocalSearchParams();
const [query, setQuery] = useState(params.q as string || '');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  useEffect(() => {
  if (params.q) handleSearch();
}, []);


  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data: meds } = await supabase.from('medicines').select('*').ilike('name', `%${query}%`);
    const { data: pharms } = await supabase.from('pharmacies').select('*').ilike('name', `%${query}%`);
    setMedicines(meds || []);
    setPharmacies(pharms || []);
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0fdf4' }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Yza gaytmak</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🔍 Gözleg</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Derman ýa-da dermanhana..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Gözle</Text>
          </TouchableOpacity>
        </View>

        {loading && <Text style={styles.loadingText}>Gözlenýär...</Text>}

        {!loading && searched && medicines.length === 0 && pharmacies.length === 0 && (
          <Text style={styles.notFound}>Hiç zat tapylmady 😔</Text>
        )}

        {!loading && medicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 Dermanlar</Text>
            <View style={styles.grid}>
              {medicines.map((med) => (
                <View key={med.id} style={styles.medCard}>
                  <Text style={styles.medEmoji}>{med.emoji || '💊'}</Text>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medPrice}>{med.price}</Text>
                  <Text style={styles.medPharm}>{med.pharmacy}</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(med)}>
                    <Text style={styles.addBtnText}>Sebede goş</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {!loading && pharmacies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 Dermanhanalar</Text>
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
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  searchBtn: { backgroundColor: '#0d9488', borderRadius: 16, paddingHorizontal: 20, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingText: { textAlign: 'center', color: '#6b7280', fontSize: 16 },
  notFound: { textAlign: 'center', color: '#6b7280', fontSize: 18, marginTop: 40 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  medCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medEmoji: { fontSize: 40, marginBottom: 8 },
  medName: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  medPrice: { color: '#0d9488', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  medPharm: { color: '#9ca3af', fontSize: 12, marginBottom: 8 },
  addBtn: { backgroundColor: '#0d9488', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, width: '100%', alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  pharmGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pharmCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  pharmEmoji: { fontSize: 40, marginBottom: 8 },
  pharmName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  pharmBio: { color: '#9ca3af', fontSize: 12, textAlign: 'center' },
});
