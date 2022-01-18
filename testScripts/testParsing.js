import path from 'path'

function funcDef(num) {
    path.resolve('..', 'string')
  return num + 2;
}

export default funcDef;

const arrowFunc = (num) => {
    return num + 2;
  };

const defaultString = `exports.handler = async (event) => {`

console.log(funcDef);
console.log(funcDef.toString());

console.log(arrowFunc);
console.log(arrowFunc.toString());

//pull out all in parens,
//parsing algorithm will currently only accept variable definitions, not callbacks 

//look for open curly bracket



