const appRequest = require('../../appRequest');

describe('PUT /store/url', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie1;

    beforeAll(async () => {
      const email1 = 'putstoreurl1@gmail.com';
      const password1 = 'putstoreurl1';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put Store url 1',
        url: 'putstoreurl1',
      });
      await appRequest.post('/auth/signup').send({
        email: 'putstoreurl2@gmail.com',
        password: 'putstoreurl2',
        name: 'Put Store url 2',
        url: 'putstoreurl2',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.put(`/store/url`).send({
          url: 'beststore11169',
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
            .put(`/store/url`)
            .send({ url: 'beststore0922' })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: { url: 'beststore0922' },
          });
        });
      });

      describe('should respond fail', () => {
        test('send taken url', async () => {
          const res = await appRequest
            .put(`/store/url`)
            .send({ url: 'putstoreurl2' })
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              url: 'url has already been taken',
            },
          });
        });

        test('send {}', async () => {
          const res = await appRequest
            .put(`/store/url`)
            .send({})
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'url not updated',
            },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .put(`/store/url`)
            .send([])
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'url not updated',
            },
          });
        });
      });
    });
  });

  // describe('isCredit PROPERTY', () => {
  //   let authCookie;

  //   beforeAll(async () => {
  //     const email = 'putstoreidiscreditprop1@gmail.com';
  //     const password = 'putstoreidiscreditprop1';

  //     await appRequest.post('/auth/signup').send({
  //       email,
  //       password,
  //       name: 'pPut putstoreiscrdtprp',
  //       url: 'putstoreiscrdtprp',
  //     });

  //     const resLogin1 = await appRequest
  //       .post('/auth/login')
  //       .send({ email, password });
  //     authCookie = resLogin1.header['set-cookie'][0];
  //   });

  //   describe('should respond success DATATYPE:BOOLEAN', () => {
  //     test('send true', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: true,
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(200);
  //       expect(res.body).toStrictEqual({
  //         status: 'success',
  //         data: {
  //           isCredit: true,
  //         },
  //       });
  //     });

  //     test('send false', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: false,
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(200);
  //       expect(res.body).toStrictEqual({
  //         status: 'success',
  //         data: {
  //           isCredit: false,
  //         },
  //       });
  //     });
  //   });

  //   describe('should respond fail not boolean', () => {
  //     test('send undefined', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: undefined,
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(400);
  //       expect(res.body).toStrictEqual({
  //         status: 'fail',
  //         data: {
  //           message: 'isCredit not updated',
  //         },
  //       });
  //     });

  //     test('send null', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: null,
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(400);
  //       expect(res.body).toStrictEqual({
  //         status: 'fail',
  //         data: {
  //           isCredit: 'isCredit must be boolean',
  //         },
  //       });
  //     });

  //     test('send 69', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: 69,
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(400);
  //       expect(res.body).toStrictEqual({
  //         status: 'fail',
  //         data: {
  //           isCredit: 'isCredit must be boolean',
  //         },
  //       });
  //     });

  //     test('send "69"', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: '69',
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(400);
  //       expect(res.body).toStrictEqual({
  //         status: 'fail',
  //         data: {
  //           isCredit: 'isCredit must be boolean',
  //         },
  //       });
  //     });

  //     test('send {}', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: {},
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(400);
  //       expect(res.body).toStrictEqual({
  //         status: 'fail',
  //         data: {
  //           isCredit: 'isCredit must be boolean',
  //         },
  //       });
  //     });

  //     test('send []', async () => {
  //       const res = await appRequest
  //         .put(`/store/url`)
  //         .send({
  //           isCredit: [],
  //         })
  //         .set('cookie', authCookie);

  //       expect(res.status).toBe(400);
  //       expect(res.body).toStrictEqual({
  //         status: 'fail',
  //         data: {
  //           isCredit: 'isCredit must be boolean',
  //         },
  //       });
  //     });
  //   });
  // });
});
