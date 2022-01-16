function funcDef(num) {
  return num + 2;
}

const arrowFunc = (num) => {
    return num + 2;
  };

const defaultString = `exports.handler = async (event) => {`

console.log(funcDef);
console.log(funcDef.toString());

console.log(arrowFunc);
console.log(arrowFunc.toString());