#[derive(Debug)]
struct User { id: u32 }

trait Named { fn name(&self) -> &str; }

// Unsafe is a keyword, not an error diagnostic.
unsafe fn example<'a>(user: &'a User) -> u32 {
    println!("id: {}", user.id);
    user.id
}
