import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';

export default function Pharmacies() {
  const router = useRouter();
  const { city } = useCart();
  const [pharmacies, setPharmacies] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('pharmacies').select('*').eq('city', city);
      setPharmacies(data || []);
    }
    fetch();
  }, [city]);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={20} color="#374151" />
        <Text style={styles.backText}>Yza gaytmak</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Dermanhanalar</Text>

      <View style={styles.grid}>
        {pharmacies.map((ph) => (
          <TouchableOpacity
            key={ph.name}
            style={styles.card}
            onPress={() => router.push({ pathname: '/pharmacy', params: { name: ph.name } })}
          >
            <Text style={styles.emoji}>{ph.image || '🏥'}</Text>
            <Text style={styles.name}>{ph.name}</Text>
            <Text style={styles.bio} numberOfLines={2}>{ph.bio}</Text>
            {ph.is_top && (
              <View style={styles.premium}>
                <Ionicons name="star" size={12} color="#f8a90d" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emoji: { fontSize: 48, marginBottom: 8 },
  name: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  bio: { color: '#9ca3af', fontSize: 12, textAlign: 'center' },
  premium: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  premiumText: { color: '#92400e', fontSize: 12, fontWeight: 'bold' },
});