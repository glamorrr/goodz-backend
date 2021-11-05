const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  path: '/',
  sameSite: ['production', 'test'].includes(process.env.NODE_ENV)
    ? 'lax'
    : 'none',
};

module.exports = COOKIE_OPTIONS;
