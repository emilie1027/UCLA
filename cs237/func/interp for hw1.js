'use strict';

function interp(ast) {
    var env = [];
    return calc(ast, env);
}

function calc(ast, env) {
    switch(ast.constructor.name) {
        case 'Val': {
            return ast.primValue;
        }
        case 'Var': {
            if (ast.x in env)
                return env[ast.x];
            else return;
        }
        case 'BinOp': {
            var v1 = calc(ast.e1, env);
            var v2 = calc(ast.e2, env);
            //console.log(v1);
            //console.log(v2);
            if (!isNaN(v1) && !isNaN(v2)) {
                switch(ast.op) {
                    case '+':
                        return v1 + v2;
                    case '-':
                        return v1 - v2;
                    case '*':
                        return v1 * v2;
                    case '/':
                        return v1 / v2;
                    case '%':
                        return v1 % v2;
                    case '^':
                        return Math.pow(v1,v2);
                    case '=':
                        return v1 == v2;
                    case '==':
                        return v1 == v2;
                    case '!=':
                        return v1 != v2;
                    case '<':
                        return v1 < v2;
                    case '>':
                        return v1 > v2;
                    case '||':
                        return v1 || v2;
                    case '&&':
                        return v1 && v2;
                    default:
                        return;
                }
            }
            else
                return;
        }
        case 'If': {
            if(calc(ast.e1, env) === true)
                return calc(ast.e2, env);
            else
                return calc(ast.e3, env);
        }
        /* recursive let requires environment created here pass into its inner function
         */
        case 'Let': {
            var envTemp = [];
            for (var i in env)
                envTemp[i] = env[i];
            //console.log(env);
            envTemp[ast.x] = calc(ast.e1, env);
            //console.log(ast.e2);
            //console.log(envTemp);
            return calc(ast.e2, envTemp);
        }
        case 'Fun': {
            //console.log(ast.xs);
            //console.log(ast.e);
            //console.log(env);
            var envTemp = [];
            for (var i in env)
                envTemp[i] = env[i];
            //console.log(envTemp);
            var clos = new Closure(ast.xs, ast.e, envTemp);
            //map[ast.xs] = clos;
            return clos;
        }
        case 'Call': {
            //console.log(JSON.stringify(ast.es));
            envTemp = [];
            for (var i = 0 ; i < ast.es.length ; i++) {
                envTemp[i] = calc(ast.es[i], env);
            }
            //console.log(envTemp.length);
            var respond = calc(ast.ef, env);
            //console.log(respond);
            //console.log(envTemp);
            if (respond instanceof Closure) {
                return calc(respond, envTemp);
            }
            return respond;
        }
        case 'Closure': {
            if (ast.xs.length != env.length) {
                return;
            }
            //console.log(ast.env);
            var envTemp = [];
            for (var i in ast.env) {
                envTemp[i] = ast.env[i];
            }
            //console.log(envTemp);
            for (var i = 0 ; i < ast.xs.length ; i++) {
                envTemp[ast.xs[i]] = env[i];
            }
            //console.log(ast.e);
            //console.log(envTemp);
            return calc(ast.e, envTemp);
        }
        default:
            return;
    }
    
  //throw new TODO("You're supposed to write your own calcreter!");
}

/*
 cases:
 4 == 7
 (fun x -> x1+x2 + 3) 3 4
 
 
 */
