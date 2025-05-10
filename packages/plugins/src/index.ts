// Example TypeScript code with types and interfaces

// Define an interface for a User
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

// Define a type for a function that takes a User and returns a string
type GreetUser = (user: User) => string;

// Example implementation of the GreetUser function
const greetUser: GreetUser = (user) => {
    return `Hello, ${user.name}! Your email is ${user.email}.`;
};

// Example usage
const exampleUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    isActive: true
};

console.log(greetUser(exampleUser));
