const layerFunction = require('layer.js');

exports.handler = async (event, context) => {
  console.log('hello!', event);
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda function created by ALANA.js! ' + layerFunction()),
};
return response;
};
  