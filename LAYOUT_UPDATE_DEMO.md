# Code Block Layout Update Demo

This demonstrates the new modern code block layout inspired by your React component.

## JavaScript Example with Filename

```javascript filename="app.js"
import React, { useState } from "react";

function App() {
	const [count, setCount] = useState(0);

	const handleClick = () => {
		setCount(count + 1);
	};

	return (
		<div className="app">
			<h1>Counter: {count}</h1>
			<button onClick={handleClick}>Increment</button>
		</div>
	);
}

export default App;
```

## Python Example with Line Numbers

```python {1,3,5} title="Data Processing"
import pandas as pd
import numpy as np

def process_data(df):
    # Clean the data
    df = df.dropna()

    # Transform the data
    df['processed'] = df['value'] * 2

    return df

# Example usage
data = pd.DataFrame({
    'value': [1, 2, 3, 4, 5],
    'category': ['A', 'B', 'A', 'B', 'A']
})

result = process_data(data)
print(result)
```

## CSS Example with Folding

```css fold filename="styles.css"
.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.header {
	background: #f8f9fa;
	padding: 1rem 0;
	border-bottom: 1px solid #e9ecef;
}

.nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.nav-link {
	color: #495057;
	text-decoration: none;
	margin: 0 1rem;
	transition: color 0.2s ease;
}

.nav-link:hover {
	color: #007bff;
}
```

## Key Features Updated

1. **Modern Header Design**: Clean file icon + filename layout
2. **Enhanced Copy Button**: Visual feedback with check mark on success
3. **Improved Line Numbers**: Flexbox layout with proper spacing
4. **Better Styling**: Consistent with modern design principles
5. **Responsive Design**: Mobile-friendly adjustments
6. **Visual Polish**: Shadows, borders, and better color scheme
7. **Accessibility**: Focus states and ARIA labels

The layout now closely matches your React component's design while maintaining compatibility with Obsidian's theming system.
