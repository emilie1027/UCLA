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
    if (term1 instanceof Var) {
        return (this.lookup(term2.name) === undefined)? this.bind(term1, term2): this.bind(term1, this.lookup(term2.name));
    }
    else if (term2 instanceof Var) {
        return (this.lookup(term1.name) === undefined)? this.bind(term2, term1): this.bind(term2, this.lookup(term1.name));
    }
    else {
        if (term1.name !== term2.name || term1.args.length !== term2.args.length)
            return undefined;
        for (var i = 0 ; i < term1.args.length ; i++) {
            this.unify(term1.args[i], term2.args[i]);
        }
        return this;
    }
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  throw new TODO('Program.prototype.solve not implemented');
};

