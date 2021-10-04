const appRequest = require('../../appRequest');

describe('PUT /links/:id', () => {
  let userAuthCookie1;
  let userAuthCookie2;
  let selectedLinkId;

  beforeAll(async () => {
    await appRequest.post('/auth/signup').send({
      email: 'updatelink1@gmail.com',
      password: 'updatelink1',
      name: 'Test update Link',
      url: 'edl11',
    });
    await appRequest.post('/auth/signup').send({
      email: 'updatelink2@gmail.com',
      password: 'updatelink2',
      name: 'Test update Link 2',
      url: 'edl22',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email: 'updatelink1@gmail.com', password: 'updatelink1' });
    userAuthCookie1 = resLogin1.header['set-cookie'][0];

    const resLogin2 = await appRequest
      .post('/auth/login')
      .send({ email: 'updatelink2@gmail.com', password: 'updatelink2' });
    userAuthCookie2 = resLogin2.header['set-cookie'][0];

    await appRequest
      .post('/links')
      .send({
        title: 'Link 1',
        href: 'link1.com',
      })
      .set('cookie', userAuthCookie1);
    const resLink2 = await appRequest
      .post('/links')
      .send({
        title: 'Link 2',
        href: 'link2.org',
      })
      .set('cookie', userAuthCookie1);
    await appRequest
      .post('/links')
      .send({
        title: 'Link 3',
        href: 'link3.go.id',
      })
      .set('cookie', userAuthCookie1);

    selectedLinkId = resLink2.body.data.id;
  });

  test('should respond success update link', async () => {
    const res = await appRequest
      .put(`/links/${selectedLinkId}`)
      .send({
        title: 'Link 2 New',
        href: 'link2.my.id',
        isVisible: true,
      })
      .set('cookie', userAuthCookie1);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        title: 'Link 2 New',
        href: 'link2.my.id',
        isVisible: true,
      },
    });
  });

  test('should respond fail no resource found', async () => {
    const notFoundLinkId = selectedLinkId.replace(/[a-zA-Z]/, 'b');
    const res = await appRequest
      .put(`/links/${notFoundLinkId}`)
      .send({
        title: 'Link 2 New',
        href: 'link2.my.id',
        isVisible: true,
      })
      .set('cookie', userAuthCookie1);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      status: 'fail',
      data: {
        message: 'link not found',
      },
    });
  });

  test('should respond fail not authenticated', async () => {
    const res = await appRequest.put(`/links/${selectedLinkId}`).send({
      title: 'Link 2 New',
      href: 'link2.my.id',
      isVisible: true,
    });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: { message: 'unauthenticated' },
    });
  });

  test('should respond fail unauthorized (user try changing another user link)', async () => {
    const res = await appRequest
      .put(`/links/${selectedLinkId}`)
      .send({
        title: 'Link 2 New',
        href: 'link2.my.id',
        isVisible: true,
      })
      .set('cookie', userAuthCookie2);

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      status: 'fail',
      data: {
        message: 'unauthorized',
      },
    });
  });

  test('should respond fail (send: empty object)', async () => {
    const res = await appRequest
      .put(`/links/${selectedLinkId}`)
      .send({})
      .set('cookie', userAuthCookie1);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'fail',
      data: {
        title: 'name must be 3 to 50 characters',
        href: 'url must be a valid url',
        isVisible: 'isVisible must be boolean',
      },
    });
  });
});
