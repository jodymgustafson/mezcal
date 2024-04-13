# Math Expression (MEX) Scanner

Lexical parser for mathematical expressions. Also supports defining custom functions and simple boolean logic.

See test.mex for examples.

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

expression     → equality ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → base ( ( "/" | "*" ) base )* ;
base           → unary ( "^" unary )*
unary          → ( "+" | "-" ) unary
               | primary ;
primary        → NUMBER | STRING | IDENTIFIER
               | "(" expression ")" ;

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
new AstPrinter().print(ast)
```
