#!/usr/bin/env node
import { program, Command } from 'commander';
import lambda from '../methods/lambda.js';
import s3 from '../methods/s3.js';
import zip from '../methods/zip.js';

program
  .command('list')
  .description('list lambda functions')
  .action(() => {
    lambda.getFuncList();
  });

//node cli delete <funcname>
program
  .command('delete')
  .argument('<funcName>')
  .argument('[qualifier]')
  .description('delete lambda function')
  .action( (funcName, qualifier) => {
    // console.log('in delete');
    lambda.deleteFunction(funcName, qualifier);
  });

program
  .command('create')
  .argument('<funcName>')
  .argument('<fileArr>')
  .description('zip and create lambda function')
  .action(async (funcName, fileArr) => {
    // console.log('in create');
    const outputZip = `${fileArr}.zip`;
    await zip.zipFiles(fileArr);
    await s3.sendFile(outputZip);
    lambda.createFunction(outputZip, funcName);
  });

program
  .command('update')
  .argument('<funcName>')
  .argument('<fileArr>')
  .description('zip and update lambda function')
  .action(async (funcName, fileArr) => {
    // console.log('in update');
    const outputZip = `${fileArr}.zip`;
    await zip.zipFiles(fileArr);
    await s3.sendFile(outputZip);
    lambda.updateFunction(outputZip, funcName);
  });

program.parse(process.argv);