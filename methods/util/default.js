const random = (length = 6) => {
  return Math.random().toString(16).substr(2, length);
};

export const startingRegion = 'us-east-1';
export const startingRole = 'defaultLambdaRole';
export const startingBucket = 'defaultbucket' + random();