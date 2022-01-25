import path, {dirname} from 'path';
import fs, { ReadStream } from 'fs';
import archiver from 'archiver';

import { starting, code, error, finished } from './util/chalkColors.js';
import {finished as finishedStreamWriting} from 'stream/promises';

const archiveZip = {};


//should zip files and folders
archiveZip.zipFiles = async (fileArr, outputFileName) => {

  // breaks up fileArr into the first file and the rest
  const [index, ...args] = fileArr;

  // if there's no specified output filename, set it to index
  if (!outputFileName) outputFileName = index;

  console.log(starting(`Adding the following files/directories to the output zip file "${outputFileName}.zip" : `));
  console.log(code(`     ${index}`));

  // create a file to stream archive data to.
  const output = fs.createWriteStream(`${outputFileName}.zip`);

  const archive = archiver('zip');

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // adds the first file as index.js
  const stream = fs.createReadStream(path.join('LambdaFunctions/') + '/' + index);
  archive.file(path.join('LambdaFunctions/') + '/' + index, {name: 'index.js'});

  //iterate over the remaining file names in fileArr and add them as their original names
  for (const file of args) {
    console.log(code(`     ${file}`));
    const stats = fs.statSync(path.join('LambdaFunctions/') + '/' + file);
    if (stats.isDirectory()) archive.directory(`LambdaFunctions/${file}/`, file);
    else archive.file(`${file}`, {name: `${file}`});
  }
  // pipe archive data to the file
  archive.pipe(output);

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  await archive.finalize();
  
  const data = await finishedStreamWriting(output, {}, (err) => {
    if(err){
      console.log(error('Error while zipping up file: ', err));
    } else{
      console.log('Output finished writing');
    }
  });

  return `${outputFileName}.zip`;
};

  
export default archiveZip;