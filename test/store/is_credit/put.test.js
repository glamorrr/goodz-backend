const appRequest = require('../../appRequest');

describe('PUT /store/is_credit', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie1;

    beforeAll(async () => {
      const email1 = 'putstoreidiscredit1@gmail.com';
      const password1 = 'putstoreidiscredit1';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put Store isCredit 1',
        url: 'putstoreidiscredit1',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.put(`/store/is_credit`).send({
          isCredit: false,
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
            .put(`/store/is_credit`)
            .send({ isCredit: true })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: { isCredit: true },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .put(`/store/is_credit`)
            .send({})
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'isCredit not updated',
            },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .put(`/store/is_credit`)
            .send([])
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'isCredit not updated',
            },
          });
        });
      });
    });
  });

  describe('isCredit PROPERTY', () => {
    let authCookie;

    beforeAll(async () => {
      const email = 'putstoreidiscreditprop1@gmail.com';
      const password = 'putstoreidiscreditprop1';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'pPut putstoreiscrdtprp',
        url: 'putstoreiscrdtprp',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('should respond success DATATYPE:BOOLEAN', () => {
      test('send true', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: true,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            isCredit: true,
          },
        });
      });

      test('send false', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: false,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            isCredit: false,
          },
        });
      });
    });

    describe('should respond fail not boolean', () => {
      test('send undefined', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: undefined,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'isCredit not updated',
          },
        });
      });

      test('send null', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: null,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isCredit: 'isCredit must be boolean',
          },
        });
      });

      test('send 69', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: 69,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isCredit: 'isCredit must be boolean',
          },
        });
      });

      test('send "69"', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: '69',
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isCredit: 'isCredit must be boolean',
          },
        });
      });

      test('send {}', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: {},
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isCredit: 'isCredit must be boolean',
          },
        });
      });

      test('send []', async () => {
        const res = await appRequest
          .put(`/store/is_credit`)
          .send({
            isCredit: [],
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            isCredit: 'isCredit must be boolean',
          },
        });
      });
    });
  });
});
