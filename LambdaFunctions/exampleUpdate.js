exports.handler = (event) => {
  
  // show that we can get info from the input payload
  const temp = event.num + 70;
  console.log('the number from event.num is now', temp);
  const response = {
    statusCode: 200,
    body: JSON.stringify(temp),
  };
  return response;
};