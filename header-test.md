# Fixed CodeBlock Header Test

## TypeScript Example (like in your image)

```typescript filename:"router.ts"
import express from "express";
import UserController from "../Controllers/UserController";

const router = express.Router();
const userController = new UserController();

router.get("/users", userController.getAllUsers);
router.post("/users", userController.createUser);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

export default router;
```

## JavaScript Example

```javascript filename:"app.js"
function calculateTotal(items) {
	return items.reduce((sum, item) => sum + item.price, 0);
}

const cart = [
	{ name: "Book", price: 29.99 },
	{ name: "Pen", price: 2.5 },
];

console.log(`Total: $${calculateTotal(cart)}`);
```

## Python Example

```python filename:"main.py"
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## Rust Example

```rust filename:"main.rs"
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();

    println!("Original: {:?}", numbers);
    println!("Doubled: {:?}", doubled);
}
```

## CSS Example

```css filename:"styles.css"
.code-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	background: var(--background-secondary);
}

.language-badge {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: var(--background-primary-alt);
	padding: 0.25rem 0.75rem;
	border-radius: 0.375rem;
}
```
