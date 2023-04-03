const appRequest = require('../../../appRequest');

describe('PUT /links/:id/position', () => {
  let authCookie;
  let authCookieOtherUser;
  let selectedLink;

  beforeAll(async () => {
    const email1 = 'putlinksidposition1@gmail.com';
    const password1 = 'putlinksidposition1';
    const email2 = 'putlinksidposition2@gmail.com';
    const password2 = 'putlinksidposition2';

    await appRequest.post('/auth/signup').send({
      email: email1,
      password: password1,
      name: 'Sklebedew',
      url: 'putlinksidposition1',
    });

    await appRequest.post('/auth/signup').send({
      email: email2,
      password: password2,
      name: 'Skudipap',
      url: 'putlinksidposition2',
    });

    const resLogin = await appRequest
      .post('/auth/login')
      .send({ email: email1, password: password1 });
    authCookie = resLogin.header['set-cookie'][0];

    const resLogin2 = await appRequest
      .post('/auth/login')
      .send({ email: email2, password: password2 });
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

  describe('unauthenticated', () => {
    test('should respond fail', async () => {
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
  });

  describe('unauthorized', () => {
    test("should respond fail update other user's link position", async () => {
      const res = await appRequest
        .put(`/links/${selectedLink.id}/position`)
        .send({ position: 4 })
        .set('cookie', authCookieOtherUser);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: { message: 'link not found' },
      });
    });
  });

  describe('authenticated AND authorized', () => {
    describe('should respond success', () => {
      test('send valid data', async () => {
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
    });

    describe('should respond fail no resource', () => {
      test('send id that is not in database', async () => {
        const fakeId = '6f529592-f3c2-4695-bd57-eff4f9e32393';
        const res = await appRequest
          .put(`/links/${fakeId}/position`)
          .send({
            position: 2,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'link not found' },
        });
      });
    });

    describe('should respond fail not valid position DATATYPE:NUMBER', () => {
      test('send position greater than counted links', async () => {
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

      test('send lesser than 1', async () => {
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

      test('send 2.5', async () => {
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position: 2.5,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });
    });

    describe('should respond fail not a number', () => {
      test('send undefined', async () => {
        const position = undefined;
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });

      test('send null', async () => {
        const position = null;
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });

      test('send "243"', async () => {
        const position = '243';
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });

      test('send true(boolean)', async () => {
        const position = true;
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });

      test('send {}', async () => {
        const position = {};
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });

      test('send []', async () => {
        const position = [];
        const res = await appRequest
          .put(`/links/${selectedLink.id}/position`)
          .send({
            position,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { message: 'oops! failed to change link position' },
        });
      });
    });
  });
});
