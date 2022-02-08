import path from 'path';
import fs from 'fs';
import {writeFile, appendFile} from 'fs/promises';

import { intro, starting, error, fail, finished, code } from './chalkColors.js';
import {checkConnection} from './verifyAWS.js';
import {startingBucket, startingRegion, startingRole, startingFolder} from './default.js';


async function init (id, key, account, region = startingRegion, role = startingRole, bucket = startingBucket, directory = startingFolder, update) {
  // check if .gitignore exists
  if (!fs.existsSync(path.resolve('./.gitignore'))) {

    // if it doesn't exist, create it with .env
    await writeFile('./.gitignore', '.env')
      .catch(err => {
        console.log(error(`Error in creating ./.gitignore : ${err.message}`));
        return;
      });
    console.log('.gitignore Created');
  }

  else {
    // if it does exist, read gitignore
    fs.readFile('./.gitignore', async (err, data) => {
        
      // check for .env and add if it doesn't
      if (!data.includes('.env')) {

        //append onto gitignore
        await appendFile('./.gitignore', '.env')
          .catch(err => {
            console.log(error(`Error in appending to ./.gitignore : ${err.message}`));
          });
        console.log('.env Added');
      }
    });
  }
  
  const accountId = await checkConnection(id, key, account, region);
  if (!accountId) return; 
  
  // remove slash if folder contains a slash as last char
  if (directory[directory.length - 1] === '/') directory = directory.slice(0, directory.length - 1);

  // create the aws credentials string
  const awsID = `AWS_ACCESS_KEY_ID=${id}\n`;
  const awsKey = `AWS_SECRET_ACCESS_KEY=${key}\n`;
  const awsAccount = `AWS_ACCOUNT=${accountId}\n`;
  const awsRegion = `AWS_REGION=${region}\n`;
  const s3Bucket = `S3BUCKETNAME=${bucket}\n`;
  const awsRole = `ROLENAME=${role}\n`;
  const folder = `FOLDER=${directory}\n`;

  // check if .env exists
  if (!fs.existsSync(path.resolve('./.env'))) {
    //if it doesn't exist, create it with .env
    await writeFile('./.env', awsID + awsKey + awsAccount + awsRegion + s3Bucket + awsRole + folder)
      .catch(err => {
        console.log(error(`Error writing to the file ./.env : ${err.message}`));
        return;
      });
    console.log('.env Created');
    console.log(finished('AWS configuration finished!'));
  }
  else {

    //if it does exist, check for check for aws credentials
    fs.readFile('./.env', 'utf8', async (err, data) => {

      // if there is an option to update
      if (update) {
        // split up the data into an array
        const data_array = data.split('\n');
        // use a helper function to determine the data to delete
        const textLine = (text) => {
          for (let i = 0; i < data_array.length; i++) {
            if (data_array[i] && data_array[i].match(text)) {
              return i;
            }
          }
        };
        // delete the three main arguments
        delete data_array[textLine('AWS_ACCESS_KEY_ID')];
        delete data_array[textLine('AWS_SECRET_ACCESS_KEY')];
        delete data_array[textLine('AWS_ACCOUNT')];
        // if there are options
        if (region !== startingRegion) delete data_array[textLine('AWS_REGION')];
        if (role && role !== startingRole) delete data_array[textLine('ROLENAME')];
        if (bucket && bucket !== startingBucket) delete data_array[textLine('S3BUCKETNAME')];

        // turn back into string while ignoring whitespaces
        data = '';
        data_array.forEach(el => {
          if (el !== '') data += el + '\n';
        });
      }

      // add all updated parameters
      if (!data.includes('AWS_ACCESS_KEY_ID')) {
        data += awsID;
        console.log('AWS Access Key ID Added');
      }
      if (!data.includes('AWS_SECRET_ACCESS_KEY')) {
        data += awsKey;
        console.log('AWS Secret Access Key Added');
      }
      if (!data.includes('AWS_ACCOUNT')) {
        data += awsAccount;
        console.log('AWS Account Added');
      }
      if (!data.includes('AWS_REGION')) {
        data += awsRegion;
        console.log('AWS Region Added');
      }
      if (!data.includes('ROLENAME')) {
        data += awsRole;
        console.log('Role Name Added');
      }
      if (!data.includes('S3BUCKETNAME')) {
        data += s3Bucket;
        console.log('S3 Bucket Name Added');
      }
      if (!data.includes('FOLDER')) {
        data += folder;
        console.log('Folder Name Added');
      }

      //write it back to the .env file
      await writeFile('./.env', data)
        .catch(err => {
          console.log(error(`Error in modifying ./.env : ${err.message}`));
          return;
        });

      console.log('.env finished!');
      console.log(finished('AWS configuration finished!'));
    });
  }
}

export default init;