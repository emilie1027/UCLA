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
    str += arr[arr.length - 1].transform(env) + '.__get();';
    return str;
}

ExpStmt.prototype.transform = function(env) {
    var result = '';
    //return 'try{' + this.e.transform(env) + '.__get()} catch(e){if(e1.message === "e1"){} else{}}'
    //return this.e.transform(env)  + '.__get();';
    return this.e.transform(env);
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
    //--extra:
    xs += 'var '+ this.C + '=' + this.S + '.subClass("' + this.C +'");';
    //xs += 'function ' + this.C + '()' + '{}';
    //--extra
    if (this.C in env.classes)
        xs += 'throw new Error("class has already been defined");';
    //--extra
    for (var i = 0 ; i < this.xs.length ; i++) {
        xs += this.C + '.addVariable("' + this.xs[i] + '", new Null());';
    }
    //xs += this.C + '.prototype = new ' + this.S + '();'
    //for (var i = 0 ; i < this.xs.length ; i++) {
    //    xs += this.C + '.prototype.' + this.xs[i] + '  = new Null();';
    //}
    //--extra
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
    //--extra: addMethod
    var result = this.C + '.addMethod("_' + this.m + '", function(' + this.xs.toString() + '){';
    //var result = this.C + '.prototype.' + '_' + this.m + ' = function' + '('+this.xs.toString()+')' + '{';
    var tempResult = '';
    //--------------use try catch to deal with block----------------------------
    for (var i = 0 ; i < this.ss.length ; i++) {
        tempResult += this.ss[i].transform(env) + ';';
    }
    if (env.haveBlock === true) {
        tempResult = 'try {' + tempResult + '} catch (e) {console.log(e); return e.call(this,[]);}';
    }
    env.haveBlock = false;
    for (var i = 0 ; i < env.currInst.length ; i++) {
        result += 'if(this.' + env.currInst[i] + ' === undefined) throw new Error("property does not exist");';
    }
    if (!(this.ss[this.ss.length - 1] instanceof Return)) tempResult += 'return this;';
    //--extra: addMethod
    return result + tempResult + '});';
    //return result + tempResult + '}';
}

BlockLit.prototype.transform = function(env) {
    env.haveBlock = true;
    var result = '';
    var arr = this.ss;
    for (var i = 0 ; i < arr.length - 1 ; i++)
        result += arr[i].transform(env) + ';';
    if (arr.length > 0) {
        if (arr[arr.length - 1] instanceof ExpStmt)
            result += 'return ' + arr[arr.length - 1].transform(env) + ';';
        else if (arr[arr.length - 1] instanceof Return) {
            result += arr[arr.length - 1].transform(env);
            return '(new Block(this, function(' + this.xs.toString() + ') {var e = function(){' + result + '}; throw e;}))';
        }
        else
            result += arr[arr.length - 1].transform(env) + 'return new Null();';
    }
    return '(new Block(this, function(' + this.xs.toString() + ') {' + result + '}))';
}

//---------------------Env use to record class relationship and temportyt instance in class----------------
function Obj(x){
    this.val = x;
    this.__equ = function(x) { return this.val === x.val? new True(): new False(); }
    this.__neq = function(x) { return this.val !== x.val? new True(): new False(); }
    this.__get = function() { return this.val; }
}

Obj.prototype._init = function(x) {
    this.val = x;
}

Obj.prototype.transform = function(env) {
    return '(new' + this.name + ')';
}

Obj.addMethod = function(name, func) {
    this.prototype[name] = func;
}
Obj.addVariable = function(name, x) {
    this.prototype[name] = x;
}
Obj.getInstance = function(x) {
    if (this.name === 'Obj')
        return new this(x);
    else {
        this.superConstructor(x);
        return this;
    }
}

Obj.subClass = function(name) {
    var str = '';
    str += 'function ' + name +'(){}';
    str += 'function F(){}';
    str += 'F.prototype = this.prototype;';
    str += name + '.prototype = new F();'
    str += name + '.prototype.constructor = ' + name + ';'
    str += name + '.superConstructor = this;'
    str += name + '.superPrototype = this.prototype;'
    str += 'for (var x in this) ' + name + '[x] = this[x];'
    str += name;
    return eval(str);
}

//var Num = Obj.subClass('Num');
//Num.addMethod('__add', function(x) { return new Num(this.val + x.val); });



function Num(x){
    this.val = x;
    this.__add = function(x) { return new Num(this.val + x.val); }
    this.__sub = function(x) { return new Num(this.val - x.val); }
    this.__mul = function(x) { return new Num(this.val * x.val); }
    this.__div = function(x) { return new Num(this.val / x.val); }
    this.__mod = function(x) { return new Num(this.val % x.val); }
    this.__les = function(x) { return this.val < x.val? new True(): new False(); }
    this.__gre = function(x) { return this.val > x.val? new True(): new False(); }
}
Num.prototype = new Obj();
for (var i in Obj) {
    Num[i] = Obj[i];
}

function Str(x){
    this.val = x;
    this.__add = function(x) { return new Str(this.val + x.val); }
    this.__les = function(x) { return this.val < x.val? new True(): new False(); }
    this.__gre = function(x) { return this.val > x.val? new True(): new False(); }
}
Str.prototype = new Obj();
for (var i in Obj) {
    Str[i] = Obj[i];
}

function Null(){this.val = null}
Null.prototype = new Obj();
for (var i in Obj) {
    Null[i] = Obj[i];
}

function Bool(){}
Bool.prototype = new Obj();
for (var i in Obj) {
    Bool[i] = Obj[i];
}

function True(){this.val = true}
True.prototype = new Bool();
for (var i in Obj) {
    True[i] = Obj[i];
}

function False(){this.val = false}
False.prototype = new Bool();
for (var i in Obj) {
    False[i] = Obj[i];
}

function Block(env, func) {
    this.env = env;
    this.func = func;
}
for (var i in Obj) {
    Block[i] = Obj[i];
}

Block.prototype._call = function() {
    return this.func.apply(this.env, Array.prototype.slice.call(arguments, 0));
}



function Env() {
    this.haveBlock = false;
    this.currClass;
    this.currInst = [];
    this.classes = [];
}

var opMap = {'+':'_add', '-':'_sub', '*':'_mul', '/':'_div','%':'_mod', '<':'_les','>':'_gre', '==':'_equ', '!=':'_neq'};
