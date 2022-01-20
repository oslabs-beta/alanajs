import path, {dirname} from 'path';
import fs, { ReadStream } from 'fs';
import {writeFile} from 'fs/promises';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


const zip = {};


// FuncName: zip
// Description: this will zip all the files with the first file being index.js and the rest as is.
// input:
// fileArr - an array of file names as strings. the first element will be turned to index.js
//
// returns:
// the output zip file name (string)
//
zip.zipFiles = async (fileArr) => {
  console.log('    using zipController.zip2');
  
  fileArr = [fileArr];

  console.log('fileArr', fileArr);
  // create the zip instance
  const jszip = new JSZip();

  // breaks up fileArr into the first file and the rest
  const [index, ...args] = fileArr;

  // adds the first file as index.js
  let stream = fs.createReadStream(path.join('LambdaFunctions/') + '/' + index);
  jszip.file('index.js', stream);

  //iterate over the remaining file names in fileArr and add them as their original names
  for (const file of args) {
    stream = fs.createReadStream(path.join('LambdaFunctions/') + '/' + file);
    jszip.file(file, stream);
  }

  // promise to generate zipfile w/ type of nodebuffer
  const response = await jszip.generateAsync({type:'nodebuffer'}); 
  console.log(response);
  
  // use fs/promise so writeFile will return promise, so await will work
  await writeFile(index + '.zip', response); 
  console.log('finished writing zip file');
  return `${index}.zip`;
};

export default zip;