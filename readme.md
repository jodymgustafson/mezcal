# Mezcal: Mathematical Expression Calculator

Mezcal is a package for dynamically executing mathematical expressions at runtime.

It also contains a simple scripting language for defining custom functions and simple boolean logic.

The package consists of a lexical scanner, a parser to create an abstract syntax tree, and an interpreter to evaluate the expression.

There is also a compiler to compile to [StackVM](https://github.com/jodymgustafson/stack-vm) assembly language.
Use this when you need to execute an expression many times, such as drawing a graph.

See [test.mez](./examples/test.mez) for examples.

## Keywords

- "function": Defines a new function
- "let": Defines a new variable
- "if", "then", "else": Boolean logic
- "and", "or", "not": Boolean operators
- "begin", "end": Block operators
- "return": Returns a value from a function
- "while", "for": Loop operators
- "import": Imports functions and variables from a file 
- "error": Throws an error

## Operators

= == <> < <= > >= + - * / ^

## Grammar:

```
program        → import* declaration* EOF ;
import         → "import" STRING ;
declaration    → funDecl | letDecl | statement ;
funDecl        → "function" IDENTIFIER "(" parameters? ")" (block | returnStmt) ;
parameters     → IDENTIFIER ( "," IDENTIFIER )* ;
letDecl        → "let" IDENTIFIER ( "=" expression )? ;
statement      → exprStmt | errorStmt | forStmt | ifStmt | whileStmt | block ;
returnStmt     → "return" expression? ;
errorStmt      → "error" expression? ;
exprStmt       → expression ;
forStmt        → "for" assignment "to" expression ( "step" expression )? ;  
ifStmt         → "if" expression "then" statement ( "else" statement )? ;
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

You can also run in REPL mode (command line) by running mezcal.js.

    node dist/mezcal.js

Or run the npm command:

    npm run start

_Or_ run one of the batch files: `mezcal.bat` or `mezcal.ps`.

Enter Mezcal code and/or mathematical expressions to evaluate. It supports the following commands.

- :h(elp) => Show help
- :q(uit) => Quit
- :e(ditor) => Enter multiline edit mode
- :b(reak) => Exit multiline edit mode
- :l(oad) path/to/file => Loads a Mezcal file and executes it

For example you could run these lines of code:

```
> let x = 3
3
> let y = 2^x
8
> x * y
24
> function add(a,b) return a + b
0
> add(2, 3)
5
```

## Compiler
The compiler compiles Mezcal code to StackVM assembly code. If you are running the same expressions
or code over and over (e.g. graphing) then this will give the best performance.

The compiler generates a StackVM YAML file.

To compile a file run passing in the file to compile and optionally an output file name.
If you don't provide an output name it will use the input file name.

    node dist/compile.js path/to/file.mez optional/output/file.yml

_Or_ run one of the batch files: `compile.bat` or `compile.ps`.

## Programming Guide
Mezcal is a simple programming language that can be used to create custom functions and run programs.

### Mathematical operators
You can use the following math operators.

`+, -, *, /, ^`

In addition you can use parenthesis to group expressions.

```
2 ^ ((x * pi) + 32)
```

### Variables
Define variables using the assignment operator. You can optionally use the let keyword.
Variables can be set to numbers or strings.

Convention is to make string variables end with a dollar sign (e.g. s$) but it's not required
unless you are compiling to StackVM. 

```
let a$ = "A string"
piOver2 = pi / 2
```

### Conditionals
Use `if`-`then`-`else` keywords to do conditional statements.
The following logical operators are available.

`==, <>, <, <=, >, >=`

If your conditional code is more than one line wrap it in a `begin`-`end` block.

```
if command == "c" then begin
  # handle c command...
end
else if command == "e" then begin
  # handle e command...
end
else print("Invalid command" + command)
```

The following boolean operators are available.

`and, or, not`

```
if a > 0 and a < 100 then # do something
```

Note that the number 0 is equivalent to false and any other number is true.

### Loops
Loops can be defined using `while` and `for` loops.
Like conditional statements, If your code is more than one line wrap it in a `begin`-`end` block.


```
x = 1
while x <= 10
begin
  print(x)
  x = x + 1
end
```
```
for x = 1 to 10 print(x)
```

A `for` loop may also have a `step` defined.
The step can be positive or negative.

```
# Count odd numbers
for x = 1 to 10 step 2 print(x)
```

### Functions
To create a function use the `function` keyword followed by a function body.
For a simple one line body use a return statement.

```
function add(a, b) return a + b
```

If your function requires multiple lines use a `begin`-`end` block.

```
function fibonacci(n)
begin
  if n < 0 then error "Invalid value"
  if n <= 1 then return n
  return fibonacci(n - 2) + fibonacci(n - 1)
end
```

Using a `return` statement is optional in a block.
The last value evaluated will be returned from a function.

The following built in functions are available.

`clock, pi, e, sin, cos, tan, asin, acos, atan, abs, floor, ceil, log, ln, round, random, sqrt, cbrt, print, input`

Constant values are defined by functions that don't take any parameters.
You do not need to use parenthesis to call these kinds of functions.
For example, you can use `pi()` or simply `pi`.

### User input
You can get user input from the command line using the `input` function.

```
let name = input("What is your name?")
```

### Write output
Use the `print` function to write text to the command line.

```
let f = convert_c2f(c)
print(c + " celsius is " + roundDecimal(f, 1) + " fahrenheit")
```

### Throw errors
When invalid input is provided you can throw an error using the `error` keyword followed by an error message.
This will immediately stop execution and print the error message.

```
if n < 0 then error "Invalid value: " + n
```
