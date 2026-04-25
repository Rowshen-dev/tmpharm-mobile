import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 2000);
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>TM.Pharm</Text>
        <Text style={styles.subtitle}>Türkmenistanyň derman platformasy</Text>
      </View>
    );
  }

  return <Redirect href={'/home' as any} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#0d9488', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6b7280' },
});
