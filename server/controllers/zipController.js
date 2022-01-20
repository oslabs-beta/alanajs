import path, {dirname} from 'path';
import fs, { ReadStream } from 'fs';
import {writeFile} from 'fs/promises';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


const zipController = {};

// FuncName: zip
// Description: this will zip all the files with the first file being index.js and the rest as is.
// input:
// req.body.fileArr - an array of file names as strings. the first element will be turned to index.js
//
// output:
// res.locals.outputZip - the output zip file name as a string
//
zipController.zip = (req, res, next) => {
  console.log('    using zipController.zip');

  const fileArr = req.body.fileArr;
  
  // create the zip instance
  const jszip = new JSZip();

  // breaks up fileArr into the first file and the rest
  const [index, ...args] = fileArr;
  
  // adds the first file as index.js
  let stream = fs.createReadStream('LambdaFunctions/' + index);
  jszip.file('index.js', stream);

  //iterate over the remaining file names in fileArr and add them as their original names
  for (const file of args) {
    stream = fs.createReadStream('LambdaFunctions/' + file);
    jszip.file(file, stream);
  }

  // create the output zip file based on the index file name
  jszip.generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream(index + '.zip'))
    .on('finish', () => {
      console.log(`    ${index}.zip written.`);
      res.locals.outputZip = index + '.zip';
      next();
    });
};


// FuncName: zip
// Description: this will zip all the files with the first file being index.js and the rest as is.
// input:
// fileArr - an array of file names as strings. the first element will be turned to index.js
//
// returns:
// the output zip file name (string)
//
zipController.zip2 = async (fileArr) => {
  console.log('    using zipController.zip2');

  console.log(path.resolve('LambdaFunctions/'));
  // fileArr = [fileArr];
  console.log('fileArr', fileArr);
  // create the zip instance
  const jszip = new JSZip();

  // breaks up fileArr into the first file and the rest
  const [index, ...args] = fileArr;

  // adds the first file as index.js
  let stream = fs.createReadStream(path.join('../LambdaFunctions/') + '/' + index);
  jszip.file('index.js', stream);
  // console.log(stream);

  //iterate over the remaining file names in fileArr and add them as their original names
  for (const file of args) {
    stream = fs.createReadStream(path.join('../LambdaFunctions/') + '/' + file);
    jszip.file(file, stream);
  }

  const response = await jszip.generateAsync({type:'nodebuffer'}); //promise to generate zipfile w/ type of nodebuffer
  console.log(response);
  
  await writeFile(index + '.zip', response); //use fs/promise so writeFile will return promise, so await will work
  console.log('finished writing zip file');
  return `${index}.zip`;
};

export default zipController;