#!/usr/bin/env node

import { program } from 'commander';
import lambdaController from '../server/controllers/lambdaController.js';
import zipController from '../server/controllers/zipController.js';
import s3Controller from '../server/controllers/s3Controller.js';

//node cli -ls
program
  .option('-ls, --list', 'list lambda functions')
  .action((options, command) => {
    lambdaController.getFuncList2();
  });

//node cli example.js cliTesting12 -c
program
  .argument('<fileArr>')
  .argument('<funcName>')
  .option('-c, --create', 'zip and create lambda function')
  .action(async (fileArr, funcName, options, command) => {
    console.log('funcName', funcName);

    const outputZip = `${fileArr}.zip`;
    await zipController.zip2(fileArr);
    await s3Controller.sendFile2(outputZip);
    lambdaController.createFunction2(outputZip, funcName);
    lambdaController.updateFunction2(outputZip, funcName);

});

program.parse(process.argv);