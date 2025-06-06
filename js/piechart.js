function drawTreeMap(data, selectedState = "VIC") {
    const width = 360;
    const height = 250;
    const scaleFactor = 0.75;
    const filteredData = data.filter(d => d.jurisdiction === selectedState);
  
    // Clear previous chart and tooltip
    d3.select("#pie-chart").selectAll("*").remove();
    d3.selectAll(".tooltip-treemap").remove();
  
    const svg = d3.select("#pie-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height +100) // extra space for legend
      .attr("viewBox", `0 0 ${width} ${height + 80}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  
    const chartGroup = svg.append("g")
      .attr("transform", `translate(0, 20) scale(${scaleFactor})`);
  
    const treemapWidth = width / scaleFactor;
    const treemapHeight = height / scaleFactor;
  
    const root = d3.hierarchy({ children: filteredData })
      .sum(d => d.count)
      .sort((a, b) => b.value - a.value);
  
    d3.treemap()
      .size([treemapWidth, treemapHeight])
      .padding(2)
      .tile(d3.treemapSquarify.ratio(1.3))(root);
  
    // Color and acronym mappings
    const colorMapping = {
      "Fixed or mobile camera": "#4E79A7",
      "Red light camera": "#F28E2B",
      "Mobile camera": "#E15759",
      "Average speed camera": "#76B7B2",
      "Fixed camera": "#59A14F",
      "Police issued": "#EDC948",
      "Other": "#B07AA1",
      "Unknown": "#9C755F"
    };
  
    const methodAcronyms = {
      "Fixed or mobile camera": "FMC",
      "Red light camera": "RLC",
      "Mobile camera": "MC",
      "Average speed camera": "ASC",
      "Fixed camera": "FC",
      "Police issued": "PI",
      "Other": "OT",
      "Unknown": "UNK"
    };
  
    const getColor = method => colorMapping[method] || "#BAB0AC";
  
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
  
    // Rectangles
    const rects = chartGroup.selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", 0)
      .attr("height", 0)
      .attr("fill", d => getColor(d.data.method))
      .style("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8);
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
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .style("opacity", 1);
  
    // Acronym labels
    const labels = chartGroup.selectAll("text.label")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => d.x0 + 4)
      .attr("y", d => d.y0 + 12)
      .text(d => methodAcronyms[d.data.method] || d.data.method)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("opacity", 0);
  
    labels.transition()
      .duration(600)
      .delay(600)
      .ease(d3.easeQuadOut)
      .style("opacity", 1);
  
    // Title (outside of chartGroup to avoid scaling)
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`Detection Methods for ${selectedState}`)
      .style("opacity", 0)
      .transition()
      .duration(600)
      .delay(400)
      .style("opacity", 1);
  
    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(10, ${height + 40})`);
  
    const legendItems = Object.entries(methodAcronyms);
  
    legend.selectAll("g")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${(i % 2) * 160}, ${Math.floor(i / 2) * 18})`) // 2 per row
      .each(function (d) {
        d3.select(this)
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", getColor(d[0]));
  
        d3.select(this)
          .append("text")
          .attr("x", 15)
          .attr("y", 9)
          .text(`${d[1]} = ${d[0]}`)
          .style("font-size", "10px")
          .style("fill", "#333");
      });
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