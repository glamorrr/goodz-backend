const appRequest = require('../../appRequest');

describe('POST /links', () => {
  let authCookie;

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email: 'addlink@gmail.com',
      password: 'addlink78',
      name: 'Test Add Link',
      url: 'adl',
    });

    const resLogin = await appRequest
      .post('/auth/login')
      .send({ email: 'addlink@gmail.com', password: 'addlink78' });
    authCookie = resLogin.header['set-cookie'][0];
  });

  test('should respond success add first link', async () => {
    const res = await appRequest
      .post('/links')
      .send({
        title: 'Random STuff',
        href: 'randomstuff.com',
      })
      .set('cookie', authCookie);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        title: 'Random STuff',
        href: 'randomstuff.com',
        position: 1,
      },
    });
  });

  test('should respond fail not authenticated', async () => {
    const res = await appRequest.post('/links').send({
      title: 'Random STuff',
      href: 'randomstuff.com',
    });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'unauthenticated' },
    });
  });

  test('should respond success added link (2 times)', async () => {
    await appRequest
      .post('/links')
      .send({
        title: 'Random STuff',
        href: 'randomstuff.com',
      })
      .set('cookie', authCookie);
    const res = await appRequest
      .post('/links')
      .send({
        title: 'Third',
        href: 'https://thirdone.com',
      })
      .set('cookie', authCookie);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        title: 'Third',
        href: 'https://thirdone.com',
        position: 3,
      },
    });
  });

  test('should respond fail (send empty object)', async () => {
    const res = await appRequest
      .post('/links')
      .send({})
      .set('cookie', authCookie);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('href');
  });
});
