const randomstring = require('randomstring');
const appRequest = require('../appRequest');

describe('POST /links', () => {
  describe('ALL PROPERTIES', () => {
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

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
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
    });

    describe('authenticated', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
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
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .post('/links')
            .send({})
            .set('cookie', authCookie);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.data).toHaveProperty('title');
          expect(res.body.data).toHaveProperty('href');
        });

        test('send []', async () => {
          const res = await appRequest
            .post('/links')
            .send([])
            .set('cookie', authCookie);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.data).toHaveProperty('title');
          expect(res.body.data).toHaveProperty('href');
        });
      });
    });
  });

  describe('title PROPERTY', () => {
    let authCookie;
    const href = 'google.com';

    beforeAll(async () => {
      const email = 'addlinktitle@gmail.com';
      const password = 'addlinktitle';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Test Add Link Title',
        url: 'addlinktitle',
      });

      const resLogin = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin.header['set-cookie'][0];
    });

    describe('should respond success', () => {
      test('send 3 chars', async () => {
        const title = randomstring.generate(3);
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send 50 chars', async () => {
        const title = randomstring.generate(50);
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send string wrapped with spaces, return trimmed string', async () => {
        const title = ' ' + randomstring.generate(32) + '   ';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title: title.trim(),
            href,
            position: 1,
            isVisible: true,
          },
        });
      });
    });

    describe('should respond fail characters not valid', () => {
      test('send 2 chars too short', async () => {
        const title = ' ' + randomstring.generate(2) + ' ';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });

      test('send 51 chars too long', async () => {
        const title = randomstring.generate(51);
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      test('send undefined', async () => {
        const title = undefined;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });

      test('send null', async () => {
        const title = null;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });

      test('send 243(number)', async () => {
        const title = 243;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });

      test('send true(boolean)', async () => {
        const title = true;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });

      test('send {}', async () => {
        const title = {};
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });

      test('send []', async () => {
        const title = [];
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            title: 'title must be 3 to 50 characters',
          },
        });
      });
    });
  });

  describe('href PROPERTY', () => {
    let authCookie;
    const title = 'Our Website';

    beforeAll(async () => {
      const email = 'addlinkhref@gmail.com';
      const password = 'addlinkhref';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Test Add Link HREF',
        url: 'addlinkhref',
      });

      const resLogin = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin.header['set-cookie'][0];
    });

    describe('should respond success', () => {
      test('send a.com', async () => {
        const href = 'a.com';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send https://google.com', async () => {
        const href = 'https://google.com';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send http://google.com', async () => {
        const href = 'http://google.com';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send google.com', async () => {
        const href = 'google.com';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send long url', async () => {
        const href =
          'http://llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch.co.uk/asdasd22-222Daadsdasd-aa/aaad/adsbaa/SUPERLONG_URL';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href,
            position: 1,
            isVisible: true,
          },
        });
      });

      test('send string wrapped with spaces, return trimmed string ', async () => {
        const href = '  https://google.com   ';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            title,
            href: href.trim(),
            position: 1,
            isVisible: true,
          },
        });
      });
    });

    describe('should respond fail href(url) not valid', () => {
      test('send google', async () => {
        const href = 'google';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send a.c', async () => {
        const href = 'a.c';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send http//google.com', async () => {
        const href = 'http//google.com';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send http://google.com.', async () => {
        const href = 'http://google.com.';
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      test('send undefined', async () => {
        const href = undefined;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send null', async () => {
        const href = null;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send 333(number)', async () => {
        const href = 333;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send true(boolean)', async () => {
        const href = true;
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send {}', async () => {
        const href = {};
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });

      test('send []', async () => {
        const href = [];
        const res = await appRequest
          .post('/links')
          .send({
            title,
            href,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            href: 'url must be a valid url',
          },
        });
      });
    });
  });
});
