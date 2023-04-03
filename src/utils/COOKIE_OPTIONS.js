const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  path: '/',
  sameSite: ['production', 'test'].includes(process.env.NODE_ENV)
    ? 'none'
    : 'none',
};

module.exports = COOKIE_OPTIONS;
