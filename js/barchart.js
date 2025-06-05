function drawBarChart(data) {
  const width = 370;
  const height = 300;
  const margin = { top: 20, right: 0, bottom: 60, left: 30 };

  // Clear existing chart
  d3.select("#bar-chart").selectAll("*").remove();
  d3.selectAll(".tooltip-bar").remove(); // Just in case

  const tooltip = d3.select("#bar-chart")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "#08306B")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("font-weight", "bold");

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
    .attr("y", y(0)) 
    .attr("height", 0)
    .attr("width", x.bandwidth())
    .attr("rx", 4) 
    .attr("ry", 4)
    .attr("fill", "#6baed6")
    .transition() 
    .duration(800)
    .ease(d3.easeBackOut.overshoot(1.2)) 
    .attr("y", d => y(d.fines))
    .attr("height", d => y(0) - y(d.fines));

  svg.selectAll("rect")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .ease(d3.easeQuadOut)
        .attr("fill", "#3182bd");
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      
      tooltip.html(`Age Group: ${d.ageband}<br/>Fines: ${d3.format(",")(d.fines)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeQuadOut)
        .attr("fill", "#6baed6");
      
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("opacity", 0)
    .call(d3.axisBottom(x));
  
  xAxis.selectAll("text")
    .style("text-anchor", "middle");
  
  xAxis.transition()
    .duration(600)
    .delay(400)
    .style("opacity", 1);

  const yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .style("opacity", 0)
    .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));
  
  yAxis.transition()
    .duration(600)
    .delay(400)
    .style("opacity", 1);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(`Fines by Age Group for ${data[0]?.state || 'Selected State'}`);
}
