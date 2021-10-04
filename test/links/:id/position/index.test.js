const appRequest = require('../../../appRequest');

describe('PUT /links/:id/position', () => {
  let authCookie;
  let authCookieOtherUser;
  let selectedLink;

  beforeAll(async () => {
    const resLogin = await appRequest
      .post('/auth/login')
      .send({ email: 'mcdindonesia@gmail.com', password: 'mcdindonesia' });
    authCookie = resLogin.header['set-cookie'][0];

    const resLogin2 = await appRequest
      .post('/auth/login')
      .send({ email: 'kfcindonesia@gmail.com', password: 'kfcindonesia' });
    authCookieOtherUser = resLogin2.header['set-cookie'][0];

    await appRequest
      .post('/links')
      .send({
        title: 'McD Indonesia',
        href: 'mcdindonesia.com',
      })
      .set('cookie', authCookie);
    await appRequest
      .post('/links')
      .send({
        title: 'Our Instagram',
        href: 'instagram.com/mcd',
      })
      .set('cookie', authCookie);
    await appRequest
      .post('/links')
      .send({
        title: 'Promo McD',
        href: 'https://mcdpromo.com',
      })
      .set('cookie', authCookie);
    await appRequest
      .post('/links')
      .send({
        title: 'Promo McD 2',
        href: 'https://mcdpromo2.com',
      })
      .set('cookie', authCookie);
    const resLink5 = await appRequest
      .post('/links')
      .send({
        title: 'Our Twitter',
        href: 'twitter.com/mcd',
      })
      .set('cookie', authCookie);
    selectedLink = resLink5.body.data;
  });

  test('should respond success', async () => {
    await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 2,
      })
      .set('cookie', authCookie);
    const res = await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 4,
      })
      .set('cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: null,
    });
  });

  test('should respond fail not authenticated (send no auth cookie)', async () => {
    const res = await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 4,
      });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'unauthenticated' },
    });
  });

  test("should respond fail unauthorized (user try update position another user's link)", async () => {
    const res = await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 2,
      })
      .set('cookie', authCookieOtherUser);

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'link not found' },
    });
  });

  test('should respond fail (send position greater that counted links)', async () => {
    const res = await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 6,
      })
      .set('cookie', authCookie);

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'oops! failed to change link position' },
    });
  });

  test('should respond fail (send position lesser than 1)', async () => {
    const res = await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 0,
      })
      .set('cookie', authCookie);

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'oops! failed to change link position' },
    });
  });

  test('should respond fail (send position not a number)', async () => {
    const res = await appRequest
      .put(`/links/${selectedLink.id}/position`)
      .send({
        position: 'aaa',
      })
      .set('cookie', authCookie);

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'oops! failed to change link position' },
    });
  });
});
