# Kotlin

## Overview

Kotlin is basically a better alternative to Java  
Compiles to bytecode that runs on the JVM  
- Can also compile to native code and javascript  

Kotlin is interoperable with Java  
Kotlin is now the preferred language for android development over Java  

For writing Kotlin it makes sense to use IntelliJ  

<br />

## Language Basics

### **Hello World**

```kt
fun main(args: Array<String>) {
    println("Hello World!")
}
```

### **var vs val**

`val` is not reassignable, `var` is

### **Kotlin is Statically Typed**

However, there is type inference if a variable is instantiated when it is declared. ie:  
```kt
var firstName = "Scott" // String declarer not required because is instantiated  
var firstName: String // String declarer is required because is not instantiated
```

### **Strings**

```kt
val myString = "KOTLIN"
println(myString[0]) // output: K
println(myString[1]) // output: O
println(myString.isEmpty()); // output: false
println(myString.length) // output: 6
println(myString.substring(2,4)) // output: TL
println("The String is $myString")
```

### **Conditionals**

```kt
val examScore = 55
if (examScore > 70)
{
    println("you passed!")
}
else
{
    println("you failed")
}
```

### **Collections**

```kt
val names = mutableListOf("Ali", "Maya", "Scott")
println(names[2])
names.add("Beth")

val list2 = mutableListOf<String>()
list2.add("Scott")
list2.add("Beth")

println(list2)
```

### **Loops**

```kt
val names = mutableListOf<String>("Scott", "Piggy", "Ruth")
for (name in names)
{
    println(name)
}
for (i in 1..5)
{
    println(i) // 1 2 3 4 5
}
```

### **Nullability**

`?` is required on type declaration if variable can be set to `null`

```kt
val string1: String
string1 = null // Throws an error

val string2: String?
string2 = null
```

<br />

## Compiling Kotlin to a .jar file

Install kotlin compiler:  
- `sudo snap install --classic kotlin`  

Example compilation and running:  
- `kotlinc ~/IdeaProjects/TestProject/src/main/kotlin/Main.kt -include-runtime -d hello.jar`
- `java -jar hello.jar`



