//example file

import url from 'url';

exports.handler = (event) => {
   
  const website = 'https://www.yahoo.com';
  const a = url.parse(website, true);

  // show that it can have node dependencies
  console.log(a.host);

  //version2? 

  // show that we can get info from the input payload
  const temp = event.num + 3;
  console.log('test 15 the is a num from npm package test', temp);
  const response = {
    statusCode: 200,
    body: JSON.stringify(temp),
  };
  return response;
};