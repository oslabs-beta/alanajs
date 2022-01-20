#!/usr/bin/env node

import { program, Command } from 'commander';
import lambdaController from '../server/controllers/lambdaController.js';
import zipController from '../server/controllers/zipController.js';
import s3Controller from '../server/controllers/s3Controller.js';


program
  .command('list')
  .description('list lambda functions')
  .action(() => {
    lambdaController.getFuncList2();
  });

//node cli delete <funcname>
program
  .command('delete')
  .argument('<funcName>')
  .argument('[qualifier]')
  .description('delete lambda function')
  .action( (funcName, qualifier) => {
    // console.log('in delete');
    lambdaController.deleteFunction2(funcName, qualifier);
  });

program
  .command('create')
  .argument('<funcName>')
  .argument('<fileArr>')
  .description('zip and create lambda function')
  .action(async (funcName, fileArr) => {
    // console.log('in create');
    const outputZip = `${fileArr}.zip`;
    await zipController.zip2(fileArr);
    await s3Controller.sendFile2(outputZip);
    lambdaController.createFunction2(outputZip, funcName);
  });

program
  .command('update')
  .argument('<funcName>')
  .argument('<fileArr>')
  .description('zip and update lambda function')
  .action(async (funcName, fileArr) => {
    // console.log('in update');
    const outputZip = `${fileArr}.zip`;
    await zipController.zip2(fileArr);
    await s3Controller.sendFile2(outputZip);
    lambdaController.updateFunction2(outputZip, funcName);
  });

program.parse(process.argv);