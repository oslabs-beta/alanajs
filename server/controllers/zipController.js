import path from 'path';
import fs, { ReadStream } from 'fs';
import JSZip from 'jszip';

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
  let index, args;
  [index, ...args] = fileArr;
  
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

export default zipController;