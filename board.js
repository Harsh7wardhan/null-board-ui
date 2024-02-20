const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue: QueueMQ, Worker } = require('bullmq');
const express = require('express');

const redisOptions = {
  port: 6379,
  host: 'localhost',
  password: '',
  tls: false,
};

const createQueueMQ = (name) => new QueueMQ(name, { connection: redisOptions });

async function setupBullMQProcessor(queueName, concurrency = 1) {
  new Worker(queueName, async (job) => {
    await sleep(1); // Wait for 1 second to simulate job processing time
    await job.updateProgress(100); // Update job progress to 100% to indicate completion
    await job.log(`Processing job ${job.id}`); // Log job status

    return { jobId: `This is the return value of job (${job.id})` };
  }, { connection: redisOptions, concurrency }); // Set concurrency here
}

const run = async () => {
  const exampleBullMq = createQueueMQ('BullMQ');

  // Populate the queue with 1000 jobs
  for (let i = 0; i < 1000; i++) {
    exampleBullMq.add('Add', { title: `Job ${i + 1}` });
  }

  await setupBullMQProcessor(exampleBullMq.name, 10);

  const app = express();

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/ui');

  const bullBoard = createBullBoard({
    queues: [new BullMQAdapter(exampleBullMq)],
    serverAdapter,
  });

  // Custom middleware to add additional information to the UI
  app.use('/ui', (req, res, next) => {
    res.locals.activeJobs = exampleBullMq.getActiveCount();
    res.locals.concurrency = 10; // Set the concurrency level here
    next();
  });

  app.use('/ui', serverAdapter.getRouter());

  app.use('/add', (req, res) => {
    const opts = req.query.opts || {};

    if (opts.delay) {
      opts.delay = +opts.delay * 1000; // delay must be a number
    }

    exampleBullMq.add('Add', { title: req.query.title }, opts);

    res.json({
      ok: true,
    });
  });

  app.listen(3000, () => {
    console.log('Running on 3000...');
    console.log('For the UI, open http://localhost:3000/ui');
    console.log('Make sure Redis is running on port 6379 by default');
    console.log('To populate the queue, run:');
    console.log('  curl http://localhost:3000/add?title=Example');
    console.log('To populate the queue with custom options (opts), run:');
    console.log('  curl http://localhost:3000/add?title=Test&opts[delay]=9');
  });
};

// Helper function to simulate a delay
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

// Start the application
run().catch(console.error);
