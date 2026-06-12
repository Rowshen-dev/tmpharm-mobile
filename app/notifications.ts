import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../supabaseClient';

// Настройка как показывать уведомления когда приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Получить токен и сохранить в Supabase
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push уведомления работают только на реальном устройстве');
    return null;
  }

  // Запрашиваем разрешение
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Разрешение на уведомления не получено');
    return null;
  }

  // Получаем токен
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: '4c8cd2ce-c960-46da-916a-69f63f7259fc'
  })).data;
  console.log('Push token:', token);

  // Сохраняем в Supabase
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ token }, { onConflict: 'token' });

  if (error) console.log('Ошибка сохранения токена:', error.message);

  // Для Android нужен канал
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}