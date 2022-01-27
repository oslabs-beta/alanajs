import path, {dirname} from 'path';
import fs, { ReadStream } from 'fs';
import {writeFile} from 'fs/promises';
import JSZip from 'jszip';
// import archiver from 'archiver';

import { starting, code, error } from './chalkColors.js';
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

  console.log('the index ', index);

  console.log('outputFileName', outputFileName);
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

export default zip;