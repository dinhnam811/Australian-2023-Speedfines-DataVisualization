// === Annotation Texts by State ===
const stateAnnotations = {
  "NSW": "NSW reports high urban population and enforcement.",
  "VIC": "Victoria shows strong policy-driven data accuracy.",
  "QLD": "QLD has no exact age group breakdown data available. Only validated detections from camera offices are included.",
  "WA": "Uses mixed detection modes (e.g., OTS, ASC, red-lights)",
  "SA": "South Australia data reflects regional bias.",
  "TAS": "Technical constraints affect data consistency.",
  "NT": "NT includes high-speed zone enforcement.",
  "ACT": "ACT shown enlarged due to small land area."
};

d3.json("js/australia-map.geo.json").then(geoData => {
  const width = 500;
  const height = 500;
  const totalWidth = width + 300; 
  const stateCodeToAbbr = {
    "1": "NSW", "2": "VIC", "3": "QLD", "4": "SA",
    "5": "WA", "6": "TAS", "7": "NT", "8": "ACT"
  };

  geoData.features.forEach(feature => {
    feature.properties.state = stateCodeToAbbr[feature.properties.STATE_CODE];
  });

  const projection = d3.geoMercator().fitSize([450, 400], geoData);
  const path = d3.geoPath().projection(projection);

  const svg = d3.select("#map-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${totalWidth} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%").style("height", "100%");

  const populationData = {
    "NSW": 8166000, "VIC": 6681000, "QLD": 5185000, "WA": 2667000,
    "SA": 1770000, "TAS": 541500, "ACT": 431200, "NT": 246500
  };

  const populationColorScale = d3.scaleSequential()
    .domain([0, d3.max(Object.values(populationData))])
    .interpolator(d3.interpolateBlues);

  geoData.features.forEach(f => f.properties.population = populationData[f.properties.state] || 0);

  const tooltip = d3.select("body").append("div")
    .attr("class", "map-tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("box-shadow", "0 2px 10px rgba(0,0,0,0.3)");

  const defs = svg.append("defs");
  defs.append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#d62728");

  
  const legendPosition = { x: 80, y: height/2 - 100 };
  const linearGradient = defs.append("linearGradient")
    .attr("id", "population-gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");
  [0, 0.25, 0.5, 0.75, 1].forEach(v => linearGradient.append("stop")
    .attr("offset", `${v * 100}%`)
    .attr("stop-color", d3.interpolateBlues(v)));

  svg.append("rect")
    .attr("x", legendPosition.x).attr("y", legendPosition.y)
    .attr("width", 20).attr("height", 200)
    .style("fill", "url(#population-gradient)")
    .attr("stroke", "#333").attr("stroke-width", 0.5);

  const legendScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(populationData))])
    .range([200, 0]);

  svg.append("g")
    .attr("class", "legend-axis")
    .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`)
    .call(d3.axisLeft(legendScale).ticks(5).tickFormat(d => d3.format(".2s")(d).replace("G", "B")))
    .select(".domain").remove();

  svg.append("text")
    .attr("x", legendPosition.x + 10).attr("y", legendPosition.y - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px").style("font-weight", "bold")
    .text("Population");

  const mapGroup = svg.append("g").attr("transform", `translate(150, 50)`);
  const actFeature = geoData.features.find(f => f.properties.state === "ACT");

  const states = mapGroup.selectAll("path")
    .data(geoData.features).enter().append("path")
    .attr("d", path)
    .attr("fill", d => populationColorScale(d.properties.population))
    .attr("stroke", "#333").attr("stroke-width", 0.5).attr("opacity", 1)
    .style("cursor", "pointer")
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
    .on("click", (event, d) => {
      const selectedState = d.properties.state;
      if (typeof updateBarChart === 'function') {
        const year = +document.getElementById("year-filter").value;
        updateBarChart(selectedState, year);
      }
      if (typeof updateStatsForState === 'function') updateStatsForState(selectedState);
      if (typeof updateTreeMap === 'function') updateTreeMap(selectedState);
      const annotation = stateAnnotations[selectedState] || "No additional notes for this state.";
      d3.select("#map-annotation").text(annotation);

      mapGroup.selectAll("path")
        .transition().duration(300)
        .attr("opacity", 0.3)
        .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");

      d3.select(event.currentTarget)
        .transition().duration(300)
        .attr("opacity", 1)
        .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");      
        if (selectedState === "ACT") {
          svg.select(".act-enlarged")
            .transition()
            .duration(300)
            .attr("stroke-width", 3)
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
        } else {
          svg.select(".act-enlarged")
            .transition()
            .duration(300)
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
        }
    })
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))")
        .attr("transform", "scale(1.02)");

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <strong>${d.properties.state}</strong><br>
        Population: ${d3.format(",")(d.properties.population)}<br>
        Click to view details
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition().duration(200)
        .attr("stroke-width", 0.5)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
        .attr("transform", "scale(1)");

      tooltip.transition().duration(300).style("opacity", 0);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    });

  if (actFeature) {
    console.log("Creating enlarged ACT..."); 
    
    const actCentroid = d3.geoCentroid(actFeature);
    console.log("ACT Centroid:", actCentroid); 
    
    const enlargedACTPosition = {
      x: width + 140,
      y: 350
    };
    
    const actProjection = d3.geoMercator()
      .center(actCentroid)
      .scale(projection.scale() * 15) 
      .translate([enlargedACTPosition.x, enlargedACTPosition.y]);

    const actPath = d3.geoPath().projection(actProjection);

    const actGroup = svg.append("g")
      .attr("class", "act-enlarged-group");

    actGroup.append("circle")
      .attr("cx", enlargedACTPosition.x)
      .attr("cy", enlargedACTPosition.y)
      .attr("r", 60)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

    const enlargedACT = actGroup.append("path")
      .datum(actFeature)
      .attr("class", "act-enlarged")
      .attr("d", actPath)
      .attr("fill", populationColorScale(actFeature.properties.population))
      .attr("stroke", "#d62728")
      .attr("stroke-width", 2)
      .attr("opacity", 1)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .on("click", (event) => {
        console.log("Enlarged ACT clicked!"); 
        
        if (typeof updateBarChart === 'function') {
          const year = +document.getElementById("year-filter").value || 2023;
          updateBarChart("ACT", year);
        }
        
        if (typeof updateStatsForState === 'function') {
          updateStatsForState("ACT");
        }
        if (typeof updateTreeMap === 'function') {
          updateTreeMap("ACT");
          const annotation = stateAnnotations["ACT"];
          d3.select("#map-annotation").text(annotation);

        }
        
        mapGroup.selectAll("path")
          .transition()
          .duration(300)
          .attr("opacity", 0.3)
          .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");
        
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .attr("stroke-width", 3)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
      })
      .on("mouseover", function(event) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 3)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))")
          .attr("transform", "scale(1.05)");
        
        tooltip.transition()
          .duration(200)
          .style("opacity", 1);
        
        tooltip.html(`
          <strong>ACT (Enlarged)</strong><br>
          Population: ${d3.format(",")(actFeature.properties.population)}<br>
          Scale: 15x original size<br>
          Click to view details
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 2)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
          .attr("transform", "scale(1)");
        
        tooltip.transition()
          .duration(300)
          .style("opacity", 0);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      });

    console.log("Enlarged ACT created:", enlargedACT.node());

    actGroup.append("text")
      .attr("x", enlargedACTPosition.x)
      .attr("y", enlargedACTPosition.y + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("ACT (Enlarged 15x)");

    const originalACTCentroid = path.centroid(actFeature);
    
    actGroup.append("line")
      .attr("x1", originalACTCentroid[0] + 150)
      .attr("y1", originalACTCentroid[1] + 50)
      .attr("x2", enlargedACTPosition.x - 10)
      .attr("y2", enlargedACTPosition.y - 10)
      .attr("stroke", "#d62728")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3")
      .attr("marker-end", "url(#arrowhead)")
      .style("opacity", 0.7);

    console.log("Arrow created from:", originalACTCentroid, "to:", enlargedACTPosition);
  } else {
    console.error("ACT feature not found!");
  }

  d3.select("#map-chart").on("mouseleave", function() {
    mapGroup.selectAll("path")
      .transition()
      .duration(300)
      .attr("opacity", 0.6)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");
  });
  
  d3.select("#map-chart").on("mouseenter", function() {
    mapGroup.selectAll("path")
      .transition()
      .duration(300)
      .attr("opacity", 1)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
  });
  
  function updateBarChart(selectedState, year) {
    if (typeof allData !== 'undefined' && allData.bar) {
      const filteredData = allData.bar.filter(d => 
        d.state === selectedState && d.year === year
      );
      if (typeof drawBarChart === 'function') {
        drawBarChart(filteredData);
      }
    }
  }
  svg.append("text")
    .attr("x", totalWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Australia Population Map with Enlarged ACT");

  console.log("Map rendering completed!");

}).catch(error => {
  console.error("Error loading geo data:", error);
});
