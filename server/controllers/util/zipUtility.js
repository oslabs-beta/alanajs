import path from 'path';
import fs, { ReadStream } from 'fs';
import JSZip from 'jszip';

const zip = (fileArr) => {
  console.log('    Running zip...');
  
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
    .on('finish', () => console.log(`    ${index}.zip written.`));

  return index + '.zip';
};

export default zip;