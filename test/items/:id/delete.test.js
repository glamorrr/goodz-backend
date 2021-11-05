const path = require('path');
const appRequest = require('../../appRequest');

const assetPath = path.join(__dirname, '../../assets');

describe('DELETE /items/:id', () => {
  let selectedItem;
  let selectedItemWithImage;
  const user1Item = [
    {
      name: 'Steak 6',
      price: 84000,
    },
    {
      name: 'Nasi Uduk 5',
      price: 20000,
    },
    {
      name: 'Nasi Goreng 4',
      price: 11000,
    },
    {
      name: 'Ice Cream 3 with Image',
      price: 8500,
    },
    {
      name: 'Capcai 2 selectedItem',
      price: 24500,
    },
    {
      name: 'Nasi Ayam 1',
      price: 15000,
    },
  ];

  beforeAll(async () => {
    const email1 = 'deleteitemsid1@gmail.com';
    const password1 = 'deleteitemsid1';
    const email2 = 'deleteitemsid2@gmail.com';
    const password2 = 'deleteitemsid2';

    await appRequest.post('/auth/signup').send({
      email: email1,
      password: password1,
      name: 'Delete items Id 1',
      url: 'deleteitemsid1',
    });
    await appRequest.post('/auth/signup').send({
      email: email2,
      password: password2,
      name: 'Delete items Id 2',
      url: 'deleteitemsid2',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email: email1, password: password1 });
    authCookie1 = resLogin1.header['set-cookie'][0];
    const resLogin2 = await appRequest
      .post('/auth/login')
      .send({ email: email2, password: password2 });
    authCookie2 = resLogin2.header['set-cookie'][0];

    await appRequest
      .post('/items')
      .send(user1Item[0])
      .set('cookie', authCookie1);
    await appRequest
      .post('/items')
      .send(user1Item[1])
      .set('cookie', authCookie1);
    await appRequest
      .post('/items')
      .send(user1Item[2])
      .set('cookie', authCookie1);
    const resItemWithImage = await appRequest
      .post('/items')
      .send(user1Item[3])
      .set('cookie', authCookie1);
    const resItem = await appRequest
      .post('/items')
      .send(user1Item[4])
      .set('cookie', authCookie1);
    await appRequest
      .post('/items')
      .send(user1Item[5])
      .set('cookie', authCookie1);

    selectedItem = resItem.body.data.item;
    selectedItemWithImage = resItemWithImage.body.data.item;

    const resPutImage = await appRequest
      .post(`/items/${selectedItemWithImage.id}/image`)
      .attach('image', path.join(assetPath, '3MB.jpg'))
      .set('cookie', authCookie1);

    selectedItemWithImage = {
      ...selectedItemWithImage,
      image: resPutImage.body.data.image,
    };
  });

  describe('unauthenticated, should respond fail', () => {
    test("delete user's item", async () => {
      const res = await appRequest.delete(`/items/${selectedItem.id}`);

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
    test("delete another user's item", async () => {
      const res = await appRequest
        .delete(`/items/${selectedItem.id}`)
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

  describe('authorized AND authenticated', () => {
    describe('should respond fail no resource', () => {
      test("send item's id that is not in database", async () => {
        const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
        const res = await appRequest
          .delete(`/items/${fakeId}`)
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

    describe('should respond success', () => {
      test('delete selected item without image', async () => {
        const resDelete = await appRequest
          .delete(`/items/${selectedItem.id}`)
          .set('cookie', authCookie1);

        const resGet = await appRequest
          .get('/catalog')
          .set('cookie', authCookie1);

        expect(resDelete.status).toBe(200);
        expect(resDelete.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name: selectedItem.name,
            price: selectedItem.price,
            image: null,
          },
        });

        expect(resGet.status).toBe(200);
        expect(resGet.body).toStrictEqual({
          status: 'success',
          data: [
            {
              id: expect.any(String),
              header: null,
              position: 1,
              item: {
                id: expect.any(String),
                name: user1Item[5].name,
                price: user1Item[5].price,
                isVisible: expect.any(Boolean),
                image: null,
                href: null,
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 2,
              item: {
                id: expect.any(String),
                isVisible: expect.any(Boolean),
                name: user1Item[3].name,
                price: user1Item[3].price,
                isVisible: expect.any(Boolean),
                href: null,
                image: expect.anything(),
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 3,
              item: {
                id: expect.any(String),
                name: user1Item[2].name,
                price: user1Item[2].price,
                isVisible: expect.any(Boolean),
                href: null,
                image: null,
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 4,
              item: {
                id: expect.any(String),
                name: user1Item[1].name,
                price: user1Item[1].price,
                isVisible: expect.any(Boolean),
                href: null,
                image: null,
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 5,
              item: {
                id: expect.any(String),
                name: user1Item[0].name,
                price: user1Item[0].price,
                isVisible: expect.any(Boolean),
                href: null,
                image: null,
              },
            },
          ],
        });
      });

      test('delete selected item with image', async () => {
        const resDelete = await appRequest
          .delete(`/items/${selectedItemWithImage.id}`)
          .set('cookie', authCookie1);

        const resGet = await appRequest
          .get('/catalog')
          .set('cookie', authCookie1);

        expect(resDelete.status).toBe(200);
        expect(resDelete.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
            name: selectedItemWithImage.name,
            price: selectedItemWithImage.price,
            image: selectedItemWithImage.image,
          },
        });

        expect(resGet.status).toBe(200);
        expect(resGet.body).toStrictEqual({
          status: 'success',
          data: [
            {
              id: expect.any(String),
              header: null,
              position: 1,
              item: {
                id: expect.any(String),
                name: user1Item[5].name,
                price: user1Item[5].price,
                isVisible: expect.any(Boolean),
                href: null,
                image: null,
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 2,
              item: {
                id: expect.any(String),
                name: user1Item[2].name,
                price: user1Item[2].price,
                isVisible: expect.any(Boolean),
                image: null,
                href: null,
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 3,
              item: {
                id: expect.any(String),
                name: user1Item[1].name,
                price: user1Item[1].price,
                isVisible: expect.any(Boolean),
                image: null,
                href: null,
              },
            },
            {
              id: expect.any(String),
              header: null,
              position: 4,
              item: {
                id: expect.any(String),
                name: user1Item[0].name,
                price: user1Item[0].price,
                isVisible: expect.any(Boolean),
                image: null,
                href: null,
              },
            },
          ],
        });
      });
    });
  });
});
