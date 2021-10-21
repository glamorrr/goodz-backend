const appRequest = require('../../appRequest');
const randomstring = require('randomstring');

describe('PUT /store/profile', () => {
  describe('ALL PROPERTIES', () => {
    const name = 'Super Store';
    const description = 'Established Since 1999. EST';
    const location = 'Wall Street Number #22, @ USA';

    beforeAll(async () => {
      const email1 = 'putstoreprofile@gmail.com';
      const password1 = 'putstoreprofile';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put putstoreprofile 1',
        url: 'putstoreprofile',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location });

        expect(res.status).toBe(401);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'unauthenticated',
          },
        });
      });
    });

    describe('authenticated AND authorized', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
          const res = await appRequest
            .put(`/store/profile`)
            .send({ name, description, location })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              name,
              description,
              location,
            },
          });
        });
      });

      describe('should respond fail', () => {
        test.each([
          {
            testName: 'send {}',
            putData: {},
          },
          {
            testName: 'send []',
            putData: [],
          },
        ])('$testName', async ({ putData }) => {
          const res = await appRequest
            .put(`/store/profile`)
            .send(putData)
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'profile not updated',
            },
          });
        });
      });
    });
  });

  describe('description PROPERTY', () => {
    describe('should respond success', () => {
      const name = 'Best Store';
      const location = 'Old Town Road';

      test.each([
        {
          testName: 'send 3 chars',
          description: randomstring.generate(3),
        },
        {
          testName: 'send 100 chars',
          description: randomstring.generate(100),
        },
        {
          testName: 'send null',
          description: null,
        },
      ])('$testName', async ({ description }) => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location })
          .set('cookie', authCookie1);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            name,
            description,
            location,
          },
        });
      });
    });

    describe('should respond fail not valid description', () => {
      const name = 'Best Store';
      const location = 'Old Town Road';

      test.each([
        {
          testName: 'send 2 chars',
          description: randomstring.generate(2),
        },
        {
          testName: 'send 101 chars',
          description: randomstring.generate(101),
        },
      ])('$testName', async ({ description }) => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location })
          .set('cookie', authCookie1);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            description: 'description must be 3 to 100 characters',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      const name = 'Best Store';
      const location = 'Old Town Road';

      test.each([
        {
          testName: 'send 243',
          description: 243,
        },
        {
          testName: 'send true(boolean)',
          description: true,
        },
        {
          testName: 'send {}',
          description: {},
        },
        {
          testName: 'send []',
          description: [],
        },
      ])('$testName', async ({ description }) => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location })
          .set('cookie', authCookie1);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            description: 'description must be 3 to 100 characters',
          },
        });
      });
    });
  });

  describe('location PROPERTY', () => {
    const name = 'Best Store';
    const description = 'Best Store in HOMETOWN BOYS!!!';

    describe('should respond success', () => {
      test.each([
        {
          testName: 'send 3 chars',
          location: randomstring.generate(3),
        },
        {
          testName: 'send 100 chars',
          location: randomstring.generate(100),
        },
        {
          testName: 'send null',
          location: null,
        },
      ])('$testName', async ({ location }) => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location })
          .set('cookie', authCookie1);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            name,
            description,
            location,
          },
        });
      });
    });

    describe('should respond fail not valid location', () => {
      test.each([
        {
          testName: 'send 2 chars',
          location: randomstring.generate(2),
        },
        {
          testName: 'send 101 chars',
          location: randomstring.generate(101),
        },
      ])('$testName', async ({ location }) => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location })
          .set('cookie', authCookie1);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            location: 'location must be 3 to 100 characters',
          },
        });
      });
    });

    describe('should respond fail not string', () => {
      test.each([
        {
          testName: 'send 243',
          location: 243,
        },
        {
          testName: 'send true(boolean)',
          location: true,
        },
        {
          testName: 'send {}',
          location: {},
        },
        {
          testName: 'send []',
          location: [],
        },
      ])('$testName', async ({ location }) => {
        const res = await appRequest
          .put(`/store/profile`)
          .send({ name, description, location })
          .set('cookie', authCookie1);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            location: 'location must be 3 to 100 characters',
          },
        });
      });
    });
  });
});
