d3.json("js/australia_states_clean.geojson").then(geoData => {
    const width = 500;
    const height = 500;
  
    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);
  
    const svg = d3.select("#map-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");


  
 
    const populationData = {
      "NSW": 8166000, "VIC": 6681000, "QLD": 5185000,
      "WA": 2667000, "SA": 1770000, "TAS": 541500,
      "ACT": 431200, "NT": 246500
    };

   
    const populationColorScale = d3.scaleSequential()
      .domain([0, d3.max(Object.values(populationData))])
      .interpolator(d3.interpolateBlues);

    geoData.features.forEach(feature => {
      feature.properties.population = populationData[feature.properties.state] || 0;
    });

   
    svg.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => populationColorScale(d.properties.population))
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("opacity", 1)
      .on("click", (event, d) => {
        const selectedState = d.properties.state;
        const year = +document.getElementById("year-filter").value;
        updateBarChart(selectedState, year);
        updateStatsForState(selectedState);

  
        svg.selectAll("path").attr("opacity", 0.3);
        d3.select(event.currentTarget).attr("opacity", 1);
      })
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke-width", 2);
        
        
      
      });

   
    d3.select("#map-chart").on("mouseleave", function() {
        svg.selectAll("path").attr("opacity", 0.6); 
    });
    
    d3.select("#map-chart").on("mouseenter", function() {
        svg.selectAll("path").attr("opacity", 1);
    });
    
    function updateBarChart(selectedState, year) {
        const filteredData = allData.bar.filter(d => 
            d.state === selectedState && d.year === year
        );
        drawBarChart(filteredData);
    }
    
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", 380)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#333") 
    .text("Map of Australia with Population Data");
});