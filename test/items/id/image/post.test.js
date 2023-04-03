const path = require('path');
const appRequest = require('../../../appRequest');

const assetPath = path.join(__dirname, '../../../assets');

describe('POST /items/:id/image', () => {
  describe('ALL PROPERTIES', () => {
    const name = 'Spicy ICe Cream';
    const price = 69000;
    let authCookie1;
    let authCookie2;
    let user1Item;

    beforeAll(async () => {
      const email1 = 'postitemidimage1@gmail.com';
      const password1 = 'postitemidimage1';
      const email2 = 'postitemidimage2@gmail.com';
      const password2 = 'postitemidimage2';

      await appRequest.post('/auth/signup').send({
        email: email1,
        password: password1,
        name: 'Post Item id image 1',
        url: 'postitemidimage1',
      });
      await appRequest.post('/auth/signup').send({
        email: email2,
        password: password2,
        name: 'Post Item id image 2',
        url: 'postitemidimage2',
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
        .send({ name, price })
        .set('cookie', authCookie1);

      user1Item = resItem1.body.data.item;
    });

    describe('unauthenticated', () => {
      test('should respond fail', async () => {
        const res = await appRequest
          .post(`/items/${user1Item.id}/image`)
          .attach('image', path.join(assetPath, '300KB.png'));

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
      test("should respond fail update another user's item image", async () => {
        const res = await appRequest
          .post(`/items/${user1Item.id}/image`)
          .attach('image', path.join(assetPath, '300KB.png'))
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
            .post(`/items/${user1Item.id}/image`)
            .attach('image', path.join(assetPath, '300KB.png'))
            .set('cookie', authCookie1);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({
            status: 'success',
            data: {
              id: user1Item.id,
              image: {
                id: expect.any(String),
                path: expect.any(String),
                blurhash: expect.any(String),
                color: expect.any(String),
              },
            },
          });
        });
      });

      describe('should respond fail no resource', () => {
        test('send item id that is not in database', async () => {
          const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
          const res = await appRequest
            .post(`/items/${fakeId}/image`)
            .attach('image', path.join(assetPath, '300KB.png'))
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
        test('send no attachment', async () => {
          const res = await appRequest
            .post(`/items/${user1Item.id}/image`)
            .set('cookie', authCookie1);

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({
            status: 'fail',
            data: {
              message: 'please insert an image',
            },
          });
        });
      });
    });
  });

  describe('image PROPERTY(MULTIPART/FORM-DATA)', () => {
    const name = 'Spicy ICe Cream';
    const price = 69000;
    let authCookie;
    let selectedItem;

    beforeAll(async () => {
      const email = 'postitemidimageimageproperty@gmail.com';
      const password = 'postitemidimageimageproperty';

      await appRequest.post('/auth/signup').send({
        email,
        password,
        name: 'Post imageproperty',
        url: 'postitemidimgprop',
      });

      const resLogin = await appRequest
        .post('/auth/login')
        .send({ email, password });
      authCookie = resLogin.header['set-cookie'][0];

      const resItem1 = await appRequest
        .post('/items')
        .send({ name, price })
        .set('cookie', authCookie);

      selectedItem = resItem1.body.data.item;
    });

    describe('should respond success', () => {
      test('send 13KB.jpeg', async () => {
        const res = await appRequest
          .post(`/items/${selectedItem.id}/image`)
          .attach('image', path.join(assetPath, '13KB.jpeg'))
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: selectedItem.id,
            image: {
              id: expect.any(String),
              path: expect.any(String),
              blurhash: expect.any(String),
              color: expect.any(String),
            },
          },
        });
      });

      test('send 300KB.png', async () => {
        const res = await appRequest
          .post(`/items/${selectedItem.id}/image`)
          .attach('image', path.join(assetPath, '300KB.png'))
          .set('cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: selectedItem.id,
            image: {
              id: expect.any(String),
              path: expect.any(String),
              blurhash: expect.any(String),
              color: expect.any(String),
            },
          },
        });
      });
    });

    describe('should respond fail image too large', () => {
      test('send 6MB.jpeg', async () => {
        const res = await appRequest
          .post(`/items/${selectedItem.id}/image`)
          .attach('image', path.join(assetPath, '6MB.jpeg'))
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'maximum file size is 2 MB',
          },
        });
      });
    });

    describe('should respond fail not an image', () => {
      test('send 1KB.pdf', async () => {
        const res = await appRequest
          .post(`/items/${selectedItem.id}/image`)
          .attach('image', path.join(assetPath, '1KB.pdf'))
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'file type is not supported',
          },
        });
      });

      test('send 3MB.gif', async () => {
        const res = await appRequest
          .post(`/items/${selectedItem.id}/image`)
          .attach('image', path.join(assetPath, '3MB.gif'))
          .set('cookie', authCookie);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'file type is not supported',
          },
        });
      });
    });
  });
});
