const randomstring = require('randomstring');
const appRequest = require('../../appRequest');

describe('PUT /items/:id', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie1;
    let authCookie2;
    let user1Item;

    beforeAll(async () => {
      const email1 = 'putitemidall1@gmail.com';
      const password1 = 'putitemidall1';
      const email2 = 'putitemidall2@gmail.com';
      const password2 = 'putitemidall2';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Put Item All 1',
        url: 'putitemidall1',
      });
      await appRequest.post('/auth/signup').send({
        email: email2,
        password: password2,
        name: 'Put Item All 2',
        url: 'putitemidall2',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: email1, password: password1 });
      authCookie1 = resLogin1.header['set-cookie'][0];
      const resLogin2 = await appRequest
        .post('/auth/login')
        .send({ email: email2, password: password2 });
      authCookie2 = resLogin2.header['set-cookie'][0];

      const resItem1 = await appRequest
        .post('/items')
        .send({
          name: randomstring.generate(4),
          price: 43000,
        })
        .set('cookie', authCookie1);

      user1Item = resItem1.body.data.item;
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest.put(`/items/${user1Item.id}`).send({
          name: randomstring.generate(3),
          price: 4000,
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
      test("should respond fail update another user's item", async () => {
        const res = await appRequest
          .put(`/items/${user1Item.id}`)
          .send({
            name: randomstring.generate(3),
            price: 4000,
            isVisible: true,
          })
          .set('cookie', authCookie2);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'item not found',
          },
        });
      });
    });

    describe('authenticated AND authorized', () => {
      describe('should respond success', () => {
        test('send valid data', async () => {
          const res = await appRequest
            .put(`/items/${user1Item.id}`)
            .send({
              name: 'Kue Bolu',
              price: 6500,
              isVisible: true,
            })
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              id: expect.any(String),
              name: 'Kue Bolu',
              price: 6500,
              isVisible: true,
            },
          });
        });
      });

      describe('should respond fail no resource', () => {
        test('send id that is not in database', async () => {
          const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
          const res = await appRequest
            .put(`/items/${fakeId}`)
            .send({
              name: 'Kue Bolu',
              price: 6500,
              isVisible: true,
            })
            .set('cookie', authCookie1);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'item not found',
            },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const res = await appRequest
            .put(`/items/${user1Item.id}`)
            .send({})
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'item not updated',
            },
          });
        });

        test('send []', async () => {
          const res = await appRequest
            .put(`/items/${user1Item.id}`)
            .send([])
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'item not updated',
            },
          });
        });
      });
    });
  });

  describe('isVisible PROPERTY', () => {
    let authCookie;
    let selectedItem;

    beforeAll(async () => {
      const email = 'putitemid1@gmail.com';
      const password = 'putitemid1';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Edit Item Id 1',
        url: 'putitemid1',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];

      const name = 'Ice Cream';
      const price = 6000;
      const resItem = await appRequest
        .post('/items')
        .send({
          name,
          price,
        })
        .set('cookie', authCookie);

      selectedItem = resItem.body.data.item;
    });

    describe('should respond success DATATYPE:BOOLEAN', () => {
      test('send true', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
          .send({
            isVisible: true,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name: expect.any(String),
            price: expect.any(Number),
            isVisible: true,
          },
        });
      });

      test('send false', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
          .send({
            isVisible: false,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name: expect.any(String),
            price: expect.any(Number),
            isVisible: false,
          },
        });
      });
    });

    describe('should respond fail not boolean', () => {
      test('send undefined', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
          .send({
            isVisible: undefined,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'item not updated',
          },
        });
      });

      test('send null', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
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

      test('send "242"', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
          .send({
            isVisible: '242',
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

      test('send 242', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
          .send({
            isVisible: 242,
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
          .put(`/items/${selectedItem.id}`)
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

      test('send {}', async () => {
        const res = await appRequest
          .put(`/items/${selectedItem.id}`)
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
    });
  });
});
