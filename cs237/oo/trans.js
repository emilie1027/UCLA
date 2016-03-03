'use strict';

function trans(ast) {
    return ast.transform();
    //throw new TODO('implement translation for ' + ast.constructor.name);
}

Program.prototype.transform = function() {
    var env = new Env();
    var arr = this.ss;
    if (! (arr[arr.length - 1] instanceof ExpStmt) ) return "null";
    var str = '';
    for (var i = 0 ; i < arr.length - 1 ; i++)
        str += arr[i].transform(env) + ';';
    str += arr[arr.length - 1].transform(env);
    return str;
}

ExpStmt.prototype.transform = function(env) {
    var result = '';
    //return 'try{' + this.e.transform(env) + '.__get()} catch(e){if(e1.message === "e1"){} else{}}'
    return this.e.transform(env)  + '.__get();';
}

//-----------------------------------value----------------------------------------
BinOp.prototype.transform = function(env) {//
    return  this.e1.transform(env) + '.' + '_' + opMap[this.op] + '('+ this.e2.transform(env) +')';
    //return '(' + this.e1.transform(env) + this.op + this.e2.transform(env) + ')';
}
Lit.prototype.transform = function(env) {
    var value = this.primValue;
    if (typeof value === 'number')
        return 'new Num(' + value + ')';
    else if (typeof value === 'string')
        return 'new Str("' + value + '")';
    else if (value === null)
        return 'new Null()';
    else if (value === true)
        return 'new True()';
    else if (value === false)
        return 'new False()';
    else
        return 'throw New Error("input value is invalid");';
}
Var.prototype.transform = function(env) {
    return this.x;
}
InstVar.prototype.transform = function(env) {
    env.currInst.push(this.x);
    return "this." + this.x;
}
New.prototype.transform = function(env) {
    //(new Obj())
    var result = '(new '+ this.C +'())';
    if (this.es.length != 0)
        result += '._init' + '('+ this.es.transform(env) +')';
    return result;
}
This.prototype.transform = function(env) {
    return 'this';
}
Send.prototype.transform = function(env) {
    if (this.m === 'call')
        return 'Block.call(' + this.erecv.transform(env) + ', [' + this.es.transform(env) + '])';
    return this.erecv.transform(env) + '.' + '_' +this.m + '('+ this.es.transform(env) +')';
}
SuperSend.prototype.transform = function(env) {
    return env.classes[env.currClass] + '.prototype._' + this.m + '(' + this.es.transform() + ')';
}

Array.prototype.transform = function(env) {
    var arr = [];
    for (var i = 0 ; i < this.length ; i++) {
        arr[i] = this[i].transform(env);
    }
    return arr.toString();
}
//--------------------------------statement----------------------------------------
VarDecl.prototype.transform = function(env) {
    //var v = 1 + 2;
    return ('var ' + this.x + '=' + this.e.transform(env) + ';');
}
ClassDecl.prototype.transform = function(env) {
    //function Ref() {this.prototype = Obj; this.val = val;}
    var xs = '';
    xs += 'function ' + this.C + '()' + '{}';
    if (this.C in env.classes)
        xs += 'throw new Error("class has already been defined");';
    xs += this.C + '.prototype = new ' + this.S + '();'
    for (var i = 0 ; i < this.xs.length ; i++) {
        xs += this.C + '.prototype.' + this.xs[i] + '  = new Null();';
    }
    env.classes[this.C] = this.S;
    return xs;
}
VarAssign.prototype.transform = function(env) {
    return this.x + '=' + this.e.transform(env) + ';';
}
InstVarAssign.prototype.transform = function(env) {
    return 'this.' + this.x + '=' + this.e.transform(env) + ';';
}
Return.prototype.transform = function(env) {
    return 'return ' + this.e.transform(env) + ';';
}

