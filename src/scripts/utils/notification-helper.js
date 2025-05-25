import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
  const hasNotificationSupport = 'Notification' in window;
  return hasNotificationSupport;
}

export function isNotificationGranted() {
  const currentPermission = Notification.permission;
  return currentPermission === 'granted';
}

export async function requestNotificationPermission() {
  const notificationSupported = isNotificationAvailable();
  
  if (!notificationSupported) {
    console.error('Notification API unsupported.');
    return false;
  }

  const alreadyGranted = isNotificationGranted();
  if (alreadyGranted) {
    return true;
  }

  const permissionStatus = await Notification.requestPermission();

  if (permissionStatus === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (permissionStatus === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
  const currentSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
  return currentSubscription;
}

export async function isCurrentPushSubscriptionAvailable() {
  const existingSubscription = await getPushSubscription();
  return !!existingSubscription;
}

export function generateSubscribeOptions() {
  const vapidKey = VAPID_PUBLIC_KEY;
  const convertedKey = convertBase64ToUint8Array(vapidKey);
  
  const subscriptionOptions = {
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  };
  
  return subscriptionOptions;
}

export async function subscribe() {
  const permissionGranted = await requestNotificationPermission();
  
  if (!permissionGranted) {
    return;
  }

  const hasActiveSubscription = await isCurrentPushSubscriptionAvailable();
  if (hasActiveSubscription) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  console.log('Mulai berlangganan push notification...');

  const subscriptionFailMessage = 'Langganan push notification gagal diaktifkan.';
  const subscriptionSuccessMessage = 'Langganan push notification berhasil diaktifkan.';
  
  let newPushSubscription;
  
  try {
    const swRegistration = await navigator.serviceWorker.getRegistration();
    const subscriptionOptions = generateSubscribeOptions();
    newPushSubscription = await swRegistration.pushManager.subscribe(subscriptionOptions);
    
    const subscriptionData = newPushSubscription.toJSON();
    const { endpoint, keys } = subscriptionData;
    
    const apiResponse = await subscribePushNotification({ endpoint, keys });
    
    if (!apiResponse.ok) {
      console.error('subscribe: response:', apiResponse);
      alert(subscriptionFailMessage);
      // Undo subscribe to push notification
      await newPushSubscription.unsubscribe();
      return;
    }

    alert(subscriptionSuccessMessage);
  } catch (err) {
    console.error('subscribe: error:', err);
    alert(subscriptionFailMessage);

    if (newPushSubscription) {
      await newPushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const unsubscribeFailMessage = 'Langganan push notification gagal dinonaktifkan.';
  const unsubscribeSuccessMessage = 'Langganan push notification berhasil dinonaktifkan.';
  
  try {
    const currentSubscription = await getPushSubscription();
    
    if (!currentSubscription) {
      alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      return;
    }
    
    const subscriptionData = currentSubscription.toJSON();
    const { endpoint, keys } = subscriptionData;
    
    const apiResponse = await unsubscribePushNotification({ endpoint });
    
    if (!apiResponse.ok) {
      alert(unsubscribeFailMessage);
      console.error('unsubscribe: response:', apiResponse);
      return;
    }
    
    const unsubscribeResult = await currentSubscription.unsubscribe();
    
    if (!unsubscribeResult) {
      alert(unsubscribeFailMessage);
      await subscribePushNotification({ endpoint, keys });
      return;
    }
    
    alert(unsubscribeSuccessMessage);
  } catch (err) {
    alert(unsubscribeFailMessage);
    console.error('unsubscribe: error:', err);
  }
}