//example file

import url from 'url';

exports.handler = (event) => {
   
  const website = 'https://www.google.com';
  const a = url.parse(website, true);

  // show that it can have node dependencies
  console.log(a.host);

  // show that we can get info from the input payload
  const temp = event.num + 3;
  console.log('the number from event.num is now', temp);
  const response = {
    statusCode: 200,
    body: JSON.stringify(temp),
  };
  return response;
};