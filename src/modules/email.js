import * as postmark from 'postmark';

import settings from '../config';

const client = new postmark.ServerClient(settings.postmark.token);

export const email = (To, template, data, From = settings.postmark.from, CC = null) => {
  // no-op when developing
  if (process.env.NODE_ENV !== 'production') {
    return {};
  }

  return client.sendEmailWithTemplate({
    TemplateId: settings.postmark.templates[template],
    TemplateModel: data,
    From,
    To,
    CC,
  });
};
