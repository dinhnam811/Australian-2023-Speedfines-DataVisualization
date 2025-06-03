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
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));
  
    svg.append("g").call(d3.axisLeft(yScale));
  
    svg.selectAll(".line")
      .data(grouped)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", ([key]) => color(key))
      .attr("stroke-width", 2)
      .attr("d", ([, values]) => line(values.sort((a, b) => a.date - b.date)))
      .attr("class", "line");
  
    // Tooltip
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
  
    // Add circles and tooltips
    grouped.forEach((values, key) => {
      svg.selectAll(`.circle-${key}`)
        .data(values)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.fine))
        .attr("r", 4)
        .attr("fill", color(key))
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`<strong>${d.state}</strong><br>${d3.timeFormat("%B %Y")(d.date)}<br>Fine: $${d.fine}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
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
    });
  
    // Legend
    const legend = svg.selectAll(".legend")
      .data(states)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 15})`);
  
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
  }
  
  // Draws the bar chart below for selected month
  function drawMonthlyBarChart(data, date) {
    const monthName = d3.timeFormat("%B %Y")(date);
    d3.select("#stat-chart").selectAll("*").remove(); // Clear existing
  
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const width = 360 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
  
    const svg = d3.select("#stat-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.fine)])
      .range([0, width]);
  
    const y = d3.scaleBand()
      .domain(data.map(d => d.state))
      .range([0, height])
      .padding(0.1);
  
    svg.append("g").call(d3.axisLeft(y));
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5));
  
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", d => y(d.state))
      .attr("width", d => x(d.fine))
      .attr("height", y.bandwidth())
      .attr("fill", "#3182bd");
  
    svg.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text(`Fines by State – ${monthName}`)
      .attr("font-weight", "bold")
      .attr("font-size", "14px");
  }
  