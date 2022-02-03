// set up .env file accessibility
import dotenv from 'dotenv';
dotenv.config();

// root user credentials
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// set up AWS region
const AwsRegion = process.env.AWS_REGION;

const AwsParams = {
  'region': AwsRegion,
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

// default ARNs
const LambdaBasicARN = 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole';

//gets the .env bucket name and awsRole
const AwsBucket = process.env.S3BUCKETNAME;
const AwsRole = process.env.ROLENAME;
const AwsAccount = process.env.AWS_ACCOUNT;



export {AwsAccount, AwsParams, AwsBucket, AwsRegion, AwsRole, BasicPolicy, LambdaBasicARN};
