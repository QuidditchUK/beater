export const TRANSFERS_OPEN = 'TRANSFERS_OPEN';
export const TRANSFERS_CLOSED = 'TRANSFERS_CLOSED';
export const TRANSFER_APPROVED = 'TRANSFER_APPROVED';
export const TRANSFER_DECLINED = 'TRANSFER_DECLINED';
export const SCOUTING_WINDOW_OPEN = 'SCOUTING_WINDOW_OPEN';
export const SCOUTING_WINDOW_CLOSING_24 = 'SCOUTING_WINDOW_CLOSING_24';
export const SCOUTING_WINDOW_CLOSED = 'SCOUTING_WINDOW_CLOSED';
export const EVENT_REGISTRATION_OPEN = 'EVENT_REGISTRATION_OPEN';
export const EVENT_REGISTRATION_CLOSING_24 = 'EVENT_REGISTRATION_CLOSING_24';
export const EVENT_REGISTRATION_CLOSED = 'EVENT_REGISTRATION_CLOSED';

export const PUSH_PAYLOADS = {
  [TRANSFER_APPROVED]: {
    title: 'Your transfer has been approved',
    body: 'Your club transfer has been approved, you are now registered with your new club',
  },
  PUSH_NOTIFICATION_ENABLED: {
    title: 'Push Notifications enabled',
    body: 'You will now recieve push notifications from QuidditchUK on this device',
  },
};
