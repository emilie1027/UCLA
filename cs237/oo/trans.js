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
    for (var i = 0 ; i < arr.length ; i++)
        str += arr[i].transform(env) + ';';
    return str;
}

ExpStmt.prototype.transform = function(env) {
    return this.e.transform(env);
}
//-----------------------------------value----------------------------------------
BinOp.prototype.transform = function(env) {//
    //return '' + '(' + this.e1.transform(env) + ')' + this.op + '(' + this.e2.transform(env) + ')';
    return '(' + this.e1.transform(env) + this.op + this.e2.transform(env) + ')';
}
Lit.prototype.transform = function(env) {
    if (typeof this.primValue === 'string') return ('"' + this.primValue + '"');
    return this.primValue;
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
    return this.erecv.transform(env) + '.' + '_' +this.m + '('+ this.es.transform() +')';
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
        xs += this.C + '.prototype.' + this.xs[i] + ' = [];';
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
    var result = this.C + '.prototype.' + '_' + this.m + ' = function' + '('+this.xs.toString()+')' + '{';
    var tempResult = '';
    for (var i = 0 ; i < this.ss.length ; i++) {
        tempResult += this.ss[i].transform(env) + ';';
    }
    for (var i = 0 ; i < env.currInst.length ; i++) {
        result += 'if(this.' + env.currInst[i] + ' === undefined) throw new Error("property does not exist");';
    }
    if (!(this.ss[this.ss.length - 1] instanceof Return)) tempResult += 'return this;';
    return result + tempResult + '}';
}

//---------------------Env use to record class relationship and temportyt instance in class----------------
function Obj(){}
Obj.prototype._init = function() {};

function Env() {
    this.currClass;
    this.currInst = [];
    this.classes = [];
}
