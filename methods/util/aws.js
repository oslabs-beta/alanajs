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

const awsParams = {
  'region': region,
  'credentials': credentials,
};

//gets the .env bucket name and awsRole
const awsBucket = process.env.S3BUCKETNAME;

const awsRole = process.env.ARNNAME;

export {awsParams, awsBucket, awsRole};