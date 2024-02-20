const { FlowProducer, Worker } = require('bullmq');

async function main() {
  const flowProducer = new FlowProducer();
  const queueName = 'assembly-line';
  const connection = {
    host: '127.0.0.1', // Redis host
    port: 6379, // Redis port
  };

  const assemblyLineFlow = await flowProducer.add({
    name: 'product',
    data: { step: 'step1' },
    queueName,
    children: [
      {
        name: 'sub-product',
        data: { step: 'step2' },
        queueName,
        children: [
          {
            name: 'gsub-product',
            data: { step: 'step3' },
            queueName,
          },
        ],
      },
    ],
  });

  const step1Worker = new Worker(queueName, async job => {
    console.log('Step 1 started');
    // Step 1 tasks
    console.log('Step 1 completed');
    return job.id;
  }, { connection });

  const step2Worker = new Worker(queueName, async job => {
    console.log('Step 2 started');
    // Step 2 tasks
    console.log('Step 2 completed');
    return job.id;
  }, { connection });

  const step3Worker = new Worker(queueName, async job => {
    console.log('Step 3 started');
    // Step 3 tasks
    console.log('Step 3 completed');
    return job.id;
  }, { connection });

  // Handle completion of each step
  step1Worker.on('completed', async job => {
    console.log('All child jobs completed, moving parent job to completed.');
    await job.moveToCompleted();
  });

  step2Worker.on('completed', async job => {
    // Wait for gsub-product (Step 3) to complete
    await new Promise(resolve => {
      step3Worker.once('completed', resolve);
    });
    await job.moveToCompleted();
  });

  step3Worker.on('completed', async job => {
    await job.moveToCompleted();
  });
}

main().catch(err => {
  console.error('An error occurred:', err);
});
