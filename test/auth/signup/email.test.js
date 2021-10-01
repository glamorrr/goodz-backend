const randomstring = require('randomstring');
const appRequest = require('../../appRequest');

const emailIsNotValidResponseData = {
  email: 'email must be a valid email address',
};

const testData = [
  {
    message: 'should respond success created ',
    data: { email: 'johndoe@gmail.com' },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond email has already been taken',
    data: { email: 'johndoe@gmail.com' },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: { email: 'email has already been taken' },
      },
    },
  },
  {
    message: 'should respond success created 10 chars',
    data: { email: 'm@gmail.co' },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond success created 50 chars',
    data: { email: randomstring.generate(40) + '@gmail.com' },
    expected: {
      status: 201,
      body: {
        status: 'success',
        data: null,
      },
    },
  },
  {
    message: 'should respond email must be a valid email address',
    data: { email: 'johndoegmail.com' },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: emailIsNotValidResponseData,
      },
    },
  },
  {
    message: 'should email not null ',
    data: { email: null },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: emailIsNotValidResponseData,
      },
    },
  },
  {
    message: 'should email not undefined ',
    data: { email: undefined },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: emailIsNotValidResponseData,
      },
    },
  },
  {
    message: 'should email is not too short',
    data: { email: 'a' + '@gma.co' },
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: { email: 'email must be 10 to 50 characters' },
      },
    },
  },
  {
    message: 'should email is not too long',
    data: { email: randomstring.generate(41) + '@gmail.com' }, // 51 chars
    expected: {
      status: 400,
      body: {
        status: 'fail',
        data: { email: 'email must be 10 to 50 characters' },
      },
    },
  },
];

describe.each(testData)(
  'POST /auth/signup email',
  ({ message, data, expected }) => {
    data.password = randomstring.generate(10);
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
  }
);
