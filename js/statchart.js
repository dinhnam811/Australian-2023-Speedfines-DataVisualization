function drawStatChart(statData) {
    const statsByState = statData.reduce((acc, d) => {
      acc[d.state] = {
        fines: d.fines,
        arrests: d.arrests,
        charges: d.charges
      };
      return acc;
    }, {});
  
    // Animation function for counting numbers
    function animateValue(element, start, end, duration = 800) {
      if (start === end) return;
      
      const range = end - start;
      const startTime = performance.now();
      
      function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
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
      const stats = statsByState[state] || {fines: 0, arrests: 0, charges: 0};
      const statChart = document.getElementById('stat-chart');
      
      if (statChart) {
        // Get current values before updating
        const currentFines = statChart.querySelector('.fines-value');
        const currentArrests = statChart.querySelector('.arrests-value');
        const currentCharges = statChart.querySelector('.charges-value');
        
        let prevFines = 0, prevArrests = 0, prevCharges = 0;
        
        if (currentFines) prevFines = parseInt(currentFines.textContent.replace(/,/g, ''));
        if (currentArrests) prevArrests = parseInt(currentArrests.textContent.replace(/,/g, ''));
        if (currentCharges) prevCharges = parseInt(currentCharges.textContent.replace(/,/g, ''));
  
        statChart.innerHTML = `
          <div>Total Fines: <span class="fines-value">${prevFines.toLocaleString()}</span></div>
          <div>Arrests: <span class="arrests-value">${prevArrests.toLocaleString()}</span></div>
          <div>Charges: <span class="charges-value">${prevCharges.toLocaleString()}</span></div>
        `;
  
        // Animate to new values
        const finesElement = statChart.querySelector('.fines-value');
        const arrestsElement = statChart.querySelector('.arrests-value');
        const chargesElement = statChart.querySelector('.charges-value');
  
        animateValue(finesElement, prevFines, stats.fines, 800);
        animateValue(arrestsElement, prevArrests, stats.arrests, 800);
        animateValue(chargesElement, prevCharges, stats.charges, 800);
      }
    }
  
    window.updateStatsForState = updateStatsForState;
    updateStatsForState('VIC');
  }