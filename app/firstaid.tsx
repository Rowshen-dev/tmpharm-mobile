import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from './_cartContext';

export default function FirstAid() {
  const { tr } = useCart();
  const router = useRouter();

  const tips = [
    { title: 'Ýürek durandа', steps: ['103 jaň ediň', 'Ýere ýatyr', 'Döşüne 100-120/min basyň', 'Dem almagyna kömek ediň'] },
    { title: 'Gan akandа', steps: ['Ýarany berk basyň', 'Ýokary galdyryň', 'Bandaj daňyň', '103 jaň ediň'] },
    { title: 'Ýanan mahaly', steps: ['Sowuk suw akytyň 10 min', 'Buz goýmaň', 'Arassa mata bilen örtüň', '103 jaň ediň'] },
    { title: 'Huşuny ýitirendе', steps: ['Arkasyna ýatyr', 'Başyny yza egiň', 'Dem alýanmy barlаň', '103 jaň ediň'] },
    { title: 'Süňk döwülendе', steps: ['Gymyldatmaň', 'Şinany daňyň', 'Buz goýuň mata bilen', '103 jaň ediň'] },
    { title: 'Tok urandа', steps: ['Tok çeşmesini öçüriň', 'El degirmeň', '103 jaň ediň', 'CPR başlaň gerek bolsa'] },
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={20} color="#374151" />
        <Text style={styles.backText}>{tr.back}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{tr.firstaid}</Text>
      <Text style={styles.subtitle}>{tr.firstaidSubtitle}</Text>

      <View style={styles.emergency}>
        <Text style={styles.emergencyText}><Ionicons name="call-outline" size={24} color="#dc2626" style={{ marginBottom: 4 }} />{tr.emergency}</Text>
      </View>

      <View style={styles.list}>
        {tips.map((tip, i) => (
          <View key={i} style={styles.card}>
           <Ionicons name="medkit-outline" size={40} color="#0d9488" style={{ textAlign: 'center', marginBottom: 8, alignSelf: 'center' }} />
            <Text style={styles.cardTitle}>{tip.title}</Text>
            {tip.steps.map((step, j) => (
              <View key={j} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{j + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, marginTop: 60, backgroundColor: '#e5e7eb', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  backText: { color: '#374151', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  emergency: { backgroundColor: '#fee2e2', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  emergencyText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  stepNum: { backgroundColor: '#0d9488', borderRadius: 20, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  stepText: { color: '#374151', fontSize: 15, flex: 1 },
});