MethodDecl.prototype.transform = function(env) {
    // Obj.prototype.mul = function(x,y) {return x * y}
    env.currClass = this.C;
    env.currInst = [];
    if (this.xs[0] === 'that' && this.m in opMap)
        this.m = opMap[this.m];
    var result = this.C + '.prototype.' + '_' + this.m + ' = function' + '('+this.xs.toString()+')' + '{';
    var tempResult = '';
    
    for (var i = 0 ; i < this.ss.length ; i++) {
        tempResult += this.ss[i].transform(env) + ';';
    }
    if (env.haveBlock === true) {
        tempResult = 'try {' + tempResult + '} catch (e) {return e.call(this,[])}';  //use try catch to deal with block
    }
    env.haveBlock = false;
    for (var i = 0 ; i < env.currInst.length ; i++) {
        result += 'if(this.' + env.currInst[i] + ' === undefined) throw new Error("property does not exist");';
    }
    if (!(this.ss[this.ss.length - 1] instanceof Return)) tempResult += 'return this;';
    return result + tempResult + '}';
}

BlockLit.prototype.transform = function(env) {
    env.haveBlock = true;
    var result = '';
    var arr = this.ss;
    for (var i = 0 ; i < arr.length - 1 ; i++)
        result += arr[i].transform(env) + ';';
    if (arr[arr.length - 1] instanceof ExpStmt)
        result += 'return ' + arr[arr.length - 1].transform(env);
    else if (arr[arr.length - 1] instanceof Return) {
        result += arr[arr.length - 1].transform(env);
        return '(function(' + this.xs.toString() + ') {var e = function(){' + result + '}; throw e;})';
    }
    else
        result += 'return new Null();';
    return '(function(' + this.xs.toString() + ') {' + result + '})';
    //+ this.ss.transform(env) + '}';
}
//---------------------Env use to record class relationship and temporary instance in class----------------
function Obj(x){
    this.val = x;
    this.__equ = function(x) { return this.val === x.val? new True(): new False(); }
    this.__neq = function(x) { return this.val !== x.val? new True(): new False(); }
    this.__get = function() { return this.val; }
}

Obj.prototype._init = function() {}

Obj.prototype.transform = function(env) {
    return '(new' + this.name + ')';
}

function Num(x){
    this.val = x
    this.__add = function(x) { return new Num(this.val + x.val); }
    this.__sub = function(x) { return new Num(this.val - x.val); }
    this.__mul = function(x) { return new Num(this.val * x.val); }
    this.__div = function(x) { return new Num(this.val / x.val); }
    this.__mod = function(x) { return new Num(this.val % x.val); }
    this.__les = function(x) { return this.val < x.val? new True(): new False(); }
    this.__gre = function(x) { return this.val > x.val? new True(): new False(); }
}
Num.prototype = new Obj();

function Str(x){
    this.val = x
    this.__add = function(x) { return new Str(this.val + x.val); }
    this.__les = function(x) { return this.val < x.val? new True(): new False(); }
    this.__gre = function(x) { return this.val > x.val? new True(): new False(); }
}
Str.prototype = new Obj();

function Null(){this.val = null}
Null.prototype = new Obj();

function Bool(){}
Bool.prototype = new Obj();

function True(){this.val = true}
True.prototype = new Bool();

function False(){this.val = false}
False.prototype = new Bool();

function Block() {
    var value = this.apply(this, arguments[0]);
    if (typeof value === 'number')
        return new Num(value);
    else if (typeof value === 'string')
        return new Str(value);
    else if (value === null)
        return new Null();
    else if (value === true)
        return new True();
    else if (value === false)
        return new False();
    else
        throw new Error("result is invalid");
}

function Env() {
    this.haveBlock = false;
    this.currClass;
    this.currInst = [];
    this.classes = [];
}

var opMap = {'+':'_add', '-':'_sub', '*':'_mul', '/':'_div','%':'_mod', '<':'_les','>':'_gre', '==':'_equ', '!=':'_neq'};
