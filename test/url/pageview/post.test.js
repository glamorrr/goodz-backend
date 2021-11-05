const appRequest = require('../../appRequest');

describe('POST /url/:url/pageview', () => {
  const desktopUserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36';
  const mobileUserAgent =
    'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';
  const botUserAgent =
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  let authCookie;
  let lastVisitCookie;

  beforeAll(async () => {
    const email = 'posturlpageview@gmail.com';
    const password = 'posturlpageview';

    await appRequest.post('/auth/signup').send({
      email,
      password,
      name: 'posturlpageview 1',
      url: 'posturlpageview',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email, password });
    authCookie = resLogin1.header['set-cookie'][0];

    const resLastVisit = await appRequest
      .post('/url/posturlpageview/pageview')
      .set('user-agent', desktopUserAgent);
    lastVisitCookie = resLastVisit.header['set-cookie'][0];
  });

  test('should count desktop user agent', async () => {
    const res = await appRequest
      .post('/url/posturlpageview/pageview')
      .set('user-agent', desktopUserAgent);

    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: {
        isMobile: false,
      },
    });
    expect(res.header['set-cookie'][0]).toContain('last_visit');
    expect(res.header['set-cookie'][0]).toContain('HttpOnly');
    expect(res.header['set-cookie'][0]).toContain('Max-Age=300');
    expect(res.header['set-cookie'][0]).toContain('Secure');
    expect(res.header['set-cookie'][0]).toContain('SameSite=Lax');
  });

  test('should count mobile user agent', async () => {
    const res = await appRequest
      .post('/url/posturlpageview/pageview')
      .set('user-agent', mobileUserAgent);

    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: {
        isMobile: true,
      },
    });
    expect(res.header['set-cookie'][0]).toContain('last_visit');
    expect(res.header['set-cookie'][0]).toContain('HttpOnly');
    expect(res.header['set-cookie'][0]).toContain('Max-Age=300');
    expect(res.header['set-cookie'][0]).toContain('Secure');
    expect(res.header['set-cookie'][0]).toContain('SameSite=Lax');
  });

  test('should not count bot', async () => {
    const res = await appRequest
      .post('/url/posturlpageview/pageview')
      .set('user-agent', botUserAgent);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
  });

  test('should not count spam visit', async () => {
    const res = await appRequest
      .post('/url/posturlpageview/pageview')
      .set('user-agent', desktopUserAgent)
      .set('cookie', lastVisitCookie);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
  });

  test('should not count user owned page', async () => {
    const res = await appRequest
      .post('/url/posturlpageview/pageview')
      .set('user-agent', desktopUserAgent)
      .set('cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
  });

  test('should not count invalid user agent', async () => {
    const res = await appRequest.post('/url/posturlpageview/pageview');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
  });

  test('should respond 404', async () => {
    const res = await appRequest
      .post('/url/randoms2hie0928/pageview')
      .set('user-agent', desktopUserAgent);

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'url not found' },
    });
  });
});
