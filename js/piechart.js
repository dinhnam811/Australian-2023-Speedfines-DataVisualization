function drawTreeMap(data, selectedState = "VIC") {
  const width = 300;  
  const height = 200;
  const scaleFactor = 0.7; 


  const filteredData = data.filter(d => d.jurisdiction === selectedState);

  d3.select("#pie-chart").selectAll("*").remove();

  const svg = d3.select("#pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const chartGroup = svg.append("g")
    .attr("transform", `scale(${scaleFactor})`);

  const treemapWidth = width / scaleFactor;
  const treemapHeight = height / scaleFactor;

  const root = d3.hierarchy({ children: filteredData })
    .sum(d => d.count);

  d3.treemap()
    .size([treemapWidth, treemapHeight]) 
    .padding(2)(root);

  const color = d3.scaleOrdinal()
    .domain(filteredData.map(d => d.method))
    .range([
      "#56B1F7", "#4E79A7", "#6BAED6", "#3182BD",
      "#08306B", "#A6CEE3", "#D2E3F3", "#9ECAE1"
    ]);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "#08306B")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

  chartGroup.selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.data.method))
    .on("mouseover", function(event, d) {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.data.method}</strong><br>Count: ${d.data.count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
    });

  chartGroup.selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", d => d.x0 + 4)
    .attr("y", d => d.y0 + 14)
    .text(d => d.data.method)
    .style("font-size", "10px")
    .style("fill", "white");

  chartGroup.append("text")
    .attr("x", treemapWidth / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text(`Detection Methods for ${selectedState}`);
}

// Thêm hàm update để có thể gọi từ bên ngoài
function updateTreeMap(selectedState) {
  if (typeof allData !== 'undefined' && allData.pie) {
    drawTreeMap(allData.pie, selectedState);
  }
}