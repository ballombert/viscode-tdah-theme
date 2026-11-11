package main

import "fmt"

// Keep strings and types distinguishable.
type User struct { Name string }

func main() {
    messages := make(chan string, 1)
    messages <- "Hello"
    fmt.Printf("%s: %d\n", <-messages, 42)
}
