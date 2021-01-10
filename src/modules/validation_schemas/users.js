import * as Yup from 'yup';

export const schema = Yup.object({
  email: Yup.string().email('Invalid email address').required(),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required(),
}).noUnknown(true);

export const resetSchema = Yup.object({
  password: Yup.string().min(8, 'Password must be at least 8 characters').required(),
}).noUnknown(true);

export const updateSchema = Yup.object({
  old_password: Yup.string().min(8, 'Password must be at least 8 characters').required(),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required(),
});
