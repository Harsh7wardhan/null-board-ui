const express = require('express');
const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');
const { Queue, Worker } = require('bullmq');

// Create your queues   
const connection = {
  host: '127.0.0.1', // Redis host
  port: 6379, // Redis port
};

const step3Queue = new Queue('step3Queue', { connection });
const step2Queue = new Queue('step2Queue', { connection });
const step1Queue = new Queue('step1Queue', { connection });

// Create your workers
const step3Worker = new Worker('step3Queue', async job => {
  console.log('Step 3 started');
  // Perform Step 3 tasks
  console.log('Step 3 completed');
  await step2Queue.add('Step 2 Job'); // Start Step 2 after Step 3 completes
  return job.id;
}, { connection });

const step2Worker = new Worker('step2Queue', async job => {
  console.log('Step 2 started');
  // Perform Step 2 tasks
  console.log('Step 2 completed');
  await step1Queue.add('Step 1 Job'); // Start Step 1 after Step 2 completes
  return job.id;
}, { connection });

const step1Worker = new Worker('step1Queue', async job => {
  console.log('Step 1 started');
  // Perform Step 1 tasks
  console.log('Step 1 completed');
  return job.id;
}, { connection });

// Create Bull Board
const { router } = createBullBoard([
  new BullAdapter(step3Queue),
  new BullAdapter(step2Queue),
  new BullAdapter(step1Queue),
]);

// Create Express app
const app = express();

// Mount Bull Board UI at /admin/queues
app.use('/admin/queues', router);

// Other configurations for your Express server

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
