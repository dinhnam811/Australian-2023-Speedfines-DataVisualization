function drawTreeMap(data) {
  const width = 370;
  const height = 250;
  const scaleFactor = 0.85;

  // Clear previous chart and tooltip
  d3.select("#pie-chart").selectAll("*").remove();
  d3.selectAll(".tooltip-treemap").remove();

  // Create SVG
  const svg = d3.select("#pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const chartGroup = svg.append("g")
    .attr("transform", `translate(0,20) scale(${scaleFactor})`);

  const treemapWidth = width / scaleFactor;
  const treemapHeight = (height - 20) / scaleFactor;

  // Create root node
  const root = d3.hierarchy({ children: data }).sum(d => d.count);

  // Create treemap layout
  d3.treemap()
    .size([treemapWidth, treemapHeight])
    .padding(2)(root);

  // Define color scale
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.method))
    .range([
      "#56B1F7", "#4E79A7", "#6BAED6", "#3182BD",
      "#08306B", "#A6CEE3", "#D2E3F3", "#9ECAE1"
    ]);

  // Tooltip styling
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip-treemap")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "#08306B")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

  // Draw rectangles
  chartGroup.selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.data.method))
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.data.method}</strong><br>Count: ${d.data.count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // Draw text labels
  chartGroup.selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", d => d.x0 + 4)
    .attr("y", d => d.y0 + 14)
    .text(d => {
      const boxWidth = d.x1 - d.x0;
      return boxWidth > 50 ? d.data.method : "";  // hide text if too narrow
    })
    .style("font-size", "10px")
    .style("fill", "white");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Detection Methods for Fines");
}
