const path = require('path');
const appRequest = require('../../appRequest');

const assetPath = path.join(__dirname, '../../assets');

describe('DELETE /images/:id', () => {
  const name = 'Spicy ICe Cream';
  const price = 69000;
  let authCookie1;
  let authCookie2;
  let user1Item;
  let user1ItemImage;

  beforeAll(async () => {
    const email1 = 'deleteimagesid1@gmail.com';
    const password1 = 'deleteimagesid1';
    const email2 = 'deleteimagesid2@gmail.com';
    const password2 = 'deleteimagesid2';

    await appRequest.post('/auth/signup').send({
      email: email1,
      password: password1,
      name: 'Delete imagesid1',
      url: 'deleteimagesid1',
    });
    await appRequest.post('/auth/signup').send({
      email: email2,
      password: password2,
      name: 'Delete imagesid2',
      url: 'deleteimagesid2',
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

    const resItemImage1 = await appRequest
      .post(`/items/${user1Item.id}/image`)
      .attach('image', path.join(assetPath, '300KB.png'))
      .set('cookie', authCookie1);

    user1ItemImage = resItemImage1.body.data.image;
  });

  describe('unauthenticated, should respond fail', () => {
    test("delete user's item image", async () => {
      const res = await appRequest.delete(`/images/${user1ItemImage.id}`);

      expect(res.status).toBe(401);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'unauthenticated',
        },
      });
    });
  });

  describe('unauthorized, should respond fail', () => {
    test("delete another user's item image", async () => {
      const res = await appRequest
        .delete(`/images/${user1ItemImage.id}`)
        .set('cookie', authCookie2);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'image not found',
        },
      });
    });
  });

  describe('authenticated AND authorized', () => {
    describe('should respond fail no resource', () => {
      test("send item's image id that is not in database", async () => {
        const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
        const res = await appRequest
          .delete(`/images/${fakeId}`)
          .set('cookie', authCookie1);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'image not found',
          },
        });
      });
    });

    describe('should respond success', () => {
      test("send item's image id", async () => {
        const res = await appRequest
          .delete(`/images/${user1ItemImage.id}`)
          .set('cookie', authCookie1);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: user1ItemImage.id,
            path: user1ItemImage.path,
          },
        });
      });
    });
  });
});
