const handleSuccess = (data = null) => {
  return {
    status: 'success',
    data,
  };
};

const handleFail = (data = null) => {
  return {
    status: 'fail',
    data,
  };
};

const handleError = (err = null) => {
  console.error(err);
  return {
    status: 'error',
    message: 'Oops! Something went wrong. Please try again later.',
  };
};

module.exports = {
  handleSuccess,
  handleFail,
  handleError,
};
