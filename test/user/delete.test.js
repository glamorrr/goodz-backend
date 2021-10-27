const path = require('path');
const appRequest = require('../appRequest');

const assetPath = path.join(__dirname, '../assets');

describe('DELETE /user', () => {
  const email = 'deleteuser@gmail.com';
  const password = 'deleteuser';
  const url = 'deleteuser';
  let authCookie;
  let selectedLink;
  let selectedCatalog;
  let selectedItem;
  let selectedHeader;
  let selectedImage;

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email,
      password,
      name: 'Delete user',
      url,
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email, password });
    authCookie = resLogin1.header['set-cookie'][0];

    selectedLink = await appRequest
      .post(`/links`)
      .send({ title: 'google', href: 'google.com' })
      .set('cookie', authCookie);
    selectedLink = selectedLink.body.data;

    selectedCatalog = await appRequest
      .post('/items')
      .send({ name: 'Nasi Goreng', price: 11000 })
      .set('cookie', authCookie);
    selectedCatalog = selectedCatalog.body.data;
    selectedItem = selectedCatalog.item;

    selectedHeader = await appRequest
      .post('/header')
      .send({ title: 'Top Product' })
      .set('cookie', authCookie);
    selectedHeader = selectedHeader.body.data;

    selectedImage = await appRequest
      .post(`/items/${selectedItem.id}/image`)
      .attach('image', path.join(assetPath, '13KB.jpeg'))
      .set('cookie', authCookie);
    selectedImage = selectedImage.body.data.image;
  });

  test('should respond fail not authenticated', async () => {
    const res = await appRequest.delete(`/user`).send({ password });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: {
        message: 'unauthenticated',
      },
    });
  });

  test('should respond fail wrong password', async () => {
    const res = await appRequest
      .delete(`/user`)
      .set('cookie', authCookie)
      .send({ password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: {
        message: 'invalid password',
      },
    });
  });

  test('should respond success', async () => {
    const res = await appRequest
      .delete(`/user`)
      .set('cookie', authCookie)
      .send({ password });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      status: 'success',
      data: { email },
    });
  });

  test('should respond fail user not found (already deleted)', async () => {
    const res = await appRequest
      .delete(`/user`)
      .set('cookie', authCookie)
      .send({ password });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: {
        message: 'user not found',
      },
    });
  });

  describe('check all all api', () => {
    test('GET /url/:url', async () => {
      const res = await appRequest.get(`/url/${url}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: 'fail',
        data: { message: 'url not found' },
      });
    });

    test('POST /auth/login', async () => {
      const res = await appRequest
        .post('/auth/login')
        .send({ email, password });

      expect(res.status).toBe(401);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: { message: 'invalid email and password' },
      });
    });

    test('GET /store', async () => {
      const res = await appRequest.get('/store').set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: 'fail',
        data: { message: 'store not found' },
      });
    });

    test('POST /store/image', async () => {
      const res = await appRequest
        .post(`/store/image`)
        .attach('image', path.join(assetPath, '13KB.jpeg'))
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'store not found',
        },
      });
    });

    test('POST /store/background ', async () => {
      const res = await appRequest
        .post(`/store/background`)
        .attach('image', path.join(assetPath, '13KB.jpeg'))
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'store not found',
        },
      });
    });

    test('PUT /store/url', async () => {
      const res = await appRequest
        .put(`/store/url`)
        .send({ url: '123456678913url' })
        .set('cookie', authCookie);

      expect(res.status).toBe(500);
    });

    test('PUT /store/is_credit', async () => {
      const res = await appRequest
        .put(`/store/is_credit`)
        .send({ isCredit: true })
        .set('cookie', authCookie);

      expect(res.status).toBe(500);
    });

    test('PUT /store/currency', async () => {
      const res = await appRequest
        .put(`/store/currency`)
        .send({ currencyCode: 'US' })
        .set('cookie', authCookie);

      expect(res.status).toBe(500);
    });

    test('GET /links', async () => {
      const res = await appRequest.get('/links').set('cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'success',
        data: [],
      });
    });

    test('POST /links', async () => {
      const res = await appRequest
        .post(`/links`)
        .send({ title: 'google', href: 'google.com' })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'store not found',
        },
      });
    });

    test('PUT /links/:id', async () => {
      const res = await appRequest
        .put(`/links/${selectedLink.id}`)
        .send({
          title: 'update Link 1',
          href: 'tryupdatelink1.com',
          isVisible: false,
        })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'link not found',
        },
      });
    });

    test('PUT /links/:id/position', async () => {
      const res = await appRequest
        .put(`/links/${selectedLink.id}/position`)
        .send({ position: 1 })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'link not found',
        },
      });
    });

    test('DELETE /links/:id', async () => {
      const res = await appRequest
        .delete(`/links/${selectedLink.id}`)
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'link not found',
        },
      });
    });

    test('GET /catalog ', async () => {
      const res = await appRequest.get('/catalog').set('cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'success',
        data: [],
      });
    });

    test('PUT /catalog/:id/position', async () => {
      const res = await appRequest
        .put(`/catalog/${selectedCatalog.id}/position`)
        .send({ position: 1 })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: { message: 'catalog not found' },
      });
    });

    test('POST /header', async () => {
      const res = await appRequest
        .post('/header')
        .send({ title: 'Good Stuff' })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: { message: 'store not found' },
      });
    });

    test('PUT /header/:id', async () => {
      const res = await appRequest
        .put(`/header/${selectedHeader.id}`)
        .send({
          isVisible: true,
        })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'header not found',
        },
      });
    });

    test('DELETE /header/:id', async () => {
      const res = await appRequest
        .delete(`/header/${selectedHeader.id}`)
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'header not found',
        },
      });
    });

    test('POST /items', async () => {
      const res = await appRequest
        .post('/items')
        .send({
          name: 'nasi goreng',
          price: 8000,
        })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: { message: 'store not found' },
      });
    });

    test('PUT /items/:id ', async () => {
      const res = await appRequest
        .put(`/items/${selectedItem.id}`)
        .send({
          name: 'Kue Bolu',
          price: 4000,
          isVisible: true,
        })
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'item not found',
        },
      });
    });

    test('POST /items/:id/image', async () => {
      const res = await appRequest
        .post(`/items/${selectedItem.id}/image`)
        .attach('image', path.join(assetPath, '13KB.jpeg'))
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'item not found',
        },
      });
    });

    test('DELETE /items/:id', async () => {
      const res = await appRequest
        .delete(`/items/${selectedItem.id}`)
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'item not found',
        },
      });
    });

    test('DELETE /images/:id', async () => {
      const res = await appRequest
        .delete(`/images/${selectedImage.id}`)
        .set('cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'image not found',
        },
      });
    });
  });
});
