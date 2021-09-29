module.exports = async (appRequest) => {
  describe('POST /links', () => {
    test('should respond success added link', async () => {
      const resLogin = await appRequest
        .post('/auth/login')
        .send({ email: 'mcdindonesia@gmail.com', password: 'mcdindonesia' });

      const authCookie = resLogin.header['set-cookie'][0];
      const linkData = { title: 'McD Indonesia', href: 'mcdindo.com' };
      const resAddLink = await appRequest
        .post('/links')
        .set('cookie', authCookie)
        .send(linkData);

      expect(resAddLink.status).toBe(201);
      expect(resAddLink.body.status).toBe('success');
      expect(resAddLink.body.data.id).toBeDefined();
      expect(resAddLink.body.data.title).toBe(linkData.title);
      expect(resAddLink.body.data.href).toBe(linkData.href);
      expect(resAddLink.body.data.position).toBe(1);
      expect(resAddLink.body.data.isVisible).toBe(true);
      expect(resAddLink.body.data.storeId).toBeDefined();
    });

    test('should respond success add link 4 times and postion=4', async () => {
      const resLogin = await appRequest
        .post('/auth/login')
        .send({ email: 'kfcindonesia@gmail.com', password: 'kfcindonesia' });

      const authCookie = resLogin.header['set-cookie'][0];
      const linkData = { title: 'KFC Indonesia', href: 'https://kfcku.com' };
      await appRequest.post('/links').set('cookie', authCookie).send(linkData);
      await appRequest.post('/links').set('cookie', authCookie).send(linkData);
      await appRequest.post('/links').set('cookie', authCookie).send(linkData);
      const resAddLink = await appRequest
        .post('/links')
        .set('cookie', authCookie)
        .send(linkData);

      expect(resAddLink.status).toBe(201);
      expect(resAddLink.body.status).toBe('success');
      expect(resAddLink.body.data.id).toBeDefined();
      expect(resAddLink.body.data.title).toBe(linkData.title);
      expect(resAddLink.body.data.href).toBe(linkData.href);
      expect(resAddLink.body.data.position).toBe(4);
      expect(resAddLink.body.data.isVisible).toBe(true);
      expect(resAddLink.body.data.storeId).toBeDefined();
    });

    test('should respond fail unauthenticated', async () => {
      const linkData = { title: 'KFC Indonesia', href: 'https://kfcku.com' };
      const resAddLink = await appRequest
        .post('/links')
        .set('cookie', 'WRONG_AUTH_TOKEN')
        .send(linkData);

      expect(resAddLink.status).toBe(401);
      expect(resAddLink.body.status).toBe('fail');
      expect(resAddLink.body.data.message).toBe('unauthenticated');
    });
  });
};
