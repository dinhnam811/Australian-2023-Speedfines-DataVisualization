function drawBarChart(data) {
  const width = 370;
  const height = 300;
  const margin = { top: 20, right: 0, bottom: 60, left: 30 };

  // Clear existing chart
  d3.select("#bar-chart").selectAll("*").remove();
  d3.selectAll(".tooltip-bar").remove(); // Just in case

  // Create SVG
  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Tooltip (styled directly in JS)
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip-bar")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "#08306B")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

  // X scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.ageband))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.fines)]).nice()
    .range([height - margin.bottom, margin.top]);

  // Bars
  svg.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.ageband))
    .attr("y", d => y(d.fines))
    .attr("height", d => y(0) - y(d.fines))
    .attr("width", x.bandwidth())
    .attr("fill", "#6baed6")
    .on("mouseover", (event, d) => {
      tooltip
        .transition()
        .duration(150)
        .style("opacity", 1);
      tooltip
        .html(`<strong>${d.ageband}</strong><br>Fines: ${d3.format(",")(d.fines)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip
        .transition()
        .duration(300)
        .style("opacity", 0);
    });

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle");

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(`Fines by Age Group for ${data[0]?.state || 'Selected State'}`);
}
