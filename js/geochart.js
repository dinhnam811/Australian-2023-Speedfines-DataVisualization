d3.json("js/australia-map.geo.json").then(geoData => {
  const width = 500;
  const height = 500;
  const totalWidth = width + 300; 
  const stateCodeToAbbr = {
    "1": "NSW",
    "2": "VIC", 
    "3": "QLD",
    "4": "SA",
    "5": "WA",
    "6": "TAS",
    "7": "NT",
    "8": "ACT"
  };

  geoData.features.forEach(feature => {
    feature.properties.state = stateCodeToAbbr[feature.properties.STATE_CODE];
  });

  
  const projection = d3.geoMercator()
    .fitSize([450, 400], geoData);
  const path = d3.geoPath().projection(projection);

  const svg = d3.select("#map-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${totalWidth} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%");


  const populationData = {
    "NSW": 8166000, "VIC": 6681000, "QLD": 5185000,
    "WA": 2667000, "SA": 1770000, "TAS": 541500,
    "ACT": 431200, "NT": 246500
  };

  const populationColorScale = d3.scaleSequential()
    .domain([0, d3.max(Object.values(populationData))])
    .interpolator(d3.interpolateBlues);

  geoData.features.forEach(feature => {
    feature.properties.population = populationData[feature.properties.state] || 0;
  });

  
  const defs = svg.append("defs");
  
  // Định nghĩa marker mũi tên trước
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

  // ========= LEGEND =========
  const legendWidth = 20;
  const legendHeight = 200;
  const legendPosition = { x: 80, y: height/2 - legendHeight/2 };

  // Gradient cho legend
  const linearGradient = defs.append("linearGradient")
    .attr("id", "population-gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");

  [0, 0.25, 0.5, 0.75, 1].forEach(value => {
    linearGradient.append("stop")
      .attr("offset", `${value * 100}%`)
      .attr("stop-color", d3.interpolateBlues(value));
  });

  // Vẽ legend
  svg.append("rect")
    .attr("x", legendPosition.x)
    .attr("y", legendPosition.y)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#population-gradient)")
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  const legendScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(populationData))])
    .range([legendHeight, 0]);

  const legendAxis = d3.axisLeft(legendScale)
    .ticks(5)
    .tickFormat(d => d3.format(".2s")(d).replace("G", "B"));

  svg.append("g")
    .attr("class", "legend-axis")
    .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`)
    .call(legendAxis)
    .select(".domain").remove();

  svg.append("text")
    .attr("x", legendPosition.x + legendWidth/2)
    .attr("y", legendPosition.y - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Population");

  // ========= MAIN MAP =========
  const mapGroup = svg.append("g")
    .attr("transform", `translate(150, 50)`);

  
  const actFeature = geoData.features.find(f => f.properties.state === "ACT");
  console.log("ACT Feature found:", actFeature); 

  mapGroup.selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => populationColorScale(d.properties.population))
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .attr("opacity", 1)
    .on("click", (event, d) => {
      const selectedState = d.properties.state;
      
  
      if (typeof updateBarChart === 'function') {
        const year = +document.getElementById("year-filter").value;
        updateBarChart(selectedState, year);
      }
      
      if (typeof updateStatsForState === 'function') {
        updateStatsForState(selectedState);
      }

      mapGroup.selectAll("path").attr("opacity", 0.3);
      d3.select(event.currentTarget).attr("opacity", 1);
      
      
      if (selectedState === "ACT") {
        svg.select(".act-enlarged").attr("stroke-width", 3);
      } else {
        svg.select(".act-enlarged").attr("stroke-width", 2);
      }
    })
    .on("mouseover", function(event, d) {
      d3.select(this).attr("stroke-width", 2);
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke-width", 0.5);
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
      .attr("stroke-dasharray", "5,3");

    // Thêm ACT phóng to
    const enlargedACT = actGroup.append("path")
      .datum(actFeature)
      .attr("class", "act-enlarged")
      .attr("d", actPath)
      .attr("fill", populationColorScale(actFeature.properties.population))
      .attr("stroke", "#d62728")
      .attr("stroke-width", 2)
      .attr("opacity", 1)
      .style("cursor", "pointer")
      .on("click", (event) => {
        console.log("Enlarged ACT clicked!"); // Debug log
        
        if (typeof updateBarChart === 'function') {
          const year = +document.getElementById("year-filter").value || 2023;
          updateBarChart("ACT", year);
        }
        
        if (typeof updateStatsForState === 'function') {
          updateStatsForState("ACT");
        }
        
        mapGroup.selectAll("path").attr("opacity", 0.3);
        d3.select(event.currentTarget).attr("stroke-width", 3);
      })
      .on("mouseover", function() {
        d3.select(this).attr("stroke-width", 3);
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 2);
      });

    console.log("Enlarged ACT created:", enlargedACT.node()); // Debug log

    // Thêm nhãn rõ ràng hơn
    actGroup.append("text")
      .attr("x", enlargedACTPosition.x)
      .attr("y", enlargedACTPosition.y + 80)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("ACT (Enlarged 15x)");

    // Thêm mũi tên chỉ dẫn từ ACT gốc đến ACT phóng to
    const originalACTCentroid = path.centroid(actFeature);
    
    actGroup.append("line")
      .attr("x1", originalACTCentroid[0] + 150) // +100 vì mapGroup có translate
      .attr("y1", originalACTCentroid[1] + 50)  // +50 vì mapGroup có translate
      .attr("x2", enlargedACTPosition.x - 50)
      .attr("y2", enlargedACTPosition.y - 30)
      .attr("stroke", "#d62728")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3")
      .attr("marker-end", "url(#arrowhead)");

    console.log("Arrow created from:", originalACTCentroid, "to:", enlargedACTPosition);
  } else {
    console.error("ACT feature not found!");
  }

  // ========= EVENT HANDLERS =========
  d3.select("#map-chart").on("mouseleave", function() {
    mapGroup.selectAll("path").attr("opacity", 0.6); 
  });
  
  d3.select("#map-chart").on("mouseenter", function() {
    mapGroup.selectAll("path").attr("opacity", 1);
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
  
  // Tiêu đề
  svg.append("text")
    .attr("x", totalWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Australia Population Map with Enlarged ACT");

  console.log("Map rendering completed!"); // Debug log
}).catch(error => {
  console.error("Error loading geo data:", error);
});