import * as postmark from 'postmark';

import settings from '../config';

const client = new postmark.ServerClient(settings.postmark.token);

export const email = (To, template, data, From = settings.postmark.from) => {
  // no-op when developing
  if (process.env.NODE_ENV === 'development') {
    return {};
  }

  return client.sendEmailWithTemplate({
    TemplateId: settings.postmark.templates[template],
    TemplateModel: data,
    From,
    To,
  });
};
