// Function to fetch worker information from the server
async function fetchWorkerInfo() {
    try {
      const response = await fetch('/workers');
      const workers = await response.json();
      return workers;
    } catch (error) {
      console.error('Error fetching worker information:', error);
      return [];
    }
  }
  
  // Function to display worker information on the page
  async function displayWorkerInfo() {
    const workersList = document.getElementById('workers-list');
    const workers = await fetchWorkerInfo();
  
    if (workers.length === 0) {
      workersList.innerHTML = '<p>No worker information available</p>';
      return;
    }
  
    const html = workers.map(worker => {
      const jobs = worker.jobs.map(job => `<li>${job.id}</li>`).join('');
      return `
        <div>
          <h3>Worker ID: ${worker.id}</h3>
          <ul>
            ${jobs}
          </ul>
        </div>
      `;
    }).join('');
  
    workersList.innerHTML = html;
  }
  
  // Refresh worker information every 5 seconds
  setInterval(displayWorkerInfo, 5000);
  
  // Initial display of worker information
  displayWorkerInfo();
  