const appRequest = require('../appRequest');

describe('GET /catalog', () => {
  let authCookie;

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email: 'getcatalog1@gmail.com',
      password: 'getcatalog1',
      name: 'Get Catalog',
      url: 'getcatalog',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email: 'getcatalog1@gmail.com', password: 'getcatalog1' });
    authCookie = resLogin1.header['set-cookie'][0];
  });

  test('should respond success return data (empty array) (no catalog)', async () => {
    const res = await appRequest.get('/catalog').set('cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      data: [],
    });
  });
});
