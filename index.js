const { FlowProducer, Worker } = require('bullmq');
// import { FlowProducer , Worker } from 'bullmq';

async function setupFlow() {
    const flowProducer = new FlowProducer();
  
    const flow = await flowProducer.add({
      name: 'renovate-interior',
      queueName: 'renovate',
      children: [
        { 
          name: 'paint', 
          data: { place: 'c1' }, 
          queueName: 'steps',
          children: [
            { name: 'clean', data: { place: 'sc1' }, queueName: 'preparation' },
            { name: 'prime', data: { place: 'sc1' }, queueName: 'preparation' },
            { name: 'paint', data: { place: 'sc1' }, queueName: 'application' },
          ]
        },
      ],
    });
  
    return flow;
  }
  

  async function setupWorkers() {
    // Worker for the 'steps' queue
    const stepsWorker = new Worker('steps', async job => {
      console.log(`Executing ${job.name} job for ${job.data.place}`);
      return 2500; // Simulated cost
    }, {
      connection: {
        host: '127.0.0.1',
        port: 6379,
      }
    });
  
    // Worker for the 'preparation' queue
    const preparationWorker = new Worker('preparation', async job => {
      console.log(`Executing ${job.name} job for ${job.data.place}`);
      return 1500; // Simulated cost
    }, {
      connection: {
        host: '127.0.0.1',
        port: 6379,
      }
    });
  
    // Worker for the 'application' queue
    const applicationWorker = new Worker('application', async job => {
      console.log(`Executing ${job.name} job for ${job.data.place}`);
      return 2000; // Simulated cost
    }, {
      connection: {
        host: '127.0.0.1',
        port: 6379,
      }
    });
  
    // Worker for the 'repair' queue
    const repairWorker = new Worker('repair', async job => {
      console.log(`Executing ${job.name} job for ${job.data.place}`);
      return 1800; // Simulated cost
    }, {
      connection: {
        host: '127.0.0.1',
        port: 6379,
      }
    });
  }
  
  

async function main() {
  await setupFlow();
  await setupWorkers();
}

main().catch(console.error);