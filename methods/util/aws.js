// set up .env file accessibility
import dotenv from 'dotenv';
dotenv.config();

// root user credentials
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// set up AWS region
const region = process.env.AWS_REGION;

const AwsParams = {
  'region': region,
  'credentials': credentials,
};

// the basic policy needed from AWS in order to create a role for lambda
const BasicPolicy = {
  'Version': '2012-10-17',
  'Statement': [
    {
      'Effect': 'Allow',
      Principal: {
        Service: 'lambda.amazonaws.com',
      },
      'Action': 'sts:AssumeRole',
    }
  ]
};
const LambdaBasicARN = 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole';

//gets the .env bucket name and awsRole
const AwsBucket = process.env.S3BUCKETNAME;
const AwsRole = process.env.ARNNAME;

export {AwsParams, AwsBucket, AwsRole, BasicPolicy, LambdaBasicARN};