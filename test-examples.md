# Shiki Code Block Header Examples

## Basic Code Block (with language icon if copy is enabled)

```javascript
console.log("Basic code block with language icon");
```

## Code Block with Filename and Language Icon

```javascript filename:"app.js"
function greet(name) {
	return `Hello, ${name}!`;
}

const message = greet("World");
console.log(message);
```

## Python Example with Filename

```python filename:"fibonacci.py"
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(calculate_fibonacci(10))
```

## TypeScript with Header

```typescript filename:"types.ts"
interface User {
	id: number;
	name: string;
	email: string;
	isActive: boolean;
}

type UserRole = "admin" | "user" | "moderator";

class UserService {
	private users: User[] = [];

	addUser(user: User): void {
		this.users.push(user);
	}

	getUserById(id: number): User | undefined {
		return this.users.find((u) => u.id === id);
	}
}
```

## React Component Example

```jsx filename:"Button.jsx"
import React from "react";

const Button = ({
	children,
	onClick,
	variant = "primary",
	disabled = false,
}) => {
	return (
		<button
			className={`btn btn-${variant}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
};

export default Button;
```

## Rust Example

```rust filename:"main.rs"
use std::collections::HashMap;

fn main() {
    let mut inventory = HashMap::new();

    inventory.insert("apples", 50);
    inventory.insert("bananas", 30);

    for (item, quantity) in &inventory {
        println!("Item: {}, Quantity: {}", item, quantity);
    }
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
	border-bottom: 1px solid var(--border-color);
}

.language-icon {
	font-size: 1.25rem;
	margin-right: 0.75rem;
}
```

## Bash Script Example

```bash filename:"deploy.sh"
#!/bin/bash

echo "Starting deployment..."

npm run build
docker build -t myapp .
docker push myapp:latest

echo "Deployment completed!"
```
