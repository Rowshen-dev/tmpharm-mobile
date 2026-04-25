import { Stack } from "expo-router";
import { CartProvider } from "./_cartContext";

export default function RootLayout() {
  return (
    <CartProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false}} />
      <Stack.Screen name="pharmacy" options={{ headerShown: false }} />
      <Stack.Screen name="pharmacies" options={{ headerShown: false }} />
      <Stack.Screen name="medicines" options={{ headerShown: false }} />
      <Stack.Screen name="compare" options={{ headerShown: false }} />
      <Stack.Screen name="news" options={{ headerShown: false }} />
      <Stack.Screen name="firstaid" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
     </Stack>
     </CartProvider>
  );
}