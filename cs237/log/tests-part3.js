tests(
  L,
  {
    name: 'duh (1/3)',
    code: 'p.\n' +
          'p?',
    expected: makeIterator({})
  },
  {
    name: 'duh (2/3)',
    code: 'p.\n' +
          'q?',
    expected: makeIterator()
  },
  {
    name: 'duh (3/3)',
    code: 'p.\n' +
          'q.\n' +
          'p, q?',
    expected: makeIterator({})
  },
  {
    name: 'alice and bob are people',
    code: 'person(alice).\n' +
          'person(bob).\n' +
          'person(X)?',
    expected: makeIterator(
      { X: new Clause("alice", []) },
      { X: new Clause("bob", []) }
    )
  },
  {
    name: 'sick and tired',
    code: 'sick(joe).\n' +
          'sick(frank).\n' +
          'sick(eddie).\n' +
          'tired(joe).\n' +
          'tired(eddie).\n' +
          'sick(X), tired(X)?',
    expected: makeIterator(
      { X: new Clause("joe", []) },
      { X: new Clause("eddie", []) }
    )
  },
  {
    name: "prereqs",
    code: 'prereq(cs131, cs137a).\n' +
          'prereq(cs137a, cs137b).\n' +
          'prereqTrans(X, Y) :- prereq(X, Y).\n' +
          'prereqTrans(X, Y) :- prereq(X, Z), prereqTrans(Z, Y).\n' +
          'prereqTrans(P, cs137b)?',
    expected: makeIterator(
      { P: new Clause("cs137a", []) },
      { P: new Clause("cs131", []) }
    )
  },
  {
    name: 'nats',
    code: 'nat(z).\n' +
          'nat(s(X)) :- nat(X).\n' +
          'nat(X)?',
    expected: makeIterator(
      { X: new Clause("z", []) },
      { X: new Clause("s", [new Clause("z", [])]) },
      { X: new Clause("s", [new Clause("s", [new Clause("z", [])])]) },
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])]) },
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])])]) }
    )
  },
  {
    name: 'evens',
    code: 'nat(z).\n' +
          'nat(s(X)) :- nat(X).\n' +
          'even(z).\n' +
          'even(s(s(X))) :- even(X).\n' +
          'even(X)?',
    expected: makeIterator(
      { X: new Clause("z", []) },
      { X: new Clause("s", [new Clause("s", [new Clause("z", [])])]) },
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])])]) },
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])])])])]) },
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])])])])])])]) }
    )
  },
  {
    name: 'plus (1/3)',
    code: 'plus(z, X, X).\n' +
          'plus(s(X), Y, s(Z)) :- plus(X, Y, Z).\n' +
          'plus(s(z), s(s(z)), X)?\n',
    expected: makeIterator(
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])]) }
    )
  },
  {
    name: 'plus (2/3)',
    code: 'plus(z, X, X).\n' +
          'plus(s(X), Y, s(Z)) :- plus(X, Y, Z).\n' +
          'plus(X, s(s(z)), s(s(s(z))))?\n',
    expected: makeIterator(
      { X: new Clause("s", [new Clause("z", [])]) }
    )
  },
  {
    name: 'plus (3/3)',
    code: 'plus(z, X, X).\n' +
          'plus(s(X), Y, s(Z)) :- plus(X, Y, Z).\n' +
          'plus(s(z), X, s(s(s(z))))?\n',
    expected: makeIterator(
      { X: new Clause("s", [new Clause("s", [new Clause("z", [])])]) }
    )
  },
  {
    name: 'cons and car',
    code: 'car([X|Y], X).\n' +
          'car([a,b,c], X)?',
    expected: makeIterator(
      { X: new Clause("a", []) }
    )
  },
  {
    name: 'length',
    code: 'length([], z).\n' +
          'length([H|T], s(LT)) :- length(T, LT).\n' +
          'length([a,b,c], X)?',
    expected: makeIterator(
      { X: new Clause("s", [new Clause("s", [new Clause("s", [new Clause("z", [])])])]) }
    )
  },
  {
    name: 'append (1/3)',
    code: 'append([], L, L).\n' +
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n' +
          'append([a, b], [c, d], X)?',
    expected: makeIterator(
      { X: new Clause("_cons", [new Clause("a", []),
             new Clause("_cons", [new Clause("b", []),
               new Clause("_cons", [new Clause("c", []),
                 new Clause("_cons", [new Clause("d", []), new Clause("_nil", [])])])])]) })
  },
  {
    name: 'append (2/3)',
    code: 'append([], L, L).\n' +
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n' +
          'append(X, [c, d], [a, b, c, d])?',
    expected: makeIterator(
      { X: new Clause("_cons", [new Clause("a", []),
             new Clause("_cons", [new Clause("b", []), new Clause("_nil", [])])]) })
  },
  {
    name: 'append (3/3)',
    code: 'append([], L, L).\n' +
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n' +
          'append([a, b], X, [a, b, c, d])?',
    expected: makeIterator(
      { X: new Clause("_cons", [new Clause("c", []),
             new Clause("_cons", [new Clause("d", []), new Clause("_nil", [])])]) })
  },
  {
    name: "homer's children",
    code: 'father(homer, bart).\n' +
          'father(homer, lisa).\n' +
          'father(homer, maggie).\n' +
          'parent(X, Y) :- father(X, Y).\n' +
          'parent(homer, Y)?',
    expected: makeIterator(
      { Y: new Clause("bart", []) },
      { Y: new Clause("lisa", []) },
      { Y: new Clause("maggie", []) }
    )
  },
  {
    name: "lisa's father",
    code: 'father(homer, bart).\n' +
          'father(homer, lisa).\n' +
          'father(homer, maggie).\n' +
          'parent(X, Y) :- father(X, Y).\n' +
          'parent(X, lisa)?',
    expected: makeIterator(
      { X: new Clause("homer", []) }
    )
  },
  {
    name: "parent",
    code: 'father(abe, homer).\n' +
          'father(homer, bart).\n' +
          'father(homer, lisa).\n' +
          'father(homer, maggie).\n' +
          'parent(X, Y) :- father(X, Y).\n' +
          'parent(X, Y)?',
    expected: makeIterator(
      { X: new Clause("abe", []), Y: new Clause("homer", []) },
      { X: new Clause("homer", []), Y: new Clause("bart", []) },
      { X: new Clause("homer", []), Y: new Clause("lisa", []) },
      { X: new Clause("homer", []), Y: new Clause("maggie", []) }
    )
  },
  {
    name: "grandfather",
    code: 'father(orville, abe).\n' +
          'father(abe, homer).\n' +
          'father(homer, bart).\n' +
          'father(homer, lisa).\n' +
          'father(homer, maggie).\n' +
          'parent(X, Y) :- father(X, Y).\n' +
          'grandfather(X, Y) :- father(X, Z), parent(Z, Y).\n' +
          'grandfather(X, Y)?',
    expected: makeIterator(
      { X: new Clause("orville", []), Y: new Clause("homer", []) },
      { X: new Clause("abe", []), Y: new Clause("bart", []) },
      { X: new Clause("abe", []), Y: new Clause("lisa", []) },
      { X: new Clause("abe", []), Y: new Clause("maggie", []) }
    )
  },
  {
    name:"reorder",
    code: 'prereq(cs131, cs137a).\n' +
          'prereq(cs137a, cs137b).\n' +
          'prereqTrans(X, Y) :- prereq(X, Z), prereqTrans(Z, Y).\n' +
          'prereqTrans(X, Y) :- prereq(X, Y).\n' +
          'prereqTrans(P, cs137b)?',
    expected: makeIterator(
      { P: new Clause("cs131", []) },
      { P: new Clause("cs137a", []) })
  },
  {
    name: "reverse sky",
    code: 'append([], L, L).\n'+
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n'+
          'reverse([],[]).\n'+
          'reverse([H|T],L):- reverse(T,R),append(R,[H],L).\n'+
          'reverse([s,k,y],X)?',
    expected: makeIterator(
    { X: new Clause("_cons", [new Clause("y", []),
         new Clause("_cons", [new Clause("k", []), 
         new Clause("_cons", [new Clause("s", []),new Clause("_nil", [])])])]) })
  },
  {
    name: "yes",
    code: 'on(Item,[Item|Rest]).\n'+
          'on(Item,[DisregardHead|Tail]):-   on(Item,Tail).\n'+
          'on(apples,  [pears, tomatoes, apples, grapes])?',
    expected: makeIterator({})
  },
  {
    name: "spilit sky",
    code: 'append([], Ys, Ys).\n'+
          'append([X|Xs], Ys, [X|Zs]) :- append(Xs, Ys, Zs).\n'+
          'split(List, Pivot, Left, Right) :- append(Left, [Pivot|Right], List).\n'+
          'split([s,s,k,y,y,y], k, L, R)?',
    expected: makeIterator(
    {L: new Clause("_cons", [new Clause("s", []),
        new Clause("_cons", [new Clause("s", []), new Clause("_nil", [])])]), 
     R: new Clause("_cons", [new Clause("y", []),
        new Clause("_cons", [new Clause("y", []), 
        new Clause("_cons", [new Clause("y", []),new Clause("_nil", [])])])]) 
    })
  },
  {
    name: "partition sky",
    code: 'append([], L, L).\n'+
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n'+
          'partition(L, PL) :- partition(L, [], PL).\n'+
          'partition([], [], []).\n'+
          'partition([X|Xs], As, R) :- append(As, [X], NewAs),partition(Xs, NewAs, R).\n'+
          'partition(L, [A|As], [[A|As]|R]) :- partition(L, [], R). partition([s,k,y],L)?',
    expected: makeIterator(
    {L: new Clause("_cons", [new Clause("_cons", [new Clause("s", []),
        new Clause("_cons", [new Clause("k", []),
        new Clause("_cons", [new Clause("y", []), 
        new Clause("_nil", [])])])]), new Clause("_nil", [])])},
    {L: new Clause("_cons", [new Clause("_cons", [new Clause("s", []),
        new Clause("_cons", [new Clause("k", []), 
        new Clause("_nil", [])])]), 
        new Clause("_cons",[new Clause("_cons",[new Clause("y",[]),
        new Clause("_nil", [])]),
        new Clause("_nil",[])])])},
    {L: new Clause("_cons", [new Clause("_cons", [new Clause("s", []),
        new Clause("_nil", [])]), 
        new Clause("_cons",[new Clause("_cons",[new Clause("k",[]),
        new Clause("_cons", [new Clause("y", []),  
        new Clause("_nil", [])])]),
        new Clause("_nil",[])])])},
    {L: new Clause("_cons",[new Clause("_cons", [new Clause("s", []),
        new Clause("_nil", [])]), 
        new Clause("_cons",[new Clause("_cons", [new Clause("k", []),
        new Clause("_nil", [])]),
        new Clause("_cons",[new Clause("_cons", [new Clause("y", []),
        new Clause("_nil", [])]),
        new Clause("_nil",[])])])])}
    )
  },
  {
    name: "perm sky",
    code: 'append([], L, L).\n'+
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n'+
          'perm([],[]).\n'+
          'perm(L,[H|T]) :- append(V,[H|U],L), append(V,U,W), perm(W,T).\n'+
          'perm([s,k,y], X)?',
  expected: makeIterator({})
  },
  {
    name: "occurs check",
    code: 'data(X,p(X)).\n'+
          'data(Y,Y)?',
    expected: makeIterator()
  },
  {
    name: "perm sky",
    code: 'append([], L, L).\n'+
          'append([H|T], L2, [H|L3]) :- append(T, L2, L3).\n'+
          'perm([],[]).\n'+
          'perm(L,[H|T]) :- append(V,[H|U],L), append(V,U,W), perm(W,T).\n'+
          'perm([s], X)?',
    expected: makeIterator(
    { X: new Clause("_cons", [new Clause("s", []),
         new Clause("_nil", [])]) })
  }
);

