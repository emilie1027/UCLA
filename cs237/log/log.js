// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------
Rule.counter = 0;

Rule.prototype.makeCopyWithFreshVarNames = function() {
    var id = Rule.counter++;
    var head = this.head.makeCopyWithFreshVarNames(id);
    var body = [];
    for (var i = 0 ; i < this.body.length ; i++) {
        body.push(this.body[i].makeCopyWithFreshVarNames(id));
    }
    return new Rule(head, body);
};

Clause.prototype.makeCopyWithFreshVarNames = function(id) {
    var args = [];
    for(var i = 0 ; i < this.args.length ; i++) {
        args.push(this.args[i].makeCopyWithFreshVarNames(id));
    }
    return new Clause(this.name, args);
};

Var.prototype.makeCopyWithFreshVarNames = function(id) {
    return new Var(this.name + '.' + id);
}

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
    else {
        var curr = this;
        while (subst.lookup(curr.name) !== undefined) {
            curr = subst.lookup(curr.name);
        }
        return curr;
        //return subst.lookup(this.name);
    }
};

Clause.prototype.contain = function(term) {
    for (var i = 0 ; i < this.args.length ; i++) {
        if (this.args[i].contain(term))
            return true;
    }
    return false;
}

Var.prototype.contain = function(term) {
    if (this.name === term.name)
        return true;
    return false;
}

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------
// unification is to create substitutions


Subst.prototype.unify = function(term1, term2) {
    if (term1 instanceof Var && term2 instanceof Var) {

        return this.bind(term1.rewrite(this), term2.rewrite(this));
    }
    else if (term1 instanceof Var) {
        if (term2.rewrite(this).contain(term1))
            return undefined;
        return this.bind(term1.rewrite(this), term2.rewrite(this));
    }
    else if (term2 instanceof Var) {
        if (term1.rewrite(this).contain(term2))
            return undefined;
        return this.bind(term2.rewrite(this), term1.rewrite(this));
    }
    else {
        if (term1.name !== term2.name || term1.args.length !== term2.args.length)
            return undefined;
        for (var i = 0 ; i < term1.args.length ; i++) {
            if (this.unify(term1.args[i].rewrite(this), term2.args[i].rewrite(this)) === undefined)
                return undefined;
        }
        for (var key in this.bindings) {
            var dest = this.lookup(key);
            var track = [];
            while (dest instanceof Var) {
                var next = this.lookup(dest.name);
                if (next == undefined) break;
                else if (this.lookup(next.name) === next) {
                    dest = key;
                    break;
                }
                dest = next;
            }
            this.bind(key, dest);
        }
        for (var key in this.bindings) {
            var result = this.lookup(key);
            if (result instanceof Clause) {
                this.bind(key, result.rewrite(this));
            }
        }
        return this;
    }
};


// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
    var iter = new Iterator(this.rules, this.query);
    return iter;
};

function Iterator(rules,query) {
    this.rules = rules;
    this.query;
    this.subst;
    this.stack = [new Stack(query, new Subst(), -1)];
    this.rIndex;
};

Iterator.prototype.next = function() {
    var subst = this.search();
    return subst;
}

Iterator.prototype.search = function() {
    while (this.stack.length > 0) {
        this.query = this.stack[0].query;
        this.subst = this.stack[0].subst;
        this.rIndex = this.stack[0].rIndex;
        this.stack = this.stack.slice(1);
        var j = this.rIndex + 1;
        while (j < this.rules.length) {
        //for (var j = this.rIndex + 1; j < this.rules.length ; j++) {
            if (this.rules[j].head.name === this.query[0].name) {
                var newRule = this.rules[j].makeCopyWithFreshVarNames();
                var newSubst = this.subst.clone();
                if (newSubst.unify(this.query[0].rewrite(this.subst), newRule.head) !== undefined) {
                    //if (newSubst.unify(newRule.head, this.query[0]) !== undefined) {
                    this.stack = [new Stack(this.query, this.subst, j)].concat(this.stack);
                    this.query = newRule.body.rewrite(newSubst).concat(this.query.slice(1));
                    this.subst = newSubst;
                    if (this.query.length === 0) {
                        return this.subst;
                    }
                    else {
                        j = 0;
                        continue;
                    }
                }
            }
            j++;
        }
    }
}
    
function Stack(query, subst, rIndex) {
    this.query = query;
    this.subst = subst;
    this.rIndex = rIndex;
}

Array.prototype.rewrite = function(subst) {
    for (var i = 0 ; i <  this.length ; i ++)
        this[i] = this[i].rewrite(subst);
    return this;
}

