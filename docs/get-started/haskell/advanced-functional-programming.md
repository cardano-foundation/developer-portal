---
id: advanced-functional-programming
title: Advanced Functional Programming in Haskell
sidebar_label: Advanced Functional Programming
description: An advanced course on functional programming in Haskell
--- 

This is an advanced course on functional programming in Haskell. It is designed for second year computing students in Nottingham, but the lectures are also made available on [YouTube](http://tinyurl.com/haskell-notts2).

The course is based on part II of [Programming in Haskell](http://people.cs.nott.ac.uk/pszgmh/pih.html).\
It is recommended for following the course, to purchase the below textbook, watch the youtube videos, slides are provided below to follow along, and then to try out to programming examples with resources below as well. \
All resources and links are provided at the bottom of the page.\
\
All credit goes to the [Graham Hutton](https://people.cs.nott.ac.uk/pszgmh/), University of Nottingham

## Lecture Topics

The course expands beyond the basics into advanced patterns, type classes, and program reasoning. Key lectures include:

1. **Course Overview**\
   2–4. **Sudoku Solver Series** – Building and optimizing a Sudoku solver in Haskell\
   5–6. **Functors & Applicative Functors**\
   7–10. **Monads** – From basic introduction to generic laws and use cases (Maybe, List, State)\
   11–12. **Program Reasoning & Induction**\
   13–15. **Performance & Compiler Correctness** – Techniques like fast reverse/flatten and verifying compiler behavior [people.cs.nott.ac.uk](https://people.cs.nott.ac.uk/pszgmh/afp.html?utm_source=chatgpt.com)

Plus: YouTube playlists, overview slides, Sudoku solver code, and full standard prelude reference [people.cs.nott.ac.uk](https://people.cs.nott.ac.uk/pszgmh/afp.html?utm_source=chatgpt.com)

***

## Step-by-Step Learning Path

### Step 1: Explore the AFP Page

Use it as your central hub for videos, slides, and example code.

***

### Step 2: Follow Lecture Sequence

Watch in order—each builds on the previous one:

* **Lectures 2–4**: Code a Sudoku solver from scratch, iteratively improving performance
* **Lectures 5–10**: Deep dive into functors, applicatives, and monads—including real-world monad usage in Haskell
* **Lectures 11–12**: Learn how to formally **reason** and **prove** properties about functional programs
* **Lectures 13–15**: Tackle efficiency (e.g., removing append overhead) and understand **compiler verification**

***

### Step 3: Read _Programming in Haskell_ (Part II)

Highly aligns with the course. Reading alongside lectures reinforces:

* Category-theoretic intuition behind functors/applicatives/monads
* Inductive proofs and reasoning
* Lazy evaluation optimizations

***

### Step 4: Code Along & Experiment

* Download and run the **Sudoku solver code** provided
* Tinker with functor/applicative/monad instances—maybe create a small parsing program or build a custom monad
* Implement the "fast reverse" or "fast flatten" strategies using difference lists
* Walk through the **compiler correctness** lecture by experimenting with simple interpreters or compiling toy expressions

***

### Step 5: Reason & Prove

* Use **induction** and reasoning techniques shown in lectures 11–12 to validate your programs
* Explore equational reasoning (e.g., proving map fusion or monad laws)

***

### Tools You’ll Need

* **GHC** – install via [haskell.org](https://www.haskell.org)
* **Editor** – VS Code with Haskell extensions, or your preferred Haskell IDE
* **Hoogle** – invaluable for searching type signatures and library functions
* **YouTube** – study at your pace; pause and rewind where needed

***

## Best Practices

* Type everything by hand even if slides include code
* Pause frequently during monad sections—these can be non-trivial
* When reasoning, write proofs step-by-step in your notes or code comments
* Use Git to version control your solutions (especially for the Sudoku solver or monad experiments)

***

## After This Course

Advanced topics you’ll be ready for next:

* Category theory applied to Haskell (e.g., Profunctors, Arrows)
* Concurrency and streaming libraries (e.g. Conduit, STM)
* Formal verification tools (e.g., Liquid Haskell, Agda)

### Lectures

1. [Course Overview](https://youtu.be/V1FamhjNVcs)
2. [Sudoku I: First Steps](https://youtu.be/6jKiCHuUb44)
3. [Sudoku II: Initial Solvers](https://youtu.be/06nd2-N2FOA)
4. [Sudoku III: Improving Performance](https://youtu.be/bK1z1Ps0wzc)
5. [Functors](https://youtu.be/FDIwb1lVi9U)
6. [Applicative Functors](https://youtu.be/8oVHISjS3wI)
7. [Monads I: Basic Concepts](https://youtu.be/NBO6kN7JEAw)
8. [Monads II: Maybe, List and State](https://youtu.be/9injd7JE6vU)
9. [Monads III: State Revisited](https://youtu.be/CFNaCAOcykk)
10. [Monads IV: Generics, Laws and Benefits](https://youtu.be/D2dxk7NMb9g)
11. [Reasoning About Programs](https://youtu.be/GfWjhVywdTs)
12. [Induction](https://youtu.be/_Vg10FD5ULk)
13. [Making Append Vanish: Fast Reverse](https://youtu.be/9yJFmoUo200)
14. [Making Append Vanish II: Fast Flatten](https://youtu.be/aenrh3nS-P8)
15. [Compiler Correctness](https://youtu.be/Obqxx94l6CU)

_Additional material:_

* [YouTube playlist](http://tinyurl.com/haskell-notts2)
* [Overview slides](http://people.cs.nott.ac.uk/pszgmh/AFP-intro.pdf)
* [Review of Haskell](http://people.cs.nott.ac.uk/pszgmh/PGP-review.pdf)
* [Sudoku code](http://people.cs.nott.ac.uk/pszgmh/sudoku.lhs) ([slides](http://people.cs.nott.ac.uk/pszgmh/sudoku.ppt))
* [Standard prelude](http://people.cs.nott.ac.uk/pszgmh/prelude-new.pdf)

### Resources

* [Course moodle page](https://moodle.nottingham.ac.uk/course/view.php?id=136231) (internal version of this page)
* [Haskell home page](http://www.haskell.org/) (for all things Haskell)
* [GHC](http://haskell.org/downloads/) (the Glasgow Haskell Compiler)
* [Hoogle](http://www.haskell.org/hoogle/) (for searching the libraries)

\
