# [Colaborative Works with Git Version Control System NOT MY README]()

## Works with task "Artifact phone"

### Prompt for task

# Programming with Variables as Simplest Data Structure

## Problem Legend

You are an employee of Nova Poshta, a large batch of new mobile phones of the same model Xiaomi arrives at your place. You suspect that one of the phones is artifactual (for example, there is no battery), because this has happened before. We have no light for various reasons, but you have a stylus and a diamond ruler. You need to find the artifactual phone in less than a minute, or say that all the phones are fine.

## Subproblem 1

You need to present an algorithm for solving this problem using a very limited number of variables without using any datastructures!

## Subproblem 2

You need to present an algorithm for solving this problem using a very limited number of variables and the least number of operations without using any datastructures!

## Task 1.

Write the simplest C++ program with console input and output that solves the problem - "Is there 1 artifact phone in the batch of phones?"

I want a simplest C++ program that takes input weights of phones, checks if there is exactly one artifact phone with a different weight from others, and outputs "Yes" if there is exactly one artifact and "No" otherwise.

## Requirements

### Requirement 1

Build two programs (AI can be used) on onecompiler.com hosting

### Requirement 2

Use only variables in programs (no other data structures can be used)!

### Input-output examples

For the input data for the problem when we have 7 phones:
200 200 200 200 200 100 200
we must get answer
Yes

For the input data
300 300 175 300 300 300 300
we must get answer
Yes

For the input data
150 150 150 150 150 150 150
we must get answer
No

For the input data for the problem when we have 4 phones:
200 200 200 200
we must get answer
No

For the input data
100 100 175 100
we must get answer
Yes

## Variants of codes

### Varaint1 from GPT (erroneous)

```cpp
#include <iostream>

using namespace std;

int main() {
    int n;
     cin >> n;

    int base, diff = 0;
    int same = 0, diffCount = 0;

     cin >> base;

      for (int i = 1; i < n; i++) {
           cout << "\n i="<<i;
           int x;
            cin >> x;
             cout << " x="<<x;
             if(x == base) {
                same++;
             }
             else {
                   if(diffCount == 0) {
                      diff = x;
                      diffCount = 1;
                   }
                   else if(x == diff) {
                           diffCount++;
                        }
                        else {
                              cout << "No";
                               return 0;
                             }
                  }
      }

       if (diffCount == 1)
           cout << "Yes";
       else
           cout << "No";

        return 0;
}

```

### Improvements

...Let simplify code (KISS)
Works fine!
Add Your code!

<h1> My HTML header1</h1>

<h2>hint for html Live Server in codespace </h2>
if you have not istalled Live Server extension for Visual Studio Code, you can install it from terminal by

```
code --install-extension ritwickdey.
```

LiveServer
Then you can right click on html file and select "Open with Live Server"

git
