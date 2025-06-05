function drawLineChart(data) {
  const margin = { top: 30, right: 40, bottom: 50, left: 60 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  d3.select("#line-chart").selectAll("*").remove();
  d3.selectAll(".tooltip-linechart").remove();

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
  const line = d3.line().x((d) => xScale(d.date)).y((d) => yScale(d.fine));

  const grouped = d3.group(data, (d) => d.state);

  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .style("opacity", 0);
  
  xAxis.transition()
    .duration(600)
    .delay(300)
    .style("opacity", 1)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

  const yAxis = svg.append("g")
    .style("opacity", 0);
  
  yAxis.transition()
    .duration(600)
    .delay(200)
    .style("opacity", 1)
    .call(d3.axisLeft(yScale));

  const lines = svg.selectAll(".line")
    .data(grouped)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", ([key]) => color(key))
    .attr("stroke-width", 2)
    .attr("d", ([, values]) => line(values.sort((a, b) => a.date - b.date)))
    .attr("class", "line")
    .style("opacity", 0)
    .attr("stroke-dasharray", function() {
      const totalLength = this.getTotalLength();
      return totalLength + " " + totalLength;
    })
    .attr("stroke-dashoffset", function() {
      return this.getTotalLength();
    });

  lines.transition()
    .duration(1200)
    .delay((d, i) => i * 200 + 400)
    .ease(d3.easeQuadInOut)
    .attr("stroke-dashoffset", 0)
    .style("opacity", 1);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip-linechart")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "#08306B")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

  grouped.forEach((values, key, index) => {
    const circles = svg.selectAll(`.circle-${key}`)
      .data(values)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.fine))
      .attr("r", 0)
      .attr("fill", color(key))
      .style("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 6);
        
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.state}</strong><br>${d3.timeFormat("%B %Y")(d.date)}<br>Fine: $${d.fine}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 4);
        
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .on("click", function (event, d) {
        const selectedMonth = d.date.getMonth();
        const selectedYear = d.date.getFullYear();
        const filteredMonth = allData.line.filter(e =>
          e.date.getMonth() === selectedMonth && e.date.getFullYear() === selectedYear
        );
        drawMonthlyBarChart(filteredMonth, d.date);
      });
    
    circles.transition()
      .duration(400)
      .delay((d, i) => (Array.from(grouped.keys()).indexOf(key) * 200) + 800 + (i * 50))
      .ease(d3.easeBackOut)
      .attr("r", 4)
      .style("opacity", 1);
  });

  const legend = svg.selectAll(".legend")
    .data(states)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 15})`)
    .style("opacity", 0);

  legend.append("rect")
    .attr("x", width - 15)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d) => color(d));

  legend.append("text")
    .attr("x", width - 20)
    .attr("y", 9)
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .text((d) => d);
  
  legend.transition()
    .duration(500)
    .delay((d, i) => 1200 + (i * 100))
    .style("opacity", 1);
}

function drawMonthlyBarChart(data, date) {
  const monthName = d3.timeFormat("%B %Y")(date);
  
  const existingChart = d3.select("#stat-chart svg");
  if (!existingChart.empty()) {
    existingChart.transition()
      .duration(300)
      .style("opacity", 0)
      .on("end", function() {
        d3.select("#stat-chart").selectAll("*").remove();
        createBarChart();
      });
  } else {
    createBarChart();
  }
  
  function createBarChart() {
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const width = 360 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
  
    const svg = d3.select("#stat-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("opacity", 0)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.fine)])
      .range([0, width]);
  
    const y = d3.scaleBand()
      .domain(data.map(d => d.state))
      .range([0, height])
      .padding(0.1);
  
    const yAxis = svg.append("g")
      .style("opacity", 0);
    
    yAxis.transition()
      .duration(500)
      .delay(300)
      .style("opacity", 1)
      .call(d3.axisLeft(y));
    
    const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .style("opacity", 0);
    
    xAxis.transition()
      .duration(500)
      .delay(400)
      .style("opacity", 1)
      .call(d3.axisBottom(x).ticks(5));
  
    const bars = svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", d => y(d.state))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", "#3182bd");
    
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 100 + 500)
      .ease(d3.easeQuadOut)
      .attr("width", d => x(d.fine));
  
    const title = svg.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text(`Fines by State – ${monthName}`)
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .style("opacity", 0)
      .attr("transform", "translate(0, -10)");
    
    title.transition()
      .duration(600)
      .delay(200)
      .style("opacity", 1)
      .attr("transform", "translate(0, 0)");
    
    d3.select("#stat-chart svg")
      .transition()
      .duration(400)
      .style("opacity", 1);
  }
}