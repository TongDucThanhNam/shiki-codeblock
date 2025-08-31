# Language Support Test

This plugin now supports **ALL** Shiki languages with automatic loading! Languages are loaded on-demand when first used.

## JSON Test (Should now work!)

```json
{
	"name": "shiki-codeblock-plugin",
	"version": "1.0.0",
	"description": "Testing JSON syntax highlighting",
	"main": "main.js",
	"scripts": {
		"dev": "node esbuild.config.mjs",
		"build": "node esbuild.config.mjs production"
	},
	"dependencies": {
		"shiki": "^1.0.0",
		"obsidian": "latest"
	},
	"devDependencies": {
		"typescript": "^4.7.4",
		"esbuild": "^0.17.3"
	},
	"keywords": ["obsidian", "plugin", "syntax-highlighting"],
	"author": "TongDucThanhNam",
	"license": "MIT"
}
```

## Other Languages That Should Work

### Go (auto-loaded)

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
    person := struct {
        Name string `json:"name"`
        Age  int    `json:"age"`
    }{
        Name: "Alice",
        Age:  30,
    }
    fmt.Printf("Person: %+v\n", person)
}
```

### Rust (auto-loaded)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Person {
    name: String,
    age: u32,
}

fn main() {
    let person = Person {
        name: "Bob".to_string(),
        age: 25,
    };

    println!("Person: {:?}", person);

    let json = serde_json::to_string(&person).unwrap();
    println!("JSON: {}", json);
}
```

### YAML (auto-loaded)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: app-config
    namespace: default
data:
    database_url: "postgresql://user:pass@db:5432/myapp"
    redis_url: "redis://redis:6379/0"
    log_level: "info"
    features:
        - authentication
        - caching
        - monitoring
```

### PHP (auto-loaded)

```php
<?php
class JsonExample {
    private $data;

    public function __construct($data) {
        $this->data = $data;
    }

    public function toJson() {
        return json_encode($this->data, JSON_PRETTY_PRINT);
    }

    public static function fromJson($json) {
        $data = json_decode($json, true);
        return new self($data);
    }
}

$example = new JsonExample([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'active' => true
]);

echo $example->toJson();
?>
```

### TOML (auto-loaded)

```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.0", features = ["full"] }

[dev-dependencies]
clap = "4.0"

[[bin]]
name = "server"
path = "src/server.rs"
```

If any of these code blocks don't have syntax highlighting, check the console for loading messages. The plugin should automatically detect and load any language that Shiki supports!
