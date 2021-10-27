const appRequest = require('../appRequest');

describe('GET /catalog', () => {
  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email: 'geturl123@gmail.com',
      password: 'geturl123',
      name: 'geturl123',
      url: 'geturltest123',
    });
  });

  test('should respond success', async () => {
    const res = await appRequest.get('/url/geturltest123');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: {
        id: expect.any(String),
        url: 'geturltest123',
        name: 'geturl123',
        isCredit: false,
        description: null,
        location: null,
        currencyCode: 'ID',
        background: null,
        image: null,
        links: [],
        catalog: [],
      },
    });
  });
});
