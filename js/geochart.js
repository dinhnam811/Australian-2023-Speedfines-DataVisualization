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
  
    const colorScale = d3.scaleOrdinal()
      .domain(geoData.features.map(d => d.properties.state))
      .range(d3.schemeCategory10); 
  
   
    svg.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => colorScale(d.properties.state))
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("click", (event, d) => {
        const selectedState = d.properties.state;
        const year = +document.getElementById("year-filter").value;
        updateBarChart(selectedState, year);
  
       
        svg.selectAll("path").attr("opacity", 0.3);
        d3.select(event.currentTarget).attr("opacity", 1);
      })
      .on("mouseover", function () {
        d3.select(this).attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 0.5);
      });
      function highlightMapState(stateCode) {
        d3.selectAll("#map-chart path")
          .attr("opacity", d => d.properties.state === stateCode ? 1 : 0.3);
      }
      function updateBarChart(selectedState, year) {
        const filteredData = allData.bar.filter(d => 
          d.state === selectedState && d.year === year
        );
        drawBarChart(filteredData);
      }
  });