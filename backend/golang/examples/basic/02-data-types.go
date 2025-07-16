// 02-data-types.go
// 演示Go语言的基本数据类型

package main

import (
    "fmt"
    "math"
    "reflect"
)

func main() {
    // 整数类型
    var int8Val int8 = 127
    var int16Val int16 = 32767
    var int32Val int32 = 2147483647
    var int64Val int64 = 9223372036854775807
    var intVal int = 42
    
    fmt.Println("=== 整数类型 ===")
    fmt.Printf("int8: %d (type: %T)\n", int8Val, int8Val)
    fmt.Printf("int16: %d (type: %T)\n", int16Val, int16Val)
    fmt.Printf("int32: %d (type: %T)\n", int32Val, int32Val)
    fmt.Printf("int64: %d (type: %T)\n", int64Val, int64Val)
    fmt.Printf("int: %d (type: %T)\n", intVal, intVal)
    
    // 无符号整数类型
    var uint8Val uint8 = 255
    var uint16Val uint16 = 65535
    var uint32Val uint32 = 4294967295
    var uint64Val uint64 = 18446744073709551615
    var uintVal uint = 42
    
    fmt.Println("\n=== 无符号整数类型 ===")
    fmt.Printf("uint8: %d (type: %T)\n", uint8Val, uint8Val)
    fmt.Printf("uint16: %d (type: %T)\n", uint16Val, uint16Val)
    fmt.Printf("uint32: %d (type: %T)\n", uint32Val, uint32Val)
    fmt.Printf("uint64: %d (type: %T)\n", uint64Val, uint64Val)
    fmt.Printf("uint: %d (type: %T)\n", uintVal, uintVal)
    
    // 浮点数类型
    var float32Val float32 = 3.14159
    var float64Val float64 = 3.141592653589793
    
    fmt.Println("\n=== 浮点数类型 ===")
    fmt.Printf("float32: %.5f (type: %T)\n", float32Val, float32Val)
    fmt.Printf("float64: %.15f (type: %T)\n", float64Val, float64Val)
    fmt.Printf("math.Pi: %.15f\n", math.Pi)
    
    // 布尔类型
    var boolVal bool = true
    var boolVal2 bool = false
    
    fmt.Println("\n=== 布尔类型 ===")
    fmt.Printf("bool1: %t (type: %T)\n", boolVal, boolVal)
    fmt.Printf("bool2: %t (type: %T)\n", boolVal2, boolVal2)
    
    // 字符串类型
    var stringVal string = "Hello, Go!"
    var runeString string = "你好，世界！"
    
    fmt.Println("\n=== 字符串类型 ===")
    fmt.Printf("string: %s (type: %T)\n", stringVal, stringVal)
    fmt.Printf("中文字符串: %s (长度: %d)\n", runeString, len(runeString))
    fmt.Printf("中文字符串rune长度: %d\n", len([]rune(runeString)))
    
    // 字符类型
    var byteVal byte = 'A'
    var runeVal rune = '中'
    
    fmt.Println("\n=== 字符类型 ===")
    fmt.Printf("byte: %c (ASCII: %d, type: %T)\n", byteVal, byteVal, byteVal)
    fmt.Printf("rune: %c (Unicode: %d, type: %T)\n", runeVal, runeVal, runeVal)
    
    // 数组类型
    var intArray [5]int = [5]int{1, 2, 3, 4, 5}
    var stringArray [3]string = [3]string{"Go", "Python", "Java"}
    
    fmt.Println("\n=== 数组类型 ===")
    fmt.Printf("int数组: %v (type: %T)\n", intArray, intArray)
    fmt.Printf("string数组: %v (type: %T)\n", stringArray, stringArray)
    
    // 切片类型
    var intSlice []int = []int{1, 2, 3, 4, 5}
    var stringSlice []string = make([]string, 3)
    stringSlice[0] = "Go"
    stringSlice[1] = "Python"
    stringSlice[2] = "Java"
    
    fmt.Println("\n=== 切片类型 ===")
    fmt.Printf("int切片: %v (长度: %d, 容量: %d, type: %T)\n", 
        intSlice, len(intSlice), cap(intSlice), intSlice)
    fmt.Printf("string切片: %v (长度: %d, 容量: %d, type: %T)\n", 
        stringSlice, len(stringSlice), cap(stringSlice), stringSlice)
    
    // map类型
    var stringMap map[string]int = make(map[string]int)
    stringMap["Go"] = 2009
    stringMap["Python"] = 1991
    stringMap["Java"] = 1995
    
    fmt.Println("\n=== Map类型 ===")
    fmt.Printf("map: %v (type: %T)\n", stringMap, stringMap)
    
    // 结构体类型
    type Person struct {
        Name string
        Age  int
    }
    
    var person Person = Person{
        Name: "Alice",
        Age:  30,
    }
    
    fmt.Println("\n=== 结构体类型 ===")
    fmt.Printf("person: %+v (type: %T)\n", person, person)
    
    // 指针类型
    var x int = 42
    var p *int = &x
    
    fmt.Println("\n=== 指针类型 ===")
    fmt.Printf("x: %d (地址: %p)\n", x, &x)
    fmt.Printf("p: %p (指向的值: %d, type: %T)\n", p, *p, p)
    
    // 接口类型
    var empty interface{} = 42
    var empty2 interface{} = "Hello"
    
    fmt.Println("\n=== 接口类型 ===")
    fmt.Printf("empty: %v (实际类型: %T)\n", empty, empty)
    fmt.Printf("empty2: %v (实际类型: %T)\n", empty2, empty2)
    
    // 通道类型
    var ch chan int = make(chan int)
    var ch2 chan<- int = make(chan int) // 只写通道
    var ch3 <-chan int = make(chan int) // 只读通道
    
    fmt.Println("\n=== 通道类型 ===")
    fmt.Printf("ch: %v (type: %T)\n", ch, ch)
    fmt.Printf("ch2: %v (type: %T)\n", ch2, ch2)
    fmt.Printf("ch3: %v (type: %T)\n", ch3, ch3)
    
    // 函数类型
    var fn func(int, int) int = func(a, b int) int {
        return a + b
    }
    
    fmt.Println("\n=== 函数类型 ===")
    fmt.Printf("fn: %v (type: %T)\n", fn, fn)
    fmt.Printf("fn(3, 4): %d\n", fn(3, 4))
    
    // 零值演示
    fmt.Println("\n=== 零值 ===")
    var zeroInt int
    var zeroFloat float64
    var zeroBool bool
    var zeroString string
    var zeroSlice []int
    var zeroMap map[string]int
    var zeroPtr *int
    
    fmt.Printf("int零值: %d\n", zeroInt)
    fmt.Printf("float64零值: %f\n", zeroFloat)
    fmt.Printf("bool零值: %t\n", zeroBool)
    fmt.Printf("string零值: '%s'\n", zeroString)
    fmt.Printf("slice零值: %v (nil: %t)\n", zeroSlice, zeroSlice == nil)
    fmt.Printf("map零值: %v (nil: %t)\n", zeroMap, zeroMap == nil)
    fmt.Printf("pointer零值: %v (nil: %t)\n", zeroPtr, zeroPtr == nil)
    
    // 类型转换
    fmt.Println("\n=== 类型转换 ===")
    var i int = 42
    var f float64 = float64(i)
    var s string = fmt.Sprintf("%d", i)
    
    fmt.Printf("int: %d -> float64: %f -> string: %s\n", i, f, s)
    
    // 类型推断
    fmt.Println("\n=== 类型推断 ===")
    auto1 := 42
    auto2 := 3.14
    auto3 := "hello"
    auto4 := true
    
    fmt.Printf("auto1: %v (type: %s)\n", auto1, reflect.TypeOf(auto1))
    fmt.Printf("auto2: %v (type: %s)\n", auto2, reflect.TypeOf(auto2))
    fmt.Printf("auto3: %v (type: %s)\n", auto3, reflect.TypeOf(auto3))
    fmt.Printf("auto4: %v (type: %s)\n", auto4, reflect.TypeOf(auto4))
}