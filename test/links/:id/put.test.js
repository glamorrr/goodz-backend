const appRequest = require('../../appRequest');

describe('PUT /links/:id', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie1;
    let authCookie2;
    let user1Link;

    beforeAll(async () => {
      const email1 = 'putlinkall@gmail.com';
      const password1 = 'putlinkall1';
      const email2 = 'putlinkall2@gmail.com';
      const password2 = 'putlinkall2';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put Link All 1',
        url: 'putlinkall1',
      });
      await appRequest.post('/auth/signup').send({
        email: email2,
        password: password2,
        name: 'Put Link All 2',
        url: 'putlinkall2',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
      const resLogin2 = await appRequest
        .post('/auth/login')
        .send({ email: email2, password: password2 });
      authCookie2 = resLogin2.header['set-cookie'][0];

      const resLink1 = await appRequest
        .post('/links')
        .send({
          title: 'Link 1',
          href: 'link1.com',
        })
        .set('cookie', authCookie1);

      user1Link = resLink1.body.data;
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.put(`/links/${user1Link.id}`).send({
          title: 'update Link 1',
          href: 'link1.com',
          isVisible: true,
        });

        expect(res.status).toBe(401);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'unauthenticated',
          },
        });
      });
    });

    describe('unauthorized', () => {
      test("should respond fail update another user's link", async () => {
        const res = await appRequest
          .put(`/links/${user1Link.id}`)
          .send({
            title: 'update Link 1',
            href: 'tryupdatelink1.com',
            isVisible: false,
          })
          .set('cookie', authCookie2);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'link not found',
          },
        });
      });
    });

    describe('authenticated AND authorized', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
          const res = await appRequest
            .put(`/links/${user1Link.id}`)
            .send({
              title: 'UPDATE THIS LINK BOYS',
              href: 'successbooyss.com',
              isVisible: false,
            })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              id: expect.any(String),
              title: 'UPDATE THIS LINK BOYS',
              href: 'successbooyss.com',
              isVisible: false,
            },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .put(`/links/${user1Link.id}`)
            .send({})
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: { message: 'link not updated' },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .put(`/links/${user1Link.id}`)
            .send([])
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: { message: 'link not updated' },
          });
        });
      });
    });
  });

  describe('isVisible PROPERTY', () => {
    let authCookie;
    let selectedLink;
    const title = 'Super Cool Title';
    const href = 'supercoolsite.com';

    beforeAll(async () => {
      const email = 'putlinkidisvisible@gmail.com';
      const password = 'putlinkidisvisible';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Super Duper Is Visible',
        url: 'putlinkidisvisible',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];

      const resItem = await appRequest
        .post('/links')
        .send({
          title,
          href,
        })
        .set('cookie', authCookie);

      selectedLink = resItem.body.data;
    });

    describe('should respond success DATATYPE:BOOLEAN', () => {
      test('send true', async () => {
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible: true,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            isVisible: true,
          },
        });
      });

      test('send false', async () => {
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible: false,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            isVisible: false,
          },
        });
      });
    });

    describe('should respond fail not boolean', () => {
      test('send undefined', async () => {
        const isVisible = undefined;
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'link not updated',
          },
        });
      });

      test('send null', async () => {
        const isVisible = null;
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isVisible: 'isVisible must be boolean',
          },
        });
      });

      test('send "333"', async () => {
        const isVisible = '333';
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isVisible: 'isVisible must be boolean',
          },
        });
      });

      test('send 333', async () => {
        const isVisible = 333;
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isVisible: 'isVisible must be boolean',
          },
        });
      });

      test('send {}', async () => {
        const isVisible = {};
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isVisible: 'isVisible must be boolean',
          },
        });
      });

      test('send []', async () => {
        const isVisible = {};
        const res = await appRequest
          .put(`/links/${selectedLink.id}`)
          .send({
            isVisible,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isVisible: 'isVisible must be boolean',
          },
        });
      });
    });
  });
});
