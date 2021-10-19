const appRequest = require('../../appRequest');

describe('DELETE /links/:id', () => {
  let selectedLink;
  const user1Links = [
    {
      title: 'Google 4',
      href: 'https://google.com',
    },
    {
      title: 'Google 3',
      href: 'https://google.com',
    },
    {
      title: 'Google 2',
      href: 'https://google.com',
    },
    {
      title: 'Google 1',
      href: 'https://google.com',
    },
  ];

  beforeAll(async () => {
    const email1 = 'deletelinkid1@gmail.com';
    const password1 = 'deletelinkid1';
    const email2 = 'deletelinkid2@gmail.com';
    const password2 = 'deletelinkid2';

    await appRequest.post('/auth/signup').send({
      email: email1,
      password: password1,
      name: 'Delete Link Id 1',
      url: 'deletelinkid1',
    });
    await appRequest.post('/auth/signup').send({
      email: email2,
      password: password2,
      name: 'Delete Link Id 2',
      url: 'deletelinkid2',
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
      .post('/links')
      .send(user1Links[0])
      .set('cookie', authCookie1);
    await appRequest
      .post('/links')
      .send(user1Links[1])
      .set('cookie', authCookie1);
    const resLink = await appRequest
      .post('/links')
      .send(user1Links[2])
      .set('cookie', authCookie1);
    await appRequest
      .post('/links')
      .send(user1Links[3])
      .set('cookie', authCookie1);

    selectedLink = resLink.body.data;
  });

  describe('unauthenticated, should respond fail', () => {
    test("delete user's link", async () => {
      const res = await appRequest.delete(`/links/${selectedLink.id}`);

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
    test("delete another user's link", async () => {
      const res = await appRequest
        .delete(`/links/${selectedLink.id}`)
        .set('cookie', authCookie2);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'link not found',
        },
      });
    });
  });

  describe('authorized AND authenticated', () => {
    describe('should respond fail no resource', () => {
      test("send link's id that is not in database", async () => {
        const fakeId = '78573999-361d-4983-a37f-f6846edcfbbf';
        const res = await appRequest
          .delete(`/links/${fakeId}`)
          .set('cookie', authCookie1);

        expect(res.status).toBe(404);
        expect(res.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'link not found',
          },
        });
      });
    });

    describe('should respond success', () => {
      test("send valid link's id", async () => {
        const resDelete = await appRequest
          .delete(`/links/${selectedLink.id}`)
          .set('cookie', authCookie1);

        const resGet = await appRequest
          .get('/links')
          .set('cookie', authCookie1);

        expect(resDelete.status).toBe(200);
        expect(resDelete.body).toStrictEqual({
          status: 'success',
          data: {
            id: selectedLink.id,
            title: selectedLink.title,
            href: selectedLink.href,
            position: expect.any(Number),
            isVisible: true,
          },
        });

        expect(resGet.status).toBe(200);
        expect(resGet.body).toStrictEqual({
          status: 'success',
          data: [
            {
              id: expect.any(String),
              title: user1Links[3].title,
              href: user1Links[3].href,
              position: 1,
              isVisible: true,
            },
            {
              id: expect.any(String),
              title: user1Links[1].title,
              href: user1Links[1].href,
              position: 2,
              isVisible: true,
            },
            {
              id: expect.any(String),
              title: user1Links[0].title,
              href: user1Links[0].href,
              position: 3,
              isVisible: true,
            },
          ],
        });
      });
    });
  });
});
