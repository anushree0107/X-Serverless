// Import lodash functionality
const _ = require('lodash');

// Set up some sample data
const users = [
  { id: 1, name: 'John', age: 28, active: true },
  { id: 2, name: 'Jane', age: 32, active: false },
  { id: 3, name: 'Bob', age: 45, active: true },
  { id: 4, name: 'Alice', age: 23, active: true },
  { id: 5, name: 'Charlie', age: 37, active: false }
];

// Data filtering and manipulation with lodash
const activeUsers = _.filter(users, { active: true });
const sortedByAge = _.sortBy(users, ['age']);
const averageAge = _.meanBy(users, 'age');
const groupedByActive = _.groupBy(users, 'active');
const oldest = _.maxBy(users, 'age');

// Modern JavaScript features
// Destructuring
const { name, age } = oldest;

// Spread operator
const updatedUsers = [...users, { id: 6, name: 'Diana', age: 29, active: true }];

// Array methods
const names = users.map(user => user.name);
const over30 = users.filter(user => user.age > 30);

// Promises example
function simulateApiCall(data, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`API call completed after ${delay}ms`);
      resolve(data);
    }, delay);
  });
}

// Async function with multiple operations
async function processData() {
  console.log('Starting data processing...');
  
  try {
    // Simulate multiple API calls with different delays
    const result1 = await simulateApiCall('User data fetched', 300);
    console.log(result1);
    
    const result2 = await simulateApiCall('Posts data fetched', 200);
    console.log(result2);
    
    // Process the results
    console.log('Processing complete!');
    
    return 'All operations successful';
  } catch (error) {
    console.error('An error occurred:', error);
    return 'Operation failed';
  }
}

// Current execution timestamp
const now = new Date();
console.log(`Script executed at: ${now.toISOString()}`);
console.log(`Current User: SRINJOY59`);

// Object and array operations output
console.log('\n--- User Data Analysis ---');
console.log('All users:', users);
console.log('Active users:', activeUsers);
console.log('Sorted by age:', sortedByAge);
console.log('Average age:', averageAge);
console.log('Grouped by active status:', groupedByActive);
console.log('Oldest user:', oldest);
console.log('Oldest user details:', `${name} is ${age} years old`);
console.log('User names:', names);
console.log('Users over 30:', over30);

// Execute the async function
console.log('\n--- Async Operations ---');
processData().then(result => {
  console.log('Final result:', result);
  console.log('\n--- Script Execution Complete ---');
});