exports.handler = async (event, context) => {
  console.log('hello!', event);
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from updated Lambda function created by ALANA.js!'),
  };
  return response;
};
