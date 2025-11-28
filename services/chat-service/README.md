# Chat Service

Real-time messaging service з підтримкою **Pusher Channels** (real-time) та **Pusher Beams** (push notifications).

## 🚀 Особливості

- ✅ **Real-time чат** через Pusher Channels
- ✅ **Push notifications** через Pusher Beams (iOS, Android, Web)
- ✅ Direct, Group, Project, Team чати
- ✅ Реакції на повідомлення
- ✅ Read receipts
- ✅ Редагування/видалення повідомлень
- ✅ Відповіді на повідомлення (threads)

## 📡 Frontend Integration

### 1. Pusher Channels (Real-time)

```bash
npm install pusher-js
```

```javascript
import Pusher from 'pusher-js';

// Initialize Pusher
const pusher = new Pusher('0eb83f71501d6d8b8ae7', {
  cluster: 'eu',
  authEndpoint: 'https://your-service.vercel.app/api/pusher/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${userToken}`,
      'x-service-api-key': 'your-service-api-key',
    },
  },
});

// Subscribe to chat
const chatId = 123;
const channel = pusher.subscribe(`private-chat-${chatId}`);

// Listen for new messages
channel.bind('new-message', (data) => {
  console.log('New message:', data.message);
  // Update UI with new message
});

// Listen for message updates
channel.bind('message-updated', (data) => {
  console.log('Message updated:', data.message);
});

// Listen for message deleted
channel.bind('message-deleted', (data) => {
  console.log('Message deleted:', data.messageId);
});

// Listen for reactions
channel.bind('message-reaction', (data) => {
  console.log('Reaction:', data.emoji, data.action);
});

// Listen for user joined
channel.bind('user-joined', (data) => {
  console.log('User joined:', data.userId);
});

// Listen for user left
channel.bind('user-left', (data) => {
  console.log('User left:', data.userId);
});
```

### 2. Pusher Beams (Push Notifications)

#### Web (Service Worker)

**1. Створіть `public/service-worker.js`:**
```javascript
importScripts('https://js.pusher.com/beams/service-worker.js');
```

**2. Зареєструйте Service Worker:**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.error('SW error', err));
}
```

**3. Initialize Beams:**
```html
<script src="https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js"></script>
```

```javascript
const beamsClient = new PusherPushNotifications.Client({
  instanceId: '5212e6b6-23a0-4cf1-8796-4a104791d33a',
});

// Start Beams
beamsClient.start()
  .then(() => beamsClient.addDeviceInterest('user-123'))
  .then(() => console.log('Beams started'))
  .catch(console.error);

// For authenticated users
beamsClient.start()
  .then(() => beamsClient.setUserId('user-123', {
    fetchToken: async (userId) => {
      const response = await fetch('/api/beams/auth', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    },
  }))
  .then(() => console.log('User authenticated for push'))
  .catch(console.error);
```

#### React Native / Mobile

```bash
npm install @pusher/push-notifications-react-native
```

```javascript
import { PushNotifications } from '@pusher/push-notifications-react-native';

const pn = new PushNotifications({
  instanceId: '5212e6b6-23a0-4cf1-8796-4a104791d33a',
});

// Start and subscribe
pn.start();
pn.addDeviceInterest('user-123');

// Listen for notifications
pn.on('notification', (notification) => {
  console.log('Received notification:', notification);
});
```

## 🔧 Налаштування

### 1. Створіть Pusher акаунт

**Pusher Channels:**
1. Зареєструйтесь на [pusher.com](https://pusher.com)
2. Створіть Channels app
3. Виберіть cluster (eu рекомендовано)
4. Отримайте credentials

**Pusher Beams:**
1. У тому ж акаунті створіть Beams instance
2. Налаштуйте platforms (Web, iOS, Android)
3. Отримайте Instance ID та Secret Key

### 2. Environment Variables

```env
# Pusher Channels
PUSHER_APP_ID=2084509
PUSHER_KEY=0eb83f71501d6d8b8ae7
PUSHER_SECRET=1b8b5305e79fc761e360
PUSHER_CLUSTER=eu

# Pusher Beams
BEAMS_INSTANCE_ID=5212e6b6-23a0-4cf1-8796-4a104791d33a
BEAMS_SECRET_KEY=BEB9BE7732FE9E83962FBEC78B65FCA970C23494AB6C80F9226453CDA099DE43
```

### 3. Free Tier Limits

**Pusher Channels (Sandbox):**
- 200k messages/day
- 100 concurrent connections
- Unlimited channels

**Pusher Beams (Free):**
- 1,000 devices
- Unlimited notifications

## 📱 Приклад використання

### Надіслати повідомлення

```javascript
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-service-api-key': 'your-key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatId: 123,
    content: 'Hello!',
    messageType: 'text',
  }),
});

// Автоматично:
// 1. Повідомлення збережеться в БД
// 2. Real-time подія відправиться через Pusher Channels
// 3. Push notification відправиться офлайн користувачам через Beams
```

### Отримати повідомлення

```javascript
const response = await fetch('/api/messages/chat/123?limit=50&before=456', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-service-api-key': 'your-key',
  },
});
```

## 🔐 Security

- ✅ JWT автентифікація
- ✅ Перевірка членства в чаті
- ✅ Private Pusher channels
- ✅ Secure Beams user authentication
- ✅ Service-to-service API key

## 📚 API Endpoints

Дивіться повну документацію в основному README або `/api` endpoint сервісу.
