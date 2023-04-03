const randomstring = require('randomstring');
const appRequest = require('../../appRequest');

describe('PUT /header/:id', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie1;
    let authCookie2;
    let user1Header;

    beforeAll(async () => {
      const email1 = 'putheaderidall1@gmail.com';
      const password1 = 'putheaderidall1';
      const email2 = 'putheaderidall2@gmail.com';
      const password2 = 'putheaderidall2';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put Header Id All 1',
        url: 'putheaderidall1',
      });
      await appRequest.post('/auth/signup').send({
        email: email2,
        password: password2,
        name: 'Put Header Id All 2',
        url: 'putheaderidall2',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
      const resLogin2 = await appRequest
        .post('/auth/login')
        .send({ email: email2, password: password2 });
      authCookie2 = resLogin2.header['set-cookie'][0];

      const resHeader1 = await appRequest
        .post('/header')
        .send({
          title: randomstring.generate(10),
        })
        .set('cookie', authCookie1);

      user1Header = resHeader1.body.data.header;
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.put(`/header/${user1Header.id}`).send({
          title: randomstring.generate(3),
          isVisible: false,
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
      test("should respond fail update another user's header", async () => {
        const res = await appRequest
          .put(`/header/${user1Header.id}`)
          .send({
            title: randomstring.generate(3),
            isVisible: false,
          })
          .set('cookie', authCookie2);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'header not found',
          },
        });
      });
    });

    describe('authenticated AND authorized', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
          const title = 'Valid Header!';
          const res = await appRequest
            .put(`/header/${user1Header.id}`)
            .send({ title })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              id: expect.any(String),
              title,
              isVisible: true,
            },
          });
        });
      });

      describe('should respond fail no resource', () => {
        test('send id that is not in database', async () => {
          const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
          const res = await appRequest
            .put(`/header/${fakeId}`)
            .send({
              title: 'Update Products',
              isVisible: true,
            })
            .set('cookie', authCookie1);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'header not found',
            },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .put(`/header/${user1Header.id}`)
            .send({})
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'header not updated',
            },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .put(`/header/${user1Header.id}`)
            .send([])
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'header not updated',
            },
          });
        });
      });
    });
  });

  describe('isVisible PROPERTY', () => {
    let authCookie;
    let selectedHeader;

    beforeAll(async () => {
      const email = 'puteheaderidisvisible@gmail.com';
      const password = 'putheaderidisvis';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'pPut HEaderidisvis',
        url: 'putheaderidisvis',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];

      const title = 'Top Sales';
      const resHeader = await appRequest
        .post('/header')
        .send({
          title,
        })
        .set('cookie', authCookie);

      selectedHeader = resHeader.body.data.header;
    });

    describe('should respond success DATATYPE:BOOLEAN', () => {
      test('send true', async () => {
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: true,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: selectedHeader.id,
            title: selectedHeader.title,
            isVisible: true,
          },
        });
      });

      test('send false', async () => {
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: false,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: selectedHeader.id,
            title: selectedHeader.title,
            isVisible: false,
          },
        });
      });
    });

    describe('should respond fail not boolean', () => {
      test('send undefined', async () => {
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: undefined,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'header not updated',
          },
        });
      });

      test('send null', async () => {
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: null,
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

      test('send 69', async () => {
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: 69,
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

      test('send "69"', async () => {
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: '69',
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
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: {},
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
        const res = await appRequest
          .put(`/header/${selectedHeader.id}`)
          .send({
            isVisible: [],
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
