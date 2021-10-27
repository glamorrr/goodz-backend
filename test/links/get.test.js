const appRequest = require('../appRequest');

describe('GET /catalog', () => {
  let authCookie;

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email: 'getlinks@gmail.com',
      password: 'getlinks234',
      name: 'Get getlinks',
      url: 'getlinks',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email: 'getlinks@gmail.com', password: 'getlinks234' });
    authCookie = resLogin1.header['set-cookie'][0];
  });

  test('should respond success return [] (no links)', async () => {
    const res = await appRequest.get('/links').set('cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: [],
    });
  });
});
