const appRequest = require('../../appRequest');

describe('POST /auth/login', () => {
  const email = 'postlogin@gmail.com';
  const password = 'postlogin123';

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email,
      password,
      name: 'Post Login',
      url: 'postlogin',
    });
  });

  test('should respond logged in and send cookies httpOnly sameSite=Lax secure=true maxAge=3600', async () => {
    const res = await appRequest.post('/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
    expect(res.header['set-cookie'][0]).toContain('token');
    expect(res.header['set-cookie'][0]).toContain('HttpOnly');
    expect(res.header['set-cookie'][0]).toContain('Max-Age=3600');
    expect(res.header['set-cookie'][0]).toContain('Secure');
    expect(res.header['set-cookie'][0]).toContain('SameSite=Lax');
  });

  test('should respond invalid (wrong password)', async () => {
    const res = await appRequest
      .post('/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'invalid email and password' },
    });
  });

  test('should respond invalid (no email in database)', async () => {
    const res = await appRequest
      .post('/auth/login')
      .send({ email: 'randomz90192498@gmail.com', password });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'invalid email and password' },
    });
  });

  test('should respond invalid (send email: null, password: null)', async () => {
    const res = await appRequest
      .post('/auth/login')
      .send({ email: null, password: null });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'invalid email and password' },
    });
  });
});
