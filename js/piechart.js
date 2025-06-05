function drawTreeMap(data, selectedState = "VIC") {
  const width = 300;
  const height = 200;
  const scaleFactor = 0.7;
  const filteredData = data.filter(d => d.jurisdiction === selectedState);
  
  // Clear existing content
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
      .sum(d => d.count)
      .sort((a, b) => b.value - a.value);
  
  d3.treemap()
      .size([treemapHeight, treemapWidth])
      .padding(2)
      .tile(d3.treemapSquarify.ratio(2))(root);
  
  const colorMapping = {
      "Police issued": "#CD5656",
      "Other": "#EFE4D2",
      "Unknown": "#954C2E",
      "Fixed or mobile camera": "#0A2E5E",
      "Fixed camera": "#FADA7A",
      "Red light camera": "#3182bd",
      "Mobile camera": "#B1C29E",
      "Average speed camera": "#6A42C2",
  };
  
  const getColor = (method) => {
      return colorMapping[method] || "#6BAED6";
  };
  
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
  
  // Create rectangles with transitions
  const rects = chartGroup.selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", d => d.y0)
      .attr("y", d => d.x0)
      .attr("width", 0) // Start with width 0
      .attr("height", 0) // Start with height 0
      .attr("fill", d => getColor(d.data.method))
      .style("opacity", 0) // Start invisible
      .on("mouseover", function(event, d) {
          // Add hover effect with transition
          d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 0.8);
              
          tooltip.style("opacity", 1)
              .html(`<strong>${d.data.method}</strong><br>Count: ${d.data.count}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
          // Remove hover effect with transition
          d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1);
              
          tooltip.style("opacity", 0);
      });
  
  // Animate rectangles into position
  rects.transition()
      .duration(800)
      .delay((d, i) => i * 100) // Stagger the animations
      .ease(d3.easeBackOut)
      .attr("width", d => d.y1 - d.y0)
      .attr("height", d => d.x1 - d.x0)
      .style("opacity", 1);
  
  // Create text labels with transitions
  const labels = chartGroup.selectAll("text.label")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => d.y0 + 4)
      .attr("y", d => d.x0 + (d.x1 - d.x0)/2)
      .text(d => d.data.method)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-anchor", "start")
      .style("dominant-baseline", "middle")
      .style("opacity", 0); // Start invisible
  
  // Animate text labels to appear after rectangles
  labels.transition()
      .duration(600)
      .delay(600) // Wait for rectangles to mostly appear
      .ease(d3.easeQuadOut)
      .style("opacity", 1);
  
  // Add title with transition
  const title = chartGroup.append("text")
      .attr("class", "title")
      .attr("x", treemapWidth / 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(`Detection Methods for ${selectedState}`)
      .style("opacity", 0) // Start invisible
      .attr("transform", "translate(0, -20)"); 
      

  title.transition()
      .duration(600)
      .delay(400)
      .ease(d3.easeQuadOut)
      .style("opacity", 1)
      .attr("transform", "translate(0, 0)");
}

function updateTreeMap(selectedState) {
  if (typeof allData !== 'undefined' && allData.pie) {
      const currentChart = d3.select("#pie-chart svg");
      if (!currentChart.empty()) {
          currentChart.transition()
              .duration(300)
              .style("opacity", 0)
              .on("end", function() {
                  drawTreeMap(allData.pie, selectedState);
                  d3.select("#pie-chart svg")
                      .style("opacity", 0)
                      .transition()
                      .duration(300)
                      .style("opacity", 1);
              });
      } else {
          drawTreeMap(allData.pie, selectedState);
      }
  }
}