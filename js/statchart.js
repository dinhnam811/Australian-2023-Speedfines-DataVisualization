function drawStatChart(statData) {
  const statsByState = statData.reduce((acc, d) => {
    acc[d.state] = {
      fines: d.fines,
      arrests: d.arrests,
      charges: d.charges
    };
    return acc;
  }, {});

  function animateValue(element, start, end, duration = 800) {
    if (start === end) return;

    const range = end - start;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (range * easeOutQuart));
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = end.toLocaleString();
      }
    }

    requestAnimationFrame(updateCount);
  }

  function updateStatsForState(state) {
    const stats = statsByState[state] || { fines: 0, arrests: 0, charges: 0 };
    const statChart = document.getElementById('stat-chart');

    if (statChart) {
      const currentFines = statChart.querySelector('.fines-value');
      const currentArrests = statChart.querySelector('.arrests-value');
      const currentCharges = statChart.querySelector('.charges-value');

      let prevFines = 0, prevArrests = 0, prevCharges = 0;

      if (currentFines) prevFines = parseInt(currentFines.textContent.replace(/,/g, ''));
      if (currentArrests) prevArrests = parseInt(currentArrests.textContent.replace(/,/g, ''));
      if (currentCharges) prevCharges = parseInt(currentCharges.textContent.replace(/,/g, ''));

      // 👇 Fixed horizontal structure using nested flex children
      statChart.innerHTML = `
        <div class="stat-item">
          <div class="label">Total Fines:</div>
          <div class="value fines-value">${prevFines.toLocaleString()}</div>
        </div>
        <div class="stat-item">
          <div class="label">Arrests:</div>
          <div class="value arrests-value">${prevArrests.toLocaleString()}</div>
        </div>
        <div class="stat-item">
          <div class="label">Charges:</div>
          <div class="value charges-value">${prevCharges.toLocaleString()}</div>
        </div>
      `;

      animateValue(statChart.querySelector('.fines-value'), prevFines, stats.fines, 800);
      animateValue(statChart.querySelector('.arrests-value'), prevArrests, stats.arrests, 800);
      animateValue(statChart.querySelector('.charges-value'), prevCharges, stats.charges, 800);
    }
  }

  window.updateStatsForState = updateStatsForState;
  updateStatsForState('VIC');
}
