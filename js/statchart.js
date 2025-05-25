function drawStatChart(statData) {
    const statsByState = statData.reduce((acc, d) => {
        acc[d.state] = {
            fines: d.fines,
            arrests: d.arrests,
            charges: d.charges
        };
        return acc;
    }, {});

    
    function updateStatsForState(state) {
        const stats = statsByState[state] || {fines: 0, arrests: 0, charges: 0};
        const statChart = document.getElementById('stat-chart');
        
        if (statChart) {
            statChart.innerHTML = `
                <div>Total Fines: ${stats.fines.toLocaleString()}</div>
                <div>Arrests: ${stats.arrests.toLocaleString()}</div>
                <div>Charges: ${stats.charges.toLocaleString()}</div>
            `;
        }
    }


    window.updateStatsForState = updateStatsForState;
    
    
    updateStatsForState('VIC');
}