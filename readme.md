# Mezcal: Mathematical Expression Calculator

Mezcal is a package for dynamically executing mathematical expressions at runtime.

It also contains a simple scripting language for defining custom functions and simple boolean logic.

The package consists of a lexical scanner, a parser to create an abstract syntax tree, and an interpreter to evaluate the expression.

There is also a compiler to compile to StackVM assembly language. Use this when you need to execute an expression many times, such as drawing a graph.

See test.mez for examples.

## Keywords

- "define": Defines a new function
- "let": Defines a new variable
- "const": Defines a constant value
- "if", "then", "else": Boolean logic
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

program        → declaration* EOF ;
declaration    → letDecl | statement ;
statement      → exprStmt | printStmt ;
letDecl        → "let" IDENTIFIER ( "=" expression )? ;
exprStmt       → expression ;
printStmt      → "print" expression ;
expression     → assignment ;
assignment     → IDENTIFIER "=" assignment | equality ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → base ( ( "/" | "*" ) base )* ;
base           → unary ( "^" unary )*
unary          → ( "+" | "-" ) unary
               | primary ;
primary        → NUMBER | STRING | IDENTIFIER
                | "(" expression ")"
                | IDENTIFIER ;

## Usage
You compile a program into an abstract syntax tree then transform that into output.

### Scanner
Use the scanner to parse a program into lexical tokens.

```typescript
const expr = "2 * (3 + x)^2";
const scanner = new MexScanner(expr);
const tokens = scanner.scanTokens();
```

### Parser
Use the parser to parse lexical tokens to an abstract syntax tree.

```typescript
const parser = new MexParser(tokens);
const ast = parser.parse();
```

You can print out the tree using the AstPrinter

```typescript
new AstPrinter().print(ast);
```

Execute the output from the parser using the interpreter.

```typescript
const interpreter = new MexInterpreter();
const result = interpreter.interpret(ast);
```

There is a function that performs all of the steps above called execute().

```typescript
const result = execute("2 * x^3");
```
