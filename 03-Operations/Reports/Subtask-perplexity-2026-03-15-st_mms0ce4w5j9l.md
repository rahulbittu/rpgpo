# Subtask Output — Research Push Notification Architecture
## Model: sonar
## Stage: report
## Date: 2026-03-15

## Recommended Architecture for Expo Push Notifications (2026)

Use **expo-notifications** library as the primary client-side implementation for React Native Expo apps. It handles device token registration, scheduling, and delivery for both Android (FCM) and iOS (APNs) without native code changes. Pair with Expo's push service for unified token management or send directly to FCM/APNs from your backend for advanced control.[2][1]

### Core Setup Steps
1. Install: `npx expo install expo-notifications`
2. Request permissions and get Expo push token:
   ```javascript
   import * as Notifications from 'expo-notifications';
   import { useEffect } from 'react';

   useEffect(() => {
     Notifications.requestPermissionsAsync();
     const token = (await Notifications.getExpoPushTokenAsync()).data;
     // Send token to your backend
   }, []);
   ```
3. Configure handlers for foreground/background notifications:
   ```javascript
   Notifications.setNotificationHandler({
     handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true }),
   });
   ```
[2]

### Integrating with FCM (Android)
- Expo's service proxies to FCM automatically using your Firebase project credentials.
- For direct FCM sends (bypassing Expo):
  1. Get native FCM token via `Notifications.getDevicePushTokenAsync()`.
  2. Backend: Use FCM HTTP v1 API with service account JSON (Project ID + Client Email from Firebase console).
  3. Test with Quick Push tool: Prefill project ID/client email, send native payload.
- Example direct payload: Include `priority: high`, custom `data` for deep linking (e.g., `{type: 'chat', id: '123'}`).[3]

### Integrating with APNs (iOS)
- Expo handles APNs via your Apple Developer credentials (upload .p8 key to Expo dashboard).
- For direct APNs sends:
  1. Get native APNs token via `Notifications.getDevicePushTokenAsync()`.
  2. Backend: Use APNs HTTP/2 API with .p8 key + key ID/team ID.
  3. Debug: If Expo succeeds but notification fails, send native APNs payload directly.
- Rich notifications (images): Add Notification Service Extension via `expo-apple-targets`:
  1. `npx expo-apple-targets NotificationService`.
  2. Update Expo SDK server to latest for image support.
  3. Payload: Include `image` URL in notification (iOS long-press reveals).[4][3]

### Best Practices (From 2026 Sources)
- **Token Management**: Store both Expo push tokens and native tokens (FCM/APNs) in your database for flexibility. Track receipts via Expo dashboard for delivery debugging.[2][3]
- **Deep Linking**: Always include custom `data` payload (e.g., `{type: 'chat', id: '123'}`) for navigation:
  ```javascript
  import PushNotification from 'react-native-push-notification';
  PushNotification.configure({
    onNotification: (notification) => {
      if (notification.userInteraction) {
        // Navigate based on data.type/data.id
      }
    },
  });
  ```[1]
- **Debugging Strategy**:
  1. Send via Expo first, check receipts.
  2. If fails, test native FCM/APNs with Quick Push.
  3. Verify tokens match (Expo token ≠ native).[3]
- **Avoid Conflicts**: Don't mix services (e.g., Expo + OneSignal) due to overlapping native implementations.[2]
- **Server-Side**: Use Expo server SDK for Expo tokens; Node.js FCM/APNs libs for direct sends. Update to latest SDK for rich media.[4]

**Next Steps**:
1. Create Expo project: `npx create-expo-app MyApp --template`.
2. Set up Firebase project, upload APNs key to Expo dashboard.
3. Test iOS image notification with Quick Push (expo.dev/quick-push).
4. Deploy backend endpoint to store/retrieve tokens and send via FCM v1 API.

Source: [1] https://devcom.com/tech-blog/react-native-push-notifications/  
Source: [2] https://docs.expo.dev/guides/using-push-notifications-services/  
Source: [3] https://www.youtube.com/watch?v=dB-gkYdTi3o  
Source: [4] https://www.youtube.com/watch?v=ycYM_zKEF_4&vl=en-US
