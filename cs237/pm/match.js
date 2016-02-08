'use strict';

/*---------------------------------------------------Design-----------------------------------------------
 Our DSL consists of a match function  whose arguments are a value to be matched, followed by zero or more (pattern, function) pairs:
 match(value, pat1, fun1, pat2, fun2, …)
 match will try to match the value with each of the patterns, in left-to-right order. When it finds the first pattern that matches the value, match will call that pattern’s corresponding function and return the result of that call. If none of the patterns match the value, match will throw an exception.
 
 Goals: 1. judge if a pattern match a value;
        2. create 0 or several bindings and pass them as arguments to pattern's corresponding function.
 Focus: 1. How to judge pattern match?
            (1) (number of arguments) of this function must be same as binding.
            (2) satisfy (value, _) or (value, true(pred)) or
        2. How to create binding?
 Plus : 1. define deconstruct method in "class" Object, and override other classes' deconstruct
        2. In many()
 
 Problem:
        1. super class pattern
        2. arrity check, throw exception
        3. many match null values, column based
 */

/*------------------------------------------------ Preparation-----------------------------------------------
 How to get the number of arguments a function expected? func.length;
 How to add element to an array? arr.push(ele);
 How to call a function(func)? func(x,y)
 What if we want to transform an array(arr) into a function(func)'s argument? func.apply(this, arr), ex. ((x) => x+2).apply(this,[2])
 How to call an object function on another object. Use Class.prototype.function.call(o)
 
 */
function match(value /* pat1, fun1, pat2, fun2, ... */) {
    var argu = Array.prototype.slice.call(arguments);
    var value = arguments[0];
    for (var i = 1 ; i < arguments.length ; i = i+2) {
        var binding = [];
        var pat = arguments[i];
        var fun = arguments[i+1];
        if (pat.validMatch(value, binding) ){
            console.log(fun.length);
            console.log(binding.length);
            if (binding.length === fun.length)
            return fun.apply(this, binding);
            else
                throw ('Need to check arity');
        }
    }
  //throw new TODO('match not implemented');
}

String.prototype.validMatch = function(value, binding) {
    if (this.valueOf() === value)
        return true;
    return false;
}

Number.prototype.validMatch = function(value, binding) {
    if (this.valueOf() === value)
        return true;
    return false;
}

Array.prototype.validMatch = function(value, binding) {
    //if (!(value instanceof Array) || this.length !== value.length)
    //    return false;
    //if (!(value instanceof Array)) return false;
    var vidx = 0;
    var pidx = 0;
    while (pidx < this.length) {
        
        if (this[pidx] instanceof Many) {
            if ((vidx = (this[pidx].validMatch(value, binding, vidx))) === false)
                return false;
            pidx++;
        }
        else {
            if (!(this[pidx].validMatch(value[vidx], binding)))
                return false;
            vidx++;
            pidx++;
        }
        
    }
    return (pidx ===this.length && vidx === value.length);
}

var _ = new WildCard();
function WildCard() {};

WildCard.prototype.validMatch = function(value, binding) {
    binding.push(value);
    return true;
}

/*
 var instof = function(c // p1, p2, ... //) {
    var pats = [];
    for (var i = 1; i < arguments.length ; i++) {
        pats.push(arguments[i]);
    }
    return (new Instof(c, pats));
}
*/

var instof = function() {
    var pats = [];
    for (var i = 0; i < arguments.length ; i++) {
        pats.push(arguments[i]);
    }
    return (new Instof(pats));
}
                      
function Instof(arr) {
    this.arg = arr;
}
// haven't deal with super type
Instof.prototype.validMatch = function(value, binding) {
    var obj = this.arg[0];
    return (value instanceof obj && this.arg.slice(1).validMatch(obj.prototype.deconstruct.call(value), binding));
}

var many = function() {
    return (new Many(arguments[0]));
}

function Many(x) {
    this.pat = x;
}

Many.prototype.validMatch = function(value, binding, vidx) {
    /*
     many()
     many([_,_])
     many([many()])
     */
    var bindingTemp = [];
    var vend = vidx;
    for ( ; vend < value.length ; vend++) {
        var bindingTempTemp = [];
        if (!this.pat.validMatch(value[vend], bindingTempTemp))
            break;
            bindingTemp.push(bindingTempTemp);
    }
    if (this.pat instanceof Array){
        for (var i = 0 ; i < this.pat.length ; i++)
            binding.push([]);
    }
    else
        binding.push([]);
    if (bindingTemp.length !== 0) {
        for (var i = 0; i < bindingTemp[0].length; i++){
            for (var j = 0 ; j < bindingTemp.length; j++) {
                binding[binding.length - bindingTemp[0].length + i].push(bindingTemp[j][i])
            }
        }
    }
    return vend;
}

var pred = function() {
    return (new Pred(arguments[0]));
}

function Pred(x) {
    this.fun = x;
}

Pred.prototype.validMatch = function(value, binding) {
    var result = this.fun(value);
    if (result)
        binding.push(value);
    return (result);
}

