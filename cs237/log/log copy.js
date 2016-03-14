// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

Rule.prototype.makeCopyWithFreshVarNames = function() {
    map = [];
    var head = this.head.makeCopyWithFreshVarNames(map);
    var body = [];
    for (var i = 0 ; i < this.body.length ; i++) {
        body.push(this.body[i].makeCopyWithFreshVarNames(map));
    }
    return new Rule(head, body);
};

Clause.prototype.makeCopyWithFreshVarNames = function(map) {
    var args = [];
    for(var i = 0 ; i < this.args.length ; i++) {
        args.push(this.args[i].makeCopyWithFreshVarNames(map));
    }
    return new Clause(this.name, args);
};

Var.prototype.makeCopyWithFreshVarNames = function(map) {
    return new Var(this.name + '.');
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
    else
        return subst.lookup(this.name);
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------
// unification is to create substitutions
Subst.prototype.unify = function(term1, term2) {
    if (term1 instanceof Var) {
        return this.bind(term1.rewrite(this), term2.rewrite(this));
    }
    else if (term2 instanceof Var) {
        return this.bind(term2.rewrite(this), term1.rewrite(this));
    }
    else {
        if (term1.name !== term2.name || term1.args.length !== term2.args.length)
            return undefined;
        for (var i = 0 ; i < term1.args.length ; i++) {
            if (this.unify(term1.args[i], term2.args[i]) === undefined)
                return undefined;
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
    this.query = query;
    this.index = new Index(query.length);
};

Iterator.prototype.next = function() {
    var subst = new Subst();
    while (this.index.qIndex[0] < this.rules.length) {
        var result = depthSearch(this.rules, this.query, 0, this.index, new Subst());
        if ( result !== undefined)
            return result;
    }
    return undefined;
}

function depthSearch(rules, query, qIdx, index, subst) {
    if (qIdx >= query.length) {
        //subst = new Subst();
        return subst;
    }
    //for (var j = index.qIndex[qIdx] ; j < rules.length ;j++) {
    var j = index.qIndex[qIdx];
        var newRule = rules[j].makeCopyWithFreshVarNames();
            if (newRule.head.name === query[qIdx].name) {
                if (subst.unify(query[qIdx].rewrite(subst), newRule.head) !== undefined) {
                    var tempSubst = subst;
                    if (newRule.body.length !== 0) {
                        bodyIndex = new Index(newRule.body.length);
                        tempSubst = depthSearch(rules, newRule.body, 0, bodyIndex, subst.clone());
                        if (tempSubst !== undefined);
                        subst = tempSubst;
                    }
                    tempSubst = depthSearch(rules, query, qIdx+1, index, subst.clone());
                    if (tempSubst !== undefined){
                        subst = tempSubst;
                        if (qIdx == index.qIndex.length - 1)
                            index.qIndex[qIdx] = j+1;
                        var tempQIdx = qIdx;
                        while (tempQIdx !== 0 && index.qIndex[tempQIdx] === rules.length) {
                                index.qIndex[tempQIdx] = 0;
                                index.qIndex[tempQIdx-1] += 1;
                                tempQIdx--;
                        }
                        return subst;
                    }
                }
            }
       // }
    index.qIndex[qIdx] += 1;
    for (var i = qIdx + 1; i < index.qIndex.length ; i++)
        index.qIndex[i] = 0;
    var tempQIdx = qIdx;
    while (tempQIdx !== 0 && index.qIndex[tempQIdx] === rules.length) {
        index.qIndex[tempQIdx] = 0;
        index.qIndex[tempQIdx-1] += 1;
        tempQIdx--;
    }
    return undefined;
}


function Index(x) {
    this.qIndex = new Array(x);
    for (var i = 0 ; i < x ; i++)
        this.qIndex[i] = 0;
    //this.rIndex = rIndex;
}


//

