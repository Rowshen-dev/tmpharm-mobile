import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { useCart } from './_cartContext';

export default function News() {
  const {tr, lang } = useCart();
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      setNews(data || []);
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
       <Ionicons name="chevron-back" size={20} color="#374151" />
        <Text style={styles.backText}>{tr.back}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{tr.news}</Text>
      <Text style={styles.subtitle}>{tr.newsSubtitle}</Text>

      {loading ? (
        <Text style={styles.loadingText}>{tr.loading}</Text>
      ) : (
        <View style={styles.list}>
          {news.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardEmoji}><Ionicons name="newspaper-outline" size={36} color="#0d9488" /></Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{lang === 'RU' && item.title_ru ? item.title_ru : item.title}</Text>
                <Text style={styles.cardText}>{lang === 'RU' && item.content_ru ? item.content_ru : item.content}</Text>
                <Text style={styles.cardDate}>
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            </View>
          ))}
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
  loadingText: { textAlign: 'center', color: '#6b7280', fontSize: 16, marginTop: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardEmoji: { fontSize: 36 },
  cardContent: { flex: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 17, marginBottom: 6 },
  cardText: { color: '#6b7280', fontSize: 14, marginBottom: 6 },
  cardDate: { color: '#9ca3af', fontSize: 12 },
});
