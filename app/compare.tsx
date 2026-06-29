import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';


export default function Compare() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tr } = useCart();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase.from('medicines').select('*').ilike('name', `%${query}%`);
    setResults((data || []).sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
    setLoading(false);
  };

  const minPrice = results.length > 0 ? Math.min(...results.map(r => parseFloat(r.price))) : null;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#374151" />
        <Text style={styles.backText}>{tr.back}</Text>
      </TouchableOpacity>

      <Text style={styles.title}> {tr.compare}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Dermanyň adyny ýazyň..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>{tr.searchtwo}</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loadingText}>{tr.search}</Text>}

      {!loading && searched && results.length === 0 && (
        <Text style={styles.notFound}>{tr.notFound}</Text>
      )}

      {!loading && results.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultTitle}>"{results[0].name}" — {results.length} {tr.found}</Text>
          {results.map((item) => {
            const isCheapest = parseFloat(item.price) === minPrice;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isCheapest && styles.cardCheapest]}
                onPress={() => router.push({ pathname: '/pharmacy', params: { name: item.pharmacy } })}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardEmoji}>{item.emoji || '💊'}</Text>
                  <View>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardPharm}>🏥 {item.pharmacy}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                  {isCheapest && <Text style={styles.cheapest}>✅</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, paddingHorizontal: 16 },
  subtitle: { color: '#6b7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  searchBtn: { backgroundColor: '#0d9488', borderRadius: 16, paddingHorizontal: 20, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingText: { textAlign: 'center', color: '#6b7280', fontSize: 16 },
  notFound: { textAlign: 'center', color: '#6b7280', fontSize: 18, marginTop: 40 },
  results: { paddingHorizontal: 16, paddingBottom: 100 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: 'black', shadowOpacity: 0.05 },
  cardCheapest: { borderColor: '#22c55e' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardEmoji: { fontSize: 32 },
  cardName: { fontWeight: 'bold', fontSize: 16 },
  cardPharm: { color: '#0d9488', fontSize: 14 },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { fontSize: 20, fontWeight: 'bold', color: '#0d9488' },
  cheapest: { fontSize: 12, color: '#16a34a', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
});
