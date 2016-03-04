// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

Rule.prototype.makeCopyWithFreshVarNames = function() {
    var map = [];
    var head = this.head.makeCopy(map);
    var body = [];
    for (var i = 0 ; i < this.body.length ; i++) {
        body.push(this.body[i].makeCopy(map));
    }
    return new Rule(head, body);
};

Clause.prototype.makeCopy = function(map) {
    var args = [];
    for(var i = 0 ; i < this.args.length ; i++) {
        var oldName = this.args[i].name;
        //better way to create a new name?
        var newName = oldName + '.';
        args.push(new Var(newName));
        map[oldName] = newName;
    }
    return new Clause(this.name, args);
};

Clause.prototype.rewrite = function(subst) {
    var args = [];
    for(var  i = 0 ; i < this.args.length ; i++) {
        args.push(this.args[i].rewrite(subst));
    }
    return new Clause(this.name, args);
  //throw new TODO('Clause.prototype.rewrite not implemented');
};

Var.prototype.rewrite = function(subst) {
    if (subst.lookup(this.name) === undefined)
        return this;
    else
        return subst.lookup(this.name);
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
  throw new TODO('Subst.prototype.unify not implemented');
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  throw new TODO('Program.prototype.solve not implemented');
};

