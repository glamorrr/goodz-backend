const path = require('path');
const appRequest = require('../../appRequest');

const assetPath = path.join(__dirname, '../../assets');

describe('POST /store/image', () => {
  let authCookie1;

  beforeAll(async () => {
    const email1 = 'poststoreimage@gmail.com';
    const password1 = 'poststoreimage';

    await appRequest.post('/auth/signup').send({
      email: email1,
      password: password1,
      name: 'Post store image 1',
      url: 'poststoreimage',
    });

    const resLogin1 = await appRequest
      .post('/auth/login')
      .send({ email: email1, password: password1 });
    authCookie1 = resLogin1.header['set-cookie'][0];
  });

  describe('unauthenticated', () => {
    test('should respond fail', async () => {
      const res = await appRequest
        .post(`/store/image`)
        .attach('image', path.join(assetPath, '3MB.jpg'));

      expect(res.status).toBe(401);
      expect(res.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'unauthenticated',
        },
      });
    });
  });

  describe('authenticated AND authorized', () => {
    describe('should respond success', () => {
      test('send valid data', async () => {
        const res = await appRequest
          .post(`/store/image`)
          .attach('image', path.join(assetPath, '3MB.jpg'))
          .set('cookie', authCookie1);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          status: 'success',
          data: {
            id: expect.any(String),
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

    describe('should respond fail', () => {
      test('send no attachment', async () => {
        const res = await appRequest
          .post(`/store/image`)
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
