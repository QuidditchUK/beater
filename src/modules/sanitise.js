export const sanitiseEmailMiddleware = (req, res, next) => {
  req.body.email = req.body.email.toLowerCase();
  next();
};
