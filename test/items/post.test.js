const randomstring = require('randomstring');
const appRequest = require('../appRequest');

describe('POST /items', () => {
  describe('ALL PROPERTIES', () => {
    let authCookie;

    beforeAll(async () => {
      const email = 'additemall@gmail.com';
      const password = 'additemall';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Add Item All 1',
        url: 'additemall',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const name = randomstring.generate(3);
        const price = 4000;
        const res = await appRequest.post('/items').send({
          name,
          price,
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
          const name = randomstring.generate(3);
          const price = 4000;
          const res = await appRequest
            .post('/items')
            .send({
              name,
              price,
            })
            .set('cookie', authCookie);

          expect(res.status).toBe(201);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              id: expect.any(String),
              position: 1,
              item: {
                id: expect.any(String),
                name,
                price,
                isVisible: true,
              },
            },
          });
        });
      });

      describe('should respond fail', () => {
        test('send {}', async () => {
          const name = {};
          const res = await appRequest
            .post('/items')
            .send({})
            .set('cookie', authCookie);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              name: 'name must be 3 to 50 characters',
              price: 'price must be an integer',
            },
          });
        });

        test('send []', async () => {
          const name = [];
          const res = await appRequest
            .post('/items')
            .send([])
            .set('cookie', authCookie);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              name: 'name must be 3 to 50 characters',
              price: 'price must be an integer',
            },
          });
        });
      });
    });
  });

  describe('name PROPERTY', () => {
    let authCookie;
    const price = 1000;

    beforeAll(async () => {
      await appRequest.post('/auth/signup').send({
        email: 'addItem1@gmail.com',
        password: 'addItem1',
        name: 'Add Item1',
        url: 'addItem1',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email: 'addItem1@gmail.com', password: 'addItem1' });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('should respond success', () => {
      test('send 3 chars', async () => {
        const name = randomstring.generate(3);
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            item: {
              id: expect.any(String),
              name,
              price,
              isVisible: true,
            },
          },
        });
      });

      test('send 50 chars', async () => {
        const name = randomstring.generate(50);

        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            item: {
              id: expect.any(String),
              name,
              price,
              isVisible: true,
            },
          },
        });
      });

      test('send string wrapped with spaces, return trimmed string', async () => {
        const name = '   ' + randomstring.generate(10) + '  ';
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            item: {
              id: expect.any(String),
              name: name.trim(),
              price,
              isVisible: true,
            },
          },
        });
      });
    });

    describe('should respond fail characters not valid', () => {
      test('send 2 chars too short', async () => {
        const name = randomstring.generate(51);
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });

      test('send 51 chars too long', async () => {
        const name = randomstring.generate(51);
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });
    });

    describe('should respond fail not string', () => {
      test('send undefined', async () => {
        const name = undefined;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });

      test('send null', async () => {
        const name = null;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });

      test('send 2(number)', async () => {
        const name = 2;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });

      test('send true(boolean)', async () => {
        const name = true;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });

      test('send []', async () => {
        const name = [];
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });

      test('send {}', async () => {
        const name = {};
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: { name: 'name must be 3 to 50 characters' },
        });
      });
    });
  });

  describe('price PROPERTY', () => {
    let authCookie;
    const name = 'Chicken Nugget';

    beforeAll(async () => {
      const email = 'additemprice1@gmail.com';
      const password = 'additemprice1';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Add Item Price 1',
        url: 'additemprice1',
      });

      const resLogin1 = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin1.header['set-cookie'][0];
    });

    describe('should respond success DATATYPE:NUMBER', () => {
      test('send 1000', async () => {
        const price = 1000;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            item: {
              id: expect.any(String),
              name,
              price,
              isVisible: true,
            },
          },
        });
      });

      test('send 0', async () => {
        const price = 0;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            item: {
              id: expect.any(String),
              name,
              price,
              isVisible: true,
            },
          },
        });
      });

      test('send 1 000 000 000', async () => {
        const price = 1 * 1000 * 1000 * 1000;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            position: 1,
            item: {
              id: expect.any(String),
              name,
              price,
              isVisible: true,
            },
          },
        });
      });
    });

    describe('should respond fail not valid number DATATYPE:NUMBER', () => {
      test('send 4.2', async () => {
        const price = 4.2;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send 42000.33', async () => {
        const price = 42000.33;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send 1 000 000 001', async () => {
        const price = 1 + 1 * 1000 * 1000 * 1000;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'maximum price is 1 000 000 000',
          },
        });
      });

      test('send -1', async () => {
        const price = -1;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: "price can't be negative",
          },
        });
      });
    });

    describe('should respond fail not a number', () => {
      test('send undefined', async () => {
        const price = undefined;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send null', async () => {
        const price = null;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send "224"', async () => {
        const price = '224';
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send true(boolean)', async () => {
        const price = true;
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send []', async () => {
        const price = [];
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });

      test('send {}', async () => {
        const price = {};
        const res = await appRequest
          .post('/items')
          .send({
            name,
            price,
          })
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            price: 'price must be an integer',
          },
        });
      });
    });
  });
});
