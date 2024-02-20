const { FlowProducer, Worker } = require('bullmq');
// import { FlowProducer , Worker } from 'bullmq';

async function setupFlow() {
  const flowProducer = new FlowProducer();

  const flow = await flowProducer.add({
    name: 'renovate-interior',
    queueName: 'renovate',
    children: [
      { name: 'paint', data: { place: 'ceiling' }, queueName: 'steps' },
      { name: 'paint', data: { place: 'walls' }, queueName: 'steps' },
      { name: 'fix', data: { place: 'floor' }, queueName: 'steps' },
    ],
  });

  return flow;
}

async function setupWorkers() {
    const stepsWorker = new Worker('steps', async job => {
      // Simulated step execution
      console.log(`Executing ${job.name} job for ${job.data.place}`);
      return 2500; // Simulated cost
    }, {
      connection: {
        host: '127.0.0.1', // Redis host
        port: 6379, // Redis port
        // Add any other connection options as needed (e.g., password)
      }
    });
  
    const renovateWorker = new Worker('renovate', async job => {
      const childrenValues = await job.getChildrenValues();
  
      const totalCosts = Object.values(childrenValues).reduce(
        (prev, cur) => prev + cur,
        0,
      );
  
      console.log(`Total cost for renovation: $${totalCosts}`);
    }, {
      connection: {
        host: '127.0.0.1', // Redis host
        port: 6379, // Redis port
        // Add any other connection options as needed (e.g., password)
      }
    });
  }
  

async function main() {
  await setupFlow();
  await setupWorkers();
}

main().catch(console.error);