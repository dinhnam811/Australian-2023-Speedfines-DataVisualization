// js/linechart.js
function drawLineChart(data) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 },
      width = 400 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;
  
    // Clear previous chart
    d3.select("#line-chart").selectAll("*").remove();
  
    const svg = d3
      .select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const states = [...new Set(data.map((d) => d.state))];
  
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);
  
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.fine)])
      .nice()
      .range([height, 0]);
  
    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(states);
  
    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.fine));
  
    // Group data by state
    const grouped = d3.group(data, (d) => d.state);
  
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));
  
    svg.append("g").call(d3.axisLeft(yScale));
  
    svg
      .selectAll(".line")
      .data(grouped)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", ([key]) => color(key))
      .attr("stroke-width", 2)
      .attr("d", ([, values]) => line(values.sort((a, b) => a.date - b.date)))
      .attr("class", "line");
  
    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(states)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 15})`);
  
    legend
      .append("rect")
      .attr("x", width - 15)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", (d) => color(d));
  
    legend
      .append("text")
      .attr("x", width - 20)
      .attr("y", 9)
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .text((d) => d);
  } 
  
  // Hook into load-data.js
  function updateLineChart(stateFilter = null) {
    const filtered = stateFilter
      ? allData.line.filter((d) => d.state === stateFilter)
      : allData.line;
    drawLineChart(filtered);
  }
  
  // Optional: respond to dropdown changes
  d3.select("#state-select").on("change", function () {
    const selected = d3.select(this).property("value");
    updateLineChart(selected);
  });
  