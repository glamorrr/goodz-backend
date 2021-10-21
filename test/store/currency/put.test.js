const appRequest = require('../../appRequest');

describe('PUT /store/currency', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie1;

    beforeAll(async () => {
      const email1 = 'putstoreidcurrency1@gmail.com';
      const password1 = 'putstoreidcurrency1';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put Store currencyCode 1',
        url: 'putstoreidcurrency1',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.put(`/store/currency`).send({
          currencyCode: 'US',
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

    describe('authenticated AND authorized', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
          const res = await appRequest
            .put(`/store/currency`)
            .send({ currencyCode: 'US' })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: { currencyCode: 'US' },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .put(`/store/currency`)
            .send({})
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'currency code not updated',
            },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .put(`/store/currency`)
            .send([])
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'currency code not updated',
            },
          });
        });
      });
    });
  });

  describe('currencyCode PROPERTY', () => {
    let authCookie;

    beforeAll(async () => {
      const email = 'putstoreidcurrencyprop1@gmail.com';
      const password = 'putstoreidcurrencyprop1';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 's pustorecurency',
        url: 'putstorecurrency',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('should respond success', () => {
      test('send "US"', async () => {
        const res = await appRequest
          .put(`/store/currency`)
          .send({
            currencyCode: 'US',
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            currencyCode: 'US',
          },
        });
      });

      test('send "SG"', async () => {
        const res = await appRequest
          .put(`/store/currency`)
          .send({
            currencyCode: 'SG',
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            currencyCode: 'SG',
          },
        });
      });
    });

    describe('should respond fail not valid', () => {
      test.each([
        {
          testName: 'send "FakeShie"',
          currencyCode: 'FakeShie',
        },
        {
          testName: 'send "XX"',
          currencyCode: 'XX',
        },
        {
          testName: 'send ""',
          currencyCode: '',
        },
      ])('$testName', async ({ currencyCode }) => {
        const res = await appRequest
          .put(`/store/currency`)
          .send({
            currencyCode,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { currencyCode: 'currency code is not valid' },
        });
      });
    });

    describe('should respond fail not string', () => {
      test.each([
        {
          testName: 'send undefined',
          currencyCode: undefined,
          data: { message: 'currency code not updated' },
        },
        {
          testName: 'send null',
          currencyCode: null,
          data: { currencyCode: 'currency code is not valid' },
        },
        {
          testName: 'send 24',
          currencyCode: 24,
          data: { currencyCode: 'currency code is not valid' },
        },
        {
          testName: 'send true(boolean)',
          currencyCode: true,
          data: { currencyCode: 'currency code is not valid' },
        },
        {
          testName: 'send {}',
          currencyCode: {},
          data: { currencyCode: 'currency code is not valid' },
        },
        {
          testName: 'send []',
          currencyCode: [],
          data: { currencyCode: 'currency code is not valid' },
        },
      ])('$testName', async ({ currencyCode, data }) => {
        const res = await appRequest
          .put(`/store/currency`)
          .send({
            currencyCode,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({ status: 'fail', data });
      });
    });
  });
});
