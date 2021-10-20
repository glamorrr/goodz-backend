const appRequest = require('../../appRequest');

describe('POST /logout', () => {
  test('should logout successfully', async () => {
    const res = await appRequest.post('/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
    expect(res.header['set-cookie'][0]).toContain('token');
    expect(res.header['set-cookie'][0]).toContain('Max-Age=1');
  });
});
