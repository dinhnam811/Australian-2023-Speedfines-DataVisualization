

  function drawBarChart(data) {
    const width = 370;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  
    
    d3.select("#bar-chart").selectAll("*").remove();
  
    const svg = d3.select("#bar-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.ageband))
      .range([margin.left, width - margin.right])
      .padding(0.2);
  
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.fines)]).nice()
      .range([height - margin.bottom, margin.top]);
  
   
    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.ageband))
      .attr("y", d => y(d.fines))
      .attr("height", d => y(0) - y(d.fines))
      .attr("width", x.bandwidth())
      .attr("fill", "#6baed6");
  

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end");
  
   
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));
    
      svg.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .text(`Fines by Age Group for ${data[0]?.state || 'Selected State'}`);
  
  
    
  }
  


  
  