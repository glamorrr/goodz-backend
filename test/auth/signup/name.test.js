const randomstring = require('randomstring');
const appRequest = require('../../appRequest');

const charset = 'aA@#$.';
const defaultResponseData = {
  name: 'name must be 3 to 25 characters',
};

const testData = [
  {
    message: 'should respond success created 3 chars',
    data: { name: randomstring.generate({ length: 3, charset }) },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond success created 25 chars',
    data: { name: randomstring.generate({ length: 25, charset }) },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond name must not null',
    data: { name: null },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },
  {
    message: 'should respond name must not undefined',
    data: { name: undefined },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },
  {
    message: 'should respond name must not too long',
    data: { name: randomstring.generate({ length: 26, charset }) },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: defaultResponseData,
      },
    },
  },
  {
    message: 'should respond name must not too short',
    data: { name: randomstring.generate({ length: 2, charset }) },
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
  'POST /auth/signup name',
  ({ message, data, expected }) => {
    data.email = randomstring.generate(10) + '@gmail.com';
    data.password = randomstring.generate(15);
    data.url = randomstring.generate(15);
    test(message, async () => {
      const res = await appRequest.post('/auth/signup').send(data);
      expect(res.status).toBe(expected.status);
      expect(res.body).toStrictEqual(expected.body);
    });
  }
);
