import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BASE_URL } from './config';

const workboxManifest = self.__WB_MANIFEST;
precacheAndRoute(workboxManifest);

// Google Fonts caching strategy
const googleFontsMatchCallback = ({ url }) => {
  const isGoogleFonts = url.origin === 'https://fonts.googleapis.com';
  const isGoogleStatic = url.origin === 'https://fonts.gstatic.com';
  return isGoogleFonts || isGoogleStatic;
};

const googleFontsCacheStrategy = new CacheFirst({
  cacheName: 'google-fonts',
});

registerRoute(googleFontsMatchCallback, googleFontsCacheStrategy);

// FontAwesome caching strategy
const fontAwesomeMatchCallback = ({ url }) => {
  const isCdnJs = url.origin === 'https://cdnjs.cloudflare.com';
  const isFontAwesome = url.origin.includes('fontawesome');
  return isCdnJs || isFontAwesome;
};

const fontAwesomeCacheStrategy = new CacheFirst({
  cacheName: 'fontawesome',
});

registerRoute(fontAwesomeMatchCallback, fontAwesomeCacheStrategy);

// Avatar API caching strategy
const avatarApiMatchCallback = ({ url }) => {
  const isAvatarApi = url.origin === 'https://ui-avatars.com';
  return isAvatarApi;
};

const cacheableResponsePlugin = new CacheableResponsePlugin({
  statuses: [0, 200],
});

const avatarCacheStrategy = new CacheFirst({
  cacheName: 'avatars-api',
  plugins: [cacheableResponsePlugin],
});

registerRoute(avatarApiMatchCallback, avatarCacheStrategy);

// Story API (non-image) caching strategy
const storyApiMatchCallback = ({ request, url }) => {
  const appBaseUrl = new URL(BASE_URL);
  const isSameOrigin = appBaseUrl.origin === url.origin;
  const isNotImage = request.destination !== 'image';
  return isSameOrigin && isNotImage;
};

const storyApiCacheStrategy = new NetworkFirst({
  cacheName: 'story-apps-api',
});

registerRoute(storyApiMatchCallback, storyApiCacheStrategy);

// Story API images caching strategy
const storyImageMatchCallback = ({ request, url }) => {
  const appBaseUrl = new URL(BASE_URL);
  const isSameOrigin = appBaseUrl.origin === url.origin;
  const isImageRequest = request.destination === 'image';
  return isSameOrigin && isImageRequest;
};

const storyImageCacheStrategy = new StaleWhileRevalidate({
  cacheName: 'storyapps-api-images',
});

registerRoute(storyImageMatchCallback, storyImageCacheStrategy);

// MapTiler API caching strategy
const mapTilerMatchCallback = ({ url }) => {
  const isMapTilerApi = url.origin.includes('maptiler');
  return isMapTilerApi;
};

const mapTilerCacheStrategy = new CacheFirst({
  cacheName: 'maptiler-api',
});

registerRoute(mapTilerMatchCallback, mapTilerCacheStrategy);

// Service Worker installation event handler
self.addEventListener('install', (installEvent) => {
  console.log('Service Worker installing.');
  const skipWaitingPromise = self.skipWaiting();
  installEvent.waitUntil(skipWaitingPromise);
});

// Service Worker activation event handler
self.addEventListener('activate', (activationEvent) => {
  console.log('Service Worker activating.');
  const clientsClaimPromise = self.clients.claim();
  activationEvent.waitUntil(clientsClaimPromise);
});

// Push notification event handler
self.addEventListener('push', (pushEvent) => {
  const eventData = pushEvent.data;
  const defaultNotificationData = {
    title: 'Notification',
    body: 'You have a new notification',
    data: {},
  };
  
  const notificationPayload = eventData?.json() || defaultNotificationData;

  const displayOptions = {
    body: notificationPayload.body,
    data: notificationPayload.data,
  };

  const showNotificationPromise = self.registration.showNotification(
    notificationPayload.title, 
    displayOptions
  );
  
  pushEvent.waitUntil(showNotificationPromise);
});

// Notification click event handler
self.addEventListener('notificationclick', (clickEvent) => {
  const clickedNotification = clickEvent.notification;
  clickedNotification.close();

  const handleNotificationClick = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      for (const windowClient of windowClients) {
        const isRootUrl = windowClient.url === '/';
        const canFocus = 'focus' in windowClient;
        
        if (isRootUrl && canFocus) {
          return windowClient.focus();
        }
      }

      const canOpenWindow = clients.openWindow;
      if (canOpenWindow) {
        const targetUrl = clickEvent.notification.data.url || '/';
        return clients.openWindow(targetUrl);
      }
    });

  clickEvent.waitUntil(handleNotificationClick);
});