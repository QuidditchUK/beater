-- Insert
INSERT INTO notification_types (type, description) VALUES
  ('TRANSFERS_OPEN', 'The transfer window has opened'),
  ('TRANSFERS_CLOSED', 'The transfer window has closed'),
  ('TRANSFER_APPROVED', 'Your transfer has been approved' ),
  ('TRANSFER_DECLINED', 'Your transfer has been declined' ),
  ('SCOUTING_WINDOW_OPEN', 'Scouting requests are now open' ),
  ('SCOUTING_WINDOW_CLOSING_24', 'Scouting requests are closing in 24 hours' ),
  ('SCOUTING_WINDOW_CLOSED', 'Scouting requests are now closed' ),
  ('EVENT_REGISTRATION_OPEN', 'Event registration is now open' ),
  ('EVENT_REGISTRATION_CLOSING_24', 'Event registration is closing in 24 hours' ),
  ('EVENT_REGISTRATION_CLOSED', 'Event registration is now closed' );