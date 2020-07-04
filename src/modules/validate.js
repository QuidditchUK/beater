export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body);
    return next();
  } catch (error) {
    return res.status(400).json({ error });
  }
};
