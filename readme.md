# Mezcal: Mathematical Expression Calculator

Mezcal is a package for dynamically executing mathematical expressions at runtime.

It also contains a simple scripting language for defining custom functions and simple boolean logic.

The package consists of a lexical scanner, a parser to create an abstract syntax tree, and an interpreter to evaluate the expression.

There is also a compiler to compile to StackVM assembly language. Use this when you need to execute an expression many times, such as drawing a graph.

See test.mez for examples.

## Keywords

- "function": Defines a new function
- "let": Defines a new variable
- "if", "then", "else": Boolean logic
- "begin", "end": Block operators
- "error": Throws an error
- "return": Returns a value from a function
- "input": Gets input from the user
- "print": Prints out a message
- "import": Imports functions and variables from a file 
- "and", "or", "not": Boolean operators
- "while", "for": Loop operators

## Operators

= == != < <= > >= + - * / ^

## Grammar:

```
program        → declaration* EOF ;
declaration    → funDecl | letDecl | statement ;
funDecl        → "function" IDENTIFIER "(" parameters? ")" block ;
parameters     → IDENTIFIER ( "," IDENTIFIER )* ;
letDecl        → "let" IDENTIFIER ( "=" expression )? ;
statement      → exprStmt | forStmt | ifStmt | printStmt | whileStmt | block ;
returnStmt     → "return" expression? ;
exprStmt       → expression ;
forStmt        → "for" assignment "to" expression ( "step" expression )? ;  
ifStmt         → "if" expression "then" statement ( "else" statement )? ;
printStmt      → "print" expression ;
whileStmt      → "while" expression statement;
block          → "begin" declaration* "end" ;
expression     → assignment ;
assignment     → IDENTIFIER "=" assignment | logic_or ;
logic_or       → logic_and ( "or" logic_and )* ;
logic_and      → equality ( "and" equality )* ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → base ( ( "/" | "*" ) base )* ;
base           → unary ( "^" unary )*
unary          → ( "+" | "-" ) unary | call ;
call           → primary ( "(" arguments? ")" )* ;
arguments      → expression ( "," expression )* ;
primary        → NUMBER | STRING | IDENTIFIER
                | "(" expression ")"
                | IDENTIFIER ;
```

## Usage
You compile a program into an abstract syntax tree then transform that into output.

### Scanner
Use the scanner to parse a program into lexical tokens.

```typescript
const expr = "2 * (3 + x)^2";
const scanner = new Scanner(expr);
const tokens = scanner.scanTokens();
```

### Parser
Use the parser to parse lexical tokens to an abstract syntax tree.

```typescript
const parser = new Parser(tokens);
const ast = parser.parse();
```

You can print out the tree using the AstPrinter

```typescript
new AstPrinter().print(ast);
```

Execute the output from the parser using the interpreter.

```typescript
const interpreter = new Interpreter();
const result = interpreter.interpret(ast);
```

There is a function that performs all of the steps above called execute().

```typescript
const result = execute("2 * x^3");
```

## REPL

You can also run in REPL mode (command line) by running index.js.

    node dist/index.js

Enter Mezcal code and/or mathematical expressions to evaluate. It supports the following commands.

- :h => Show help
- :q => Quit

For example you could run these lines of code:

```
> let x = 3
3
> let y = 2^x
8
> x * y
24
> function add(a,b) begin a + b end
0
> add(2, 3)
5
```
