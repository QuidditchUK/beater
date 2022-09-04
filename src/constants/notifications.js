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
export const CLUB_MANAGEMENT = 'CLUB_MANAGEMENT';

export const NOTIFICATION_PAYLOADS = {
  [CLUB_MANAGEMENT]: ({ club_name }) => `You are now the manager of ${club_name}`,
  [TRANSFER_APPROVED]: ({ club_name }) => `Your transfer to ${club_name} has been approved`,
  [TRANSFER_DECLINED]: ({ club_name }) => `Your transfer to ${club_name} has been declined`,
};

export const PUSH_PAYLOADS = {
  [TRANSFER_APPROVED]: ({ club_name }) => ({
    title: 'Your transfer has been approved',
    body: `Transfer to ${club_name} has been approved`,
  }),
  [TRANSFER_DECLINED]: ({ club_name }) => ({
    title: 'Your transfer has been declined',
    body: `Transfer to ${club_name} has been declined`,
  }),
  [TRANSFERS_OPEN]: {
    title: 'Transfers Open',
    body: 'The transfer window has opened, click to transfer clubs',
    actions: [{ action: TRANSFERS_OPEN, title: 'Transfer' }],
  },
  [TRANSFERS_CLOSED]: {
    title: 'Transfers Closed',
    body: 'The transfer window has now closed.',
  },
  PUSH_NOTIFICATION_ENABLED: {
    title: 'Push Notifications enabled',
    body: 'You will now recieve push notifications from QuidditchUK on this device',
  },
  [CLUB_MANAGEMENT]: ({ club_name }) => ({
    title: 'You are now the club manager',
    body: `${club_name} is now managed by you on QuidditchUK`,
    actions: [{ action: CLUB_MANAGEMENT, title: 'Manage Club' }],
  }),
  NEWS: ({
    title, body, image, data,
  }) => ({
    title,
    body,
    image,
    data,
  }),
};
