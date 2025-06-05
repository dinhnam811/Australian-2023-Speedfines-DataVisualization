// Full D3.js script with default total fines per state and dynamic updates
function drawLineChart(data) {
  const margin = { top: 50, right: 130, bottom: 40, left: 60 };
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

  const states = [...new Set(data.map(d => d.state))];

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.fine)])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(states)
    .range(d3.schemeTableau10);

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.fine));

  const grouped = d3.group(data, d => d.state);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

  svg.append("g")
    .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Monthly Speeding Fines by State – 2023");

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

  grouped.forEach((values, key) => {
    svg.append("path")
      .datum(values.sort((a, b) => a.date - b.date))
      .attr("fill", "none")
      .attr("stroke", color(key))
      .attr("stroke-width", 2)
      .attr("d", line);

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
        tooltip.html(`<strong>${d.state}</strong><br>${d3.timeFormat("%B %Y")(d.date)}<br>Fines: ${d3.format(",")(d.fine)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .on("click", function (event, d) {
        const selectedMonth = d.date.getMonth();
        const selectedYear = d.date.getFullYear();
        const filteredMonth = data.filter(e => e.date.getMonth() === selectedMonth && e.date.getFullYear() === selectedYear);
        drawMonthlyBarChart(filteredMonth, d.date);
      });
  });

  const legend = svg.selectAll(".legend")
    .data(states)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${width + 10}, ${i * 18})`);

  legend.append("rect")
    .attr("x", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", d => color(d));

  legend.append("text")
    .attr("x", 15)
    .attr("y", 9)
    .style("font-size", "10px")
    .text(d => d);

  // Initial summary bar chart
  const yearlyTotals = Array.from(d3.rollup(data, v => d3.sum(v, d => d.fine), d => d.state), ([state, fine]) => ({ state, fine }));
  drawMonthlyBarChart(yearlyTotals, null);
}

function drawMonthlyBarChart(data, date) {
  const title = date ? `Fines by State – ${d3.timeFormat("%B %Y")(date)}` : "Total Fines by State for 2023";
  d3.select("#monthly-chart").selectAll("*").remove();
  d3.selectAll(".tooltip-monthly").remove();

  const margin = { top: 30, right: 20, bottom: 40, left: 80 };
  const width = 360 - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;

  const svg = d3.select("#monthly-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip-monthly")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "#08306B")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

  const states = [...new Set(data.map(d => d.state))];
  const color = d3.scaleOrdinal()
    .domain(states)
    .range(d3.schemeTableau10);

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
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", d => y(d.state))
    .attr("x", 0)
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => color(d.state))
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(150).style("opacity", 1);
      tooltip
        .html(`<strong>${d.state}</strong><br>Fines: ${d3.format(",")(d.fine)}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", function (event) {
      tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
    })
    .transition()
    .duration(800)
    .delay((d, i) => i * 80)
    .attr("width", d => x(d.fine));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text(title)
    .attr("font-weight", "bold")
    .attr("font-size", "14px");
}
