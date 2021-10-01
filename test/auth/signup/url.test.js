const randomstring = require('randomstring');
const appRequest = require('../../appRequest');

const defaultResponseData = {
  url: 'url must be 3 to 25 characters',
};

const testData = [
  {
    message: 'should respond success',
    data: { url: 'kfcindonesia' },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond url has already been taken',
    data: { url: 'kfcIndonesia' },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: { url: 'url has already been taken' },
      },
    },
  },
  {
    message: 'should respond success created 25 chars',
    data: { url: randomstring.generate(25) },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond url must not null',
    data: { url: null },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },
  {
    message: 'should respond url must not undefined',
    data: { url: undefined },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },

  {
    message: 'should respond url must not too long',
    data: { url: randomstring.generate(26) },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },
  {
    message: 'should respond url must not too short',
    data: { url: randomstring.generate(2) },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },
];

describe.each(testData)(
  'POST /auth/signup url',
  ({ message, data, expected }) => {
    data.email = randomstring.generate(10) + '@gmail.com';
    data.password = randomstring.generate(15);
    data.name = randomstring.generate({
      length: 20,
      charset: 'aA@#$.',
    });
    test(message, async () => {
      const res = await appRequest.post('/auth/signup').send(data);
      expect(res.status).toBe(expected.status);
      expect(res.body).toStrictEqual(expected.body);
    });
  }
);
