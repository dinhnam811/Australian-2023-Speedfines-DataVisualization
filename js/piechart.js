
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
  
  
  const rects = chartGroup.selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", d => d.y0)
      .attr("y", d => d.x0)
      .attr("width", 0) 
      .attr("height", 0)
      .attr("rx", 4) 
    .attr("ry", 4) 
      .attr("fill", d => getColor(d.data.method))
      .style("opacity", 0) 
      .on("mouseover", function(event, d) {
         
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
         
          d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1);
              
          tooltip.style("opacity", 0);
      });
  

  rects.transition()
      .duration(800)
      .delay((d, i) => i * 100) 
      .ease(d3.easeBackOut)
      .attr("width", d => d.y1 - d.y0)
      .attr("height", d => d.x1 - d.x0)
      .style("opacity", 1);
  
 
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
      .style("opacity", 0); 
  
 
  labels.transition()
      .duration(600)
      .delay(600) 
      .ease(d3.easeQuadOut)
      .style("opacity", 1);
  
  
  const title = chartGroup.append("text")
      .attr("class", "title")
      .attr("x", treemapWidth / 2)
      .attr("y", -9)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("opacity", 0) 
      .text(`Detection Methods for ${selectedState}`)
      .transition()
      .duration(600)
      .delay(600)
      .style("opacity", 1);
  
  

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
=======
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

