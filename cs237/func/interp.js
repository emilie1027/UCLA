'use strict';
var that = this;
function interp(ast) {
    var env = [];
    return calc(ast, env);
}

function calc(ast, env) {
    if (!isNaN(ast))
        return ast;
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
            if (!isNaN(v1) && !isNaN(v2)) {
                switch(ast.op) {
                    case '+': case '-': case '*': case '/': case '%': case '!=': case '<': case '>': case '||': case '&&':
                        return eval("v1" + ast.op + "v2");
                    case '=':
                        return v1 == v2;
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
            //if (ast.x in env)
            //    return;
            var envTemp = [];
            for (var i in env)
                envTemp[i] = env[i];
            //console.log(env);
            //add current enviroment to its sub closure environment;
            envTemp[ast.x] = calc(ast.e1,env);
            envTemp[ast.x] = calc(ast.e1,envTemp);
            //inherit env from upper closure and add new env into it to enable recursion.(recusion let and currying)
            if (envTemp[ast.x].name === 'Closure') {
                var envFromClosure = envTemp[ast.x].env;
                for (var i in envFromClosure) {
                    if (! (i in envTemp))
                        envTemp[i] = envFromClosure[i];
                }
                envTemp[ast.x].env = envTemp;
            }
            return calc(ast.e2, envTemp);
        }
        case 'Fun': {
            var envTemp = [];
            for (var i in env)
                envTemp[i] = env[i];
            var clos = new Closure(ast.xs, ast.e, envTemp);
            return clos;
        }
        case 'Call': {
            var envTemp = []; //use to match call value with variable
            for (var i = 0 ; i < ast.es.length ; i++) {
                envTemp[i] = calc(ast.es[i], env);
            }
            var respond;
            if ((respond = ast.ef) instanceof Closure || (respond = calc(ast.ef, env)) instanceof Closure) {
                if (respond.xs.length < envTemp.length)
                    return;
                var envNew = [];
                for (var i in env)
                    envNew[i] = env[i];
                for (var i in respond.env) {
                    envNew[i] = respond.env[i];
                }
                for (var i = 0; i < envTemp.length ; i++)
                    envNew[respond.xs[i]] = envTemp[i];
                var xsTemp = [];
                for (var i = envTemp.length ; i < respond.xs.length ; i++)
                    xsTemp[i-envTemp.length] = respond.xs[i];
                if (respond.xs.length === envTemp.length)
                    return calc(respond.e, envNew);
                else
                    return calc(new Fun(xsTemp, respond.e), envNew);
                return calc(respond, envTemp);
            }
            return respond;
        }
        case 'Datum': {
            //if it can be calculated, return the value; else return original structure
            if (ast.es.length === 0)
                return ast;
            //var esTemp = ast.es;
            var esTemp = [];
            esTemp[0] = ast.es[0];
            esTemp[1] = ast.es[1];
            var calcTemp = [];
            calcTemp[0] = calc(ast.es[0], env);
            calcTemp[1] = calc(ast.es[1], env);
            if (typeof calcTemp[0] !== 'undefined')
                esTemp[0] = calcTemp[0];
            if (typeof calcTemp[1] !== 'undefined')
                esTemp[1] = calcTemp[1];
            return new Datum(ast.C, esTemp);
        }
        case 'Match': {
            //ps can be a single variable of a data structure containing variables
            var envTemp = [];
            for (var j in env)
                envTemp[j] = env[j];
            var eTemp = ast.e;
            for (var i = 0 ; i < ast.ps.length ; i++) {
                var psTemp = ast.ps[i];
                var esTemp = ast.es[i];
                var temp;
                if (matchObject(eTemp, psTemp, envTemp)){
                    if (typeof (temp = calc(esTemp,envTemp)) !== 'undefined')
                       esTemp = temp;
                    return calc(esTemp, envTemp);
                }
            }
            return;
        }
        case 'Wildcard': {
            return ast;
        }
        case 'ListComp': {
            //e is function, x is variable in e, elist is input list, epred is a filter
            var comp = function(e, x, list, epred) {
                if (list.C === 'Nil')
                    return new Datum(list.C, []);
                var envTemp = [];
                envTemp[x] = list.es[0];
                if (typeof epred === 'undefined' || calc(epred, envTemp)) {
                    list.es[0] = calc(e, envTemp);
                    list.es[1] = comp(e, x, list.es[1], epred);
                    return new Datum(list.C, list.es);
                }
                else
                    return comp(e, x, list.es[1], epred);
            }
            
            return comp(ast.e, ast.x, calc(ast.elist, env), ast.epred);
        }
        case 'Delay': {
            //create a closue for delay
            var closure = new Closure([], ast.e, env);
            //env[ast.e] = closure;
            return closure;
        }
        case 'Force': {
            //use a call to calculate the closure, variable in delay may not be a closure;
            var closure = calc(ast.e, env);
            return calc(new Call(closure, []), env);
        }
        default:
            return;
    }
    
  //throw new TODO("You're supposed to write your own calcreter!");
}



function matchObject(d1, d2, env) {
    //var envTemp = [];
    if (d1 instanceof Wildcard || d2 instanceof Wildcard)
        return true;
    else if ((!isNaN(d1)|| d1 instanceof Val) && (!isNaN(d2)||d2 instanceof Val)) {
        var val1 = calc(d1);
        var val2 = calc(d2);
        return (val1 === val2);
    }
    else if (d2 instanceof Var) {
        if (d2.x in env && matchObject(env[d2.x], d1, env))
            return true;
        else {
            env[d2.x] = d1;
            return true;
        }
    }
    else if (d1 instanceof Var) {
        return (d1.x in env && matchObject(env[d1.x], d2, env))
    }
    else if (d1 instanceof Datum && d2 instanceof Datum) {
        if (d1.C != d2.C)
            return false;
        else {
            if (d1.C === 'Pair') {
                var arr1 = d1.es;
                var arr2 = d2.es;
                for (var i = 0 ; i < arr1.length ; i++) {
                    if (!matchObject(arr1[i], arr2[i], env))
                        return false;
                }
                return true;
            }
            else if (d1.C === 'Cons') {
                return matchObject(d1.es[0], d2.es[0], env) && matchObject(d1.es[1], d2.es[1], env);
            }
            else if (d1.C === 'Nil')
                return true;
            else {
                throw 'This datam type cannot be recognized';
            }
        }
    }
    return false;
}


