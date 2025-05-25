function drawPieChart(pieData) {
    const width = 400;
    const height = 300;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
  
    const svg = d3.select("#pie-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
  
    const color = d3.scaleOrdinal()
      .domain(pieData.map(d => d.method))
      .range([
        "#56B1F7", "#4E79A7", "#6BAED6", "#3182BD",
        "#08306B", "#A6CEE3", "#D2E3F3", "#9ECAE1"
      ]);
  
    const pie = d3.pie().value(d => d.count);
    const data_ready = pie(pieData);
  
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
  
    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.method))
      .attr("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
          .html(`<strong>${d.data.method}</strong><br>Count: ${d.data.count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        d3.select(this).attr("fill", "#08306B");
      })
      .on("mouseout", function (event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).attr("fill", color(d.data.method));
      });
  
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
  }
  