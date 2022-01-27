const random = (length = 6) => {
  return Math.random().toString(16).substr(2, length);
};

const startingRegion = 'us-east-1';
const startingRole = 'defaultLambdaRole';
const startingBucket = 'defaultbucket-' + random();
// const startingBucket = 'defaultbucketny30';

export { startingRegion, startingRole, startingBucket};