const appRequest = require('../../appRequest');
const randomstring = require('randomstring');

describe('POST /auth/signup', () => {
  describe('ALL PROPERTIES', () => {
    test('should respond success send valid data', async () => {
      const email = `${randomstring.generate(10)}@gmail.com`;
      const name = randomstring.generate(10);
      const url = randomstring.generate(10);
      const password = randomstring.generate(10);
      const res = await appRequest.post('/auth/signup').send({
        email,
        name,
        url,
        password,
      });

      expect(res.status).toBe(201);
      expect(res.body).toStrictEqual({
        status: 'success',
        data: {
          id: expect.any(String),
          name: name,
          url: url.toLowerCase(),
          user: { email: email.toLowerCase() },
        },
      });
    });

    test('should respond fail send {}', async () => {
      const res = await appRequest.post('/auth/signup').send({});

      expect(res.status).toBe(400);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          email: 'email must be a valid email address',
          password: 'password must be 8 to 30 characters',
        },
      });
    });

    test('should respond fail send []', async () => {
      const res = await appRequest.post('/auth/signup').send([]);

      expect(res.status).toBe(400);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          email: 'email must be a valid email address',
          password: 'password must be 8 to 30 characters',
        },
      });
    });
  });

  describe('email PROPERTY', () => {
    const name = randomstring.generate(10);
    const password = randomstring.generate(10);

    describe('should respond success', () => {
      test('send 10 chars email', async () => {
        const email = 'm@gmail.co';
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email },
          },
        });
      });

      test('send 50 chars email', async () => {
        const email = `${randomstring.generate({
          length: 40,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email },
          },
        });
      });

      test('send email wrapped with spaces, return trimmed email', async () => {
        const email = `   jumbiiii@gmail.com   `;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email: email.trim() },
          },
        });
      });

      test('send email wrapped with uppercase, return all lowercase', async () => {
        const email = `${randomstring.generate(12)}@GmAil.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email: email.toLowerCase() },
          },
        });
      });
    });

    describe('should respond fail not valid email', () => {
      test('send "johngmail.com"', async () => {
        const email = 'johngmail.com';
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest
          .post('/auth/signup')
          .send({ email, password, name, url });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: 'email must be a valid email address',
          },
        });
      });

      test('send 9 chars email', async () => {
        const email = `9@mail.co`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: 'email must be 10 to 50 characters',
          },
        });
      });

      test('send 51 chars email', async () => {
        const email = `${randomstring.generate({
          length: 41,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: 'email must be 10 to 50 characters',
          },
        });
      });

      test('send a taken email', async () => {
        const email = `takenemail@gmail.com`;

        await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: 'email has already been taken',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      test('send undefined', async () => {
        const email = undefined;

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: expect.any(String),
          },
        });
      });

      test('send null', async () => {
        const email = null;

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: expect.any(String),
          },
        });
      });

      test('send 222', async () => {
        const email = 222;

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: expect.any(String),
          },
        });
      });

      test('send true(boolean)', async () => {
        const email = true;

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: expect.any(String),
          },
        });
      });

      test('send {}', async () => {
        const email = {};

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: expect.any(String),
          },
        });
      });

      test('send []', async () => {
        const email = [];

        const res = await appRequest.post('/auth/signup').send({
          email,
          password,
          name,
          url: randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          }),
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            email: expect.any(String),
          },
        });
      });
    });
  });

  describe('password PROPERTY', () => {
    const name = randomstring.generate(10);

    describe('should respond success', () => {
      test('send 8 chars', async () => {
        const password = randomstring.generate(8);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email },
          },
        });
      });

      test('send 30 chars', async () => {
        const password = randomstring.generate(30);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email },
          },
        });
      });
    });

    describe('should respond fail not valid password', () => {
      test('send 7 chars', async () => {
        const password = randomstring.generate(7);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });

      test('send 31 chars', async () => {
        const password = randomstring.generate(31);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });
    });

    describe('should respond fail not a string', () => {
      test('send undefined', async () => {
        const password = undefined;

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });

      test('send null', async () => {
        const password = null;

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });

      test('send 283', async () => {
        const password = 283;

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });

      test('send true(boolean)', async () => {
        const password = true;

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });

      test('send {}', async () => {
        const password = {};

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });

      test('send []', async () => {
        const password = [];

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            password: 'password must be 8 to 30 characters',
          },
        });
      });
    });
  });

  describe('name PROPERTY', () => {
    const password = randomstring.generate(10);

    describe('should respond success', () => {
      test('send 3 chars', async () => {
        const name = randomstring.generate(3);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email },
          },
        });
      });

      test('send 25 chars', async () => {
        const name = randomstring.generate(25);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url,
            user: { email },
          },
        });
      });
    });

    describe('should respond fail not valid name', () => {
      test('send 2 chars', async () => {
        const name = randomstring.generate(2);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            name: 'name must be 3 to 25 characters',
          },
        });
      });

      test('send 26 chars', async () => {
        const name = randomstring.generate(26);

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            name: 'name must be 3 to 25 characters',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      test.each([
        { testName: 'send undefined', value: undefined },
        { testName: 'send null', value: null },
        { testName: 'send 234', value: 234 },
        { testName: 'send true(boolean)', value: true },
        { testName: 'send {}', value: {} },
        { testName: 'send []', value: [] },
      ])('$testName', async ({ value }) => {
        const name = value;
        ``;

        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;
        const url = randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        });

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            name: 'name must be 3 to 25 characters',
          },
        });
      });
    });
  });

  describe('url PROPERTY', () => {
    const name = randomstring.generate(10);
    const password = randomstring.generate(10);

    describe('should respond success', () => {
      test.each([
        {
          testName: 'send 3 chars',
          url: randomstring.generate({
            length: 3,
            capitalization: 'lowercase',
          }),
        },
        {
          testName: 'send 25 chars',
          url: randomstring.generate({
            length: 25,
            capitalization: 'lowercase',
          }),
        },
        {
          testName: 'send string wrapped with spaces, return trimmed',
          url: `   ${randomstring.generate({
            length: 20,
            capitalization: 'lowercase',
          })}   `,
        },
        {
          testName: 'send uppercase, return lowercase',
          url: `${randomstring.generate({
            length: 20,
            capitalization: 'uppercase',
          })}`,
        },
      ])('$testName', async ({ url }) => {
        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name,
            url: url.toLowerCase().trim(),
            user: { email },
          },
        });
      });
    });

    describe('should respond fail not valid url', () => {
      test('send a taken url', async () => {
        const url = 'urltaken';

        await appRequest.post('/auth/signup').send({
          email: `${randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          })}@gmail.com`,
          name,
          url,
          password,
        });
        const res = await appRequest.post('/auth/signup').send({
          email: `${randomstring.generate({
            length: 10,
            capitalization: 'lowercase',
          })}@gmail.com`,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            url: 'url has already been taken',
          },
        });
      });

      test('send not only alphanumeric("url spaces")', async () => {
        const url = 'url space';
        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            url: 'url can only contain number or letter',
          },
        });
      });

      test.each([
        {
          testName: 'send 2 chars',
          url: randomstring.generate({
            length: 2,
            capitalization: 'lowercase',
          }),
        },
        {
          testName: 'send 26 chars',
          url: randomstring.generate({
            length: 26,
            capitalization: 'lowercase',
          }),
        },
      ])('$testName', async ({ url }) => {
        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            url: 'url must be 3 to 25 characters',
          },
        });
      });
    });

    describe('should respons not string', () => {
      test.each([
        {
          testName: 'send undefined',
          url: undefined,
        },
        {
          testName: 'send null',
          url: null,
        },
        {
          testName: 'send 2444',
          url: 2444,
        },
        {
          testName: 'send true(boolean)',
          url: true,
        },
        {
          testName: 'send {}',
          url: {},
        },
        {
          testName: 'send []',
          url: [],
        },
      ])('$testName', async ({ url }) => {
        const email = `${randomstring.generate({
          length: 10,
          capitalization: 'lowercase',
        })}@gmail.com`;

        const res = await appRequest.post('/auth/signup').send({
          email,
          name,
          url,
          password,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            url: expect.any(String),
          },
        });
      });
    });
  });
});

//TODO: Lanjut atribut lainnya: password, name, url
