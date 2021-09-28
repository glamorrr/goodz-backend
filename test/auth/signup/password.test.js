const randomstring = require('randomstring');

module.exports = (appRequest) => {
  const defaultResponseData = {
    password: 'password must be 8 to 30 characters',
  };

  const testData = [
    {
      message: 'should respond success created 8 chars',
      data: { password: randomstring.generate(8) },
      expected: {
        status: 201,
        body: {
          status: 'success',
          data: null,
        },
      },
    },
    {
      message: 'should respond success created 30 chars',
      data: { password: randomstring.generate(30) },
      expected: {
        status: 201,
        body: {
          status: 'success',
          data: null,
        },
      },
    },

    {
      message: 'should respond password must not null',
      data: { password: null },
      expected: {
        status: 400,
        body: {
          status: 'fail',
          data: defaultResponseData,
        },
      },
    },
    {
      message: 'should respond password must not undefined',
      data: { password: undefined },
      expected: {
        status: 400,
        body: {
          status: 'fail',
          data: defaultResponseData,
        },
      },
    },

    {
      message: 'should respond password must not too long',
      data: { password: randomstring.generate(31) },
      expected: {
        status: 400,
        body: {
          status: 'fail',
          data: defaultResponseData,
        },
      },
    },
    {
      message: 'should respond password must not too short',
      data: { password: randomstring.generate(7) },
      expected: {
        status: 400,
        body: {
          status: 'fail',
          data: defaultResponseData,
        },
      },
    },
  ];

  describe.each(testData)('password', ({ message, data, expected }) => {
    data.email = randomstring.generate(10) + '@gmail.com';
    data.url = randomstring.generate(15);
    data.name = randomstring.generate({
      length: 20,
      charset: 'aA@#$.',
    });
    test(message, async () => {
      const res = await appRequest.post('/auth/signup').send(data);
      expect(res.status).toBe(expected.status);
      expect(res.body).toStrictEqual(expected.body);
    });
  });
};
