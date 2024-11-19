USE promptbook;

-- Table for authors of prompt fragments and composite prompts
CREATE TABLE author (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Table for prompt fragments that can be combined to create composite prompts
CREATE TABLE prompt_fragment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);

-- Table for tags to categorize prompt fragments
CREATE TABLE tag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Join table for many-to-many relationship between prompt fragments and tags
CREATE TABLE prompt_fragment_tag (
    prompt_fragment_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (prompt_fragment_id, tag_id),
    FOREIGN KEY (prompt_fragment_id) REFERENCES prompt_fragment(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- Table for composite prompts that consist of multiple prompt fragments
CREATE TABLE composite_prompt (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);

-- Table for result examples associated with composite prompts
CREATE TABLE result_example (
    id INT PRIMARY KEY AUTO_INCREMENT,
    composite_prompt_id INT NOT NULL,
    result_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (composite_prompt_id) REFERENCES composite_prompt(id) ON DELETE CASCADE
);

-- Table for context files that can be added to composite prompts
CREATE TABLE context_file (
    id INT PRIMARY KEY AUTO_INCREMENT,
    composite_prompt_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (composite_prompt_id) REFERENCES composite_prompt(id) ON DELETE CASCADE
);

-- Link table for the 1-to-many relationship between composite prompts and prompt fragments
CREATE TABLE composite_prompt_prompt_fragment (
    composite_prompt_id INT NOT NULL,
    prompt_fragment_id INT NOT NULL,
    order_index INT NOT NULL,
    PRIMARY KEY (composite_prompt_id, prompt_fragment_id),
    FOREIGN KEY (composite_prompt_id) REFERENCES composite_prompt(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_fragment_id) REFERENCES prompt_fragment(id) ON DELETE CASCADE,
    UNIQUE (composite_prompt_id, order_index)
);

-- Fill the tables with some initial data
INSERT INTO author (name, email, password_hash) 
VALUES ('Ties Noordhuis', 'ties.noordhuis@example.com', '$2b$12$qOUVzebv3GkG8W8IeWL.Ie14C9U2jvXvNd/4Pgt3x92BNGuQVA3zW');

INSERT INTO prompt_fragment (author_id, content, description) VALUES
    (1, 'Explain the underlying concepts, principles, and steps needed to approach and solve this problem, without giving direct answers or writing the code. Focus on helping me understand why specific approaches, patterns, or structures are effective, and outline general strategies or pitfalls to consider. Offer conceptual guidance, best practices, and examples in plain language so I can apply these ideas independently to write the solution myself.', 'Explain concepts to solve exercises and to understand the underlying principles.'),
    (1, 'Make sure to ask me additional questions or request further context if it would improve the response quality or make it more specific to my needs and tailored to my situation.', 'Ask extra questions and context.'),
    (1, 'When explaining concepts or discussing languages and frameworks, please reference the most recent, stable versions only. Use modern syntax and standards, such as ES6, PHP8, Python3.12 and other contemporary frameworks and libraries, avoiding outdated versions like Bootstrap 4 or older syntaxes such as mysqli. Ensure explanations reflect best practices and syntax aligned with current documentation.', 'Use modern syntax and standards.'),
    (1, 'I need to find the most common value in an array in javascript.', 'JavaScript exercise: find the most common value in an array.');

INSERT INTO tag (name) VALUES ('coding'), ('general'), ('nexed_exercise');

INSERT INTO prompt_fragment_tag (prompt_fragment_id, tag_id) VALUES
    (1, 1),
    (2, 2),
    (3, 1),
    (4, 1),
    (4, 3);

INSERT INTO composite_prompt (author_id, title, description) VALUES
    (1, 'JavaScript: Find the most common value in an array', 'Combine the provided prompt fragments to create a composite prompt for a JavaScript exercise.');

INSERT INTO composite_prompt_prompt_fragment (composite_prompt_id, prompt_fragment_id, order_index) VALUES
    (1, 1, 1),
    (1, 2, 4),
    (1, 3, 2),
    (1, 4, 3);

INSERT INTO result_example (composite_prompt_id, result_content) VALUES
    (1, "To find the most common value in an array in JavaScript, it's essential to understand some fundamental concepts and principles related to data structures, algorithms, and the JavaScript language itself. Here’s a structured approach to help you tackle this problem independently:

### 1. Understanding the Problem

The task is to identify the value that appears most frequently in an array. This type of problem is often referred to as a \"mode\" in statistics. It's helpful to clarify the requirements:
- What kind of values does the array contain? (e.g., numbers, strings)
- How do you want to handle ties (if two values appear with the same frequency)?
- Are there any constraints on the size of the array or the types of values it can contain?

### 2. Key Concepts

#### a. **Data Structures**
   - **Arrays**: A collection of elements. In JavaScript, you can use arrays to store the values you need to analyze.
   - **Objects/Maps**: These can be used to count occurrences of each value. In ES6, you can utilize `Map` for a more structured approach.

#### b. **Counting Frequencies**
   - To find the most common value, you'll need to count how many times each value appears. This is typically done with a loop or higher-order functions.

#### c. **Identifying the Maximum**
   - After counting occurrences, you need a way to determine which count is the highest. This may involve iterating through your counts to find the maximum.

### 3. Steps to Approach the Problem

#### Step 1: Initialize a Data Structure
Start by initializing a way to store counts. A plain object or a `Map` will work well:
- Each key will be the value from the array.
- Each value will be the count of occurrences.

#### Step 2: Iterate Through the Array
Use a loop (for example, `forEach`, `for...of`, or `reduce`) to go through each element of the array:
- For each element, check if it exists in your counting structure. If it does, increment its count; if not, add it with a count of 1.

#### Step 3: Determine the Maximum Count
After populating your counts:
- Initialize a variable to track the most common value and its count.
- Iterate over your counts to find the key with the highest count. Update your tracking variable whenever you find a higher count.

### 4. Best Practices

- **Avoid Mutating Original Data**: If your solution involves processing an array, consider creating a new structure instead of altering the original array.
- **Consider Edge Cases**: Think about what happens if the array is empty or if all values are unique.
- **Performance Considerations**: Aim for a solution that operates in linear time \(O(n)\) for counting and finding the maximum, rather than using nested loops which would be \(O(n^2)\).

### 5. Common Pitfalls

- **Ignoring Ties**: If you have multiple values with the same maximum frequency, decide how you want to handle this beforehand.
- **Improper Data Types**: Be aware of how JavaScript handles types. For example, the string `'5'` and the number `5` are different.
- **Not Resetting Variables**: Ensure that you correctly initialize and reset variables in each step to avoid carrying over incorrect values.

### 6. Conceptual Example

Consider the following conceptual breakdown:
- **Input**: `[1, 2, 3, 2, 1, 1]`
- **Counting Step**: You would end up with a structure like `{1: 3, 2: 2, 3: 1}`.
- **Finding Maximum**: The maximum count here is `3` for the value `1`.

### Conclusion

By following this structured approach and keeping the principles and pitfalls in mind, you can develop a solution to find the most common value in an array. Consider experimenting with different methods of counting and finding the maximum to see which works best for your specific situation. If you have further context about your specific use case, feel free to share, and I can provide more tailored guidance!");

INSERT INTO context_file (composite_prompt_id, filename, file_path, description) VALUES
    (1, 'array.js', 'context_files/array.js', 'Example array for the JavaScript exercise.');