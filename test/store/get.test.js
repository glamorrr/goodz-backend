const appRequest = require('../appRequest');

describe('GET /store', () => {
  let authCookie;

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email: 'getstore@gmail.com',
      password: 'getstore123',
      name: 'getstore',
      url: 'getstore123',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email: 'getstore@gmail.com', password: 'getstore123' });
    authCookie = resLogin1.header['set-cookie'][0];
  });

  test('should respond success', async () => {
    const res = await appRequest.get('/store').set('cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: {
        id: expect.any(String),
        url: 'getstore123',
        name: 'getstore',
        isCredit: false,
        description: null,
        location: null,
        currencyCode: 'ID',
        background: null,
        image: null,
      },
    });
  });
});
