# JsCron - Node.js Cron Task Manager ⏰🚀

A powerful and flexible class for managing scheduled tasks using `node-cron` in Node.js with TypeScript support.

## Features

- Create, destroy, pause, and resume cron jobs easily.
- Manage tasks using the underlying `node-cron` API.
- Supports setting default configurations like timezone and running tasks on initialization.

## Installation

Install the package `@kreisler/js-cron`:

```bash
npm install @kreisler/js-cron
```

## Import the class

Import JsCron with ES Module syntax:

```javascript
import { JsCron } from '@kreisler/js-cron';
```

or using CommonJS:

```javascript
const { JsCron } = require('@kreisler/js-cron');
```

## Usage

Create a new instance of JsCron:

```javascript
const JsCron = new JsCron({ timezone: 'America/Bogota' });
```

### Creating a Task

To create a new scheduled task, use the createTask method with a name, cron expression, and a callback function:

```javascript
const result = JsCron.createTask('morningTask', '0 0 8 * * *', () => {
  console.log('Buenos días! ☀️');
});
console.log(result); // { success: true, message: 'Tarea "morningTask" creada con éxito.' }
```

### Destroying a Task

Use destroyTask to stop and remove a task by its name:

```javascript
const result = jsCron.destroyTask('morningTask');
console.log(result); // { success: true, message: 'Tarea "morningTask" destruida con éxito.' }
```

### Pausing a Task

Pause an existing task without removing it:

```javascript
const result = jsCron.pauseTask('morningTask');
console.log(result); // { success: true, message: 'Tarea "morningTask" pausada.' }
```

### Resuming a Paused Task

Resume a paused task:

```javascript
const result = jsCron.resumeTask('morningTask');
console.log(result); // { success: true, message: 'Tarea "morningTask" reanudada.' }
```

### Getting All Tasks

Retrieve all managed tasks:

```javascript
const tasks = jsCron.getTasks();
console.log(tasks); // Outputs a Map containing all the ScheduledTask instances
```

### Getting a Specific Task

Get a specific task by its name:

```javascript
const task = jsCron.getTask('morningTask');
console.log(task); // Outputs the ScheduledTask instance or undefined if not found
```

## Examples

### Example #1: Basic Usage

Create a task that runs every 10 seconds:

```javascript
const jsCron = new JsCron();
jsCron.createTask('taskEvery10Seconds', '*/10 * * * * *', () => {
  console.log('Task running every 10 seconds!');
});
```

## Configuration Options

You can pass configuration options to the constructor, such as timezone and runOnInit:

```javascript
const jsCron = new JsCron({
  timezone: 'America/Bogota',
  runOnInit: true // Optional, will run tasks immediately upon creation
});
```
