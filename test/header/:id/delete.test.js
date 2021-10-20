const appRequest = require('../../appRequest');

describe('DELETE /header/:id', () => {
  let selectedHeader;
  const user1Header = [
    {
      title: 'Best Food in Hometown 6',
    },
    {
      title: 'Our Catalog 5',
    },
    {
      title: 'Best Prod 4',
    },
    {
      title: 'Top Sales 3',
    },
    {
      title: 'selectedHeader',
    },
    {
      title: 'Top Products 1',
    },
  ];

  beforeAll(async () => {
    const email1 = 'deleteheaderid1@gmail.com';
    const password1 = 'deleteheaderid1';
    const email2 = 'deleteheaderid2@gmail.com';
    const password2 = 'deleteheaderid2';

    await appRequest.post('/auth/signup').send({
      email: email1,
      password: password1,
      name: 'Delete header Id 1',
      url: 'deleteheaderid1',
    });
    await appRequest.post('/auth/signup').send({
      email: email2,
      password: password2,
      name: 'Delete header Id 2',
      url: 'deleteheaderid2',
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
      .post('/header')
      .send(user1Header[0])
      .set('cookie', authCookie1);
    await appRequest
      .post('/header')
      .send(user1Header[1])
      .set('cookie', authCookie1);
    await appRequest
      .post('/header')
      .send(user1Header[2])
      .set('cookie', authCookie1);
    await appRequest
      .post('/header')
      .send(user1Header[3])
      .set('cookie', authCookie1);
    const resHeader = await appRequest
      .post('/header')
      .send(user1Header[4])
      .set('cookie', authCookie1);
    await appRequest
      .post('/header')
      .send(user1Header[5])
      .set('cookie', authCookie1);

    selectedHeader = resHeader.body.data.header;
  });

  describe('unauthenticated, should respond fail', () => {
    test("delete user's header", async () => {
      const res = await appRequest.delete(`/header/${selectedHeader.id}`);

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
    test("delete another user's header", async () => {
      const res = await appRequest
        .delete(`/header/${selectedHeader.id}`)
        .set('cookie', authCookie2);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'header not found',
        },
      });
    });
  });

  describe('authorized AND authenticated', () => {
    describe('should respond fail no resource', () => {
      test("send header's id that is not in database", async () => {
        const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
        const res = await appRequest
          .delete(`/header/${fakeId}`)
          .set('cookie', authCookie1);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'header not found',
          },
        });
      });
    });

    describe('should respond success', () => {
      test('delete selected header', async () => {
        const resDelete = await appRequest
          .delete(`/header/${selectedHeader.id}`)
          .set('cookie', authCookie1);

        const resGet = await appRequest
          .get('/catalog')
          .set('cookie', authCookie1);

        expect(resDelete.status).toBe(200);
        expect(resDelete.body).toStrictEqual({
          status: 'success',
          data: {
            id: selectedHeader.id,
            title: selectedHeader.title,
          },
        });

        expect(resGet.status).toBe(200);
        expect(resGet.body).toMatchObject({
          status: 'success',
          data: [
            {
              position: 1,
              header: {
                title: user1Header[5].title,
              },
            },
            {
              position: 2,
              header: {
                title: user1Header[3].title,
              },
            },
            {
              position: 3,
              header: {
                title: user1Header[2].title,
              },
            },
            {
              position: 4,
              header: {
                title: user1Header[1].title,
              },
            },
            {
              position: 5,
              header: {
                title: user1Header[0].title,
              },
            },
          ],
        });
      });
    });
  });
});
