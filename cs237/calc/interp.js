'use strict';
var map = {};

function interp(ast) {
    map = {};
    return calc(ast);
}

function calc(ast)
{
    //switch(typeof ast){
    switch (ast.constructor.name) {
        case 'Num':
            return ast.n;
        case 'Prog': {
            for (var i = 0 ; i < ast.es.length-1 ; i++) {
                calc(ast.es[i]);
                //console.log(JSON.stringify(ast.es[0]));
            }
            return calc(ast.es[ast.es.length-1]);
        }
        case 'Mul':
            return calc(ast.e1) * calc(ast.e2);
        case 'Div':
            return calc(ast.e1) / calc(ast.e2);
        case 'Pow':
            return Math.pow(calc(ast.e1),calc(ast.e2));
        case 'Add':
            return calc(ast.e1) + calc(ast.e2);
        case 'Sub':
            return calc(ast.e1) - calc(ast.e2);
        case 'Assign': {
            map[ast.x] = calc(ast.e);
            return map[ast.x];
        }
        case 'Ref': {
            if (!(ast.x in map))
                map[ast.x] = 0;
            return map[ast.x];
        }
        default:
            return 0;
    }
  //throw new TODO("You're supposed to write your own calcreter!");
}

