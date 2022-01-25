import path, {dirname} from 'path';
import fs, { ReadStream } from 'fs';
import {writeFile} from 'fs/promises';
import JSZip from 'jszip';
import archiver from 'archiver';
import {finished as finishedStreamWriting} from 'stream/promises';

import { starting, code, error } from './util/chalkColors.js';
const zip = {};


// FuncName: zip
// Description: this will zip all the files with the first file being index.js and the rest as is.
// input:
// fileArr - an array of file names as strings. the first element will be turned to index.js
// outputFileName - (optional) the output file name
//
// returns:
// the output zip file name (string)
//
zip.zipFiles = async (fileArr, outputFileName) => {

  // create the zip instance
  const jszip = new JSZip();

  // breaks up fileArr into the first file and the rest
  const [index, ...args] = fileArr;

  // if there's no specified output filename, set it to index
  if (!outputFileName) outputFileName = index;

  console.log(starting(`Adding the following files to the output zip file "${outputFileName}.zip" : `));
  console.log(code(`     ${index}`));

  // adds the first file as index.js
  let stream = fs.createReadStream(path.join('LambdaFunctions/') + '/' + index);
  jszip.file('index.js', stream);

  //iterate over the remaining file names in fileArr and add them as their original names
  for (const file of args) {
    console.log(code(`     ${file}`));
    stream = fs.createReadStream(path.join('LambdaFunctions/') + '/' + file);
    jszip.file(file, stream);
  }

  // promise to generate zipfile w/ type of nodebuffer
  const response = await jszip.generateAsync({type:'nodebuffer'}); 
  
  // use fs/promise so writeFile will return promise, so await will work
  await writeFile(outputFileName + '.zip', response); 
  console.log('  finished writing zip file\n');
  return `${outputFileName}.zip`;
};

//.should zip files and folders
zip.zipFiles2 = async (fileArr, outputFileName) => {

  // breaks up fileArr into the first file and the rest
  const [index, ...args] = fileArr;

  // if there's no specified output filename, set it to index
  if (!outputFileName) outputFileName = index;
  console.log('this is outputFileName',outputFileName );

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
      console.log(err);
    } else{
      console.log('output finished writing');
    }
  });

  return `${outputFileName}.zip`;
};


export default zip;