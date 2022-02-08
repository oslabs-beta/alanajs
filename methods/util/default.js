const random = (length = 6) => {
  return Math.random().toString(16).slice(2, length);
};

const startingRegion = 'us-east-1';
const startingRole = 'defaultLambdaRole';
const startingBucket = 'defaultbucket-' + random();
const startingFolder = '';

export { startingRegion, startingRole, startingBucket, startingFolder};