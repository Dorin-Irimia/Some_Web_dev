document.addEventListener('DOMContentLoaded', () => {
  const summaryItemsContainer = document.getElementById('summaryItemsContainer');
  const avgElement = document.querySelector('.score');
  const assessmentText = document.querySelector('.assessment .assessment-text');

  if (!summaryItemsContainer || !avgElement){
    console.error("Elementul cu ID_ul 'summaryItemsContainer' nu a fost gasit");
      return;
  }

  // 1. Debugging: Log the current directory to check the relative path
  console.log("Current directory:", window.location.href); // Or document.URL

  // 2. Fetch the JSON (Corrected Path - SEE BELOW!)
  fetch('data.json') // Or fetch('data.json') if in the same folder
    .then(response => {
      if (!response.ok) { // Check for HTTP errors (404, 500, etc.)
        throw new Error(`HTTP error! status: ${response.status}`); // Throw error for .catch
      }
      return response.json();
    })
    .then(jsonData => {
      let totalValue = 0;

      jsonData.forEach(item => {
        totalValue += item.score;

        const summaryItem = document.createElement('div');
        summaryItem.classList.add('summary-item', item.category.toLowerCase());

        summaryItem.innerHTML = `
          <div class="item-icon">
            <img src="${item.icon}" alt="${item.category} Icon">
          </div>
          <div class="item-details">
            <span class="item-category">${item.category}</span>
            <span class="item-score">${item.score} / 100</span>
          </div>
        `;

        summaryItemsContainer.appendChild(summaryItem);
      });
      const avregeVal = Math.round(totalValue / 4);
      avgElement.textContent = avregeVal;
      if (avregeVal <= 65){
        assessmentText.classList.add("hidden");
      }
    })
    .catch(error => {
      console.error('Error fetching JSON:', error);
      summaryItemsContainer.innerHTML = "<p>Error loading data. Check the console for details.</p>";
    });
});