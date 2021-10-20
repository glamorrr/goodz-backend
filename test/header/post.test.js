const randomstring = require('randomstring');
const appRequest = require('../appRequest');

describe('POST /header', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie;

    beforeAll(async () => {
      const email = 'addheader@gmail.com';
      const password = 'addheader';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Add Header',
        url: 'addheader',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.post('/header').send({
          title: 'This is Header',
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

    describe('authenticated', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
          const title = 'This is Header';
          const res = await appRequest
            .post('/header')
            .send({ title })
            .set('cookie', authCookie);

          expect(res.status).toBe(201);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              id: expect.any(String),
              position: 1,
              header: {
                id: expect.any(String),
                title,
                isVisible: true,
              },
            },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .post('/header')
            .send({})
            .set('cookie', authCookie);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              title: 'title must be 3 to 25 characters',
            },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .post('/header')
            .send([])
            .set('cookie', authCookie);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              title: 'title must be 3 to 25 characters',
            },
          });
        });
      });
    });
  });

  describe('title PROPERTY', () => {
    let authCookie;

    beforeAll(async () => {
      await appRequest.post('/auth/signup').send({
        email: 'addheadertitle@gmail.com',
        password: 'addheadertitle',
        name: 'Add Header Title',
        url: 'addheadertitle',
      });

      const resLogin1 = await appRequest.post('/auth/login').send({
        email: 'addheadertitle@gmail.com',
        password: 'addheadertitle',
      });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('should respond success', () => {
      test('send 3 chars', async () => {
        const title = randomstring.generate(3);
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            header: {
              id: expect.any(String),
              title,
              isVisible: true,
            },
          },
        });
      });

      test('send 25 chars', async () => {
        const title = randomstring.generate(25);
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            header: {
              id: expect.any(String),
              title,
              isVisible: true,
            },
          },
        });
      });

      test('send string wrapped with spaces, return trimmed string', async () => {
        const title = '      ' + randomstring.generate(20) + '      ';
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            header: {
              id: expect.any(String),
              title: title.trim(),
              isVisible: true,
            },
          },
        });
      });
    });

    describe('should respond fail characters not valid`', () => {
      test('send 2 chars too short', async () => {
        const title = randomstring.generate(2);
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });

      test('send 26 chars too long', async () => {
        const title = randomstring.generate(26);
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      test('send undefined', async () => {
        const title = undefined;
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });

      test('send null', async () => {
        const title = null;
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });

      test('send 34(number)', async () => {
        const title = 34;
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });

      test('send true(boolean)', async () => {
        const title = true;
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });

      test('send {}', async () => {
        const title = {};
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });

      test('send []', async () => {
        const title = [];
        const res = await appRequest
          .post('/header')
          .send({ title })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 25 characters',
          },
        });
      });
    });
  });
});
