let allData = {
  bar: [],
  line: [],
  pie: [],
  stat: []

};
Promise.all([
    d3.csv("data/data_barcharrt.csv", d => ({year: +d["YEAR"],state: d["JURISDICTION"],ageband: d["AGE_BAND"],fines: +d["Sum(FINES)"]})),
    d3.csv("data/data_line.csv", d => ({state: d["JURISDICTION"],date: new Date(d["START_DATE"]),fine: +d["Sum(FINES)"]})),
    d3.csv("data/data_pie.csv", d => ({method: d["DETECTION_METHOD"],count: +d["OCCURRENCE_COUNT"]})),
    d3.csv("data/data_stat.csv", d => ({year: d["YEAR"], state: d["JURISDICTION"],fines: +d["Sum(FINES)"], arrests: +d["Sum(ARRESTS)"], charges: +d["Sum(CHARGES)"]}))
  ])
  .then(([bar , line, pie,stat]) => {
    console.log("All CSV files loaded");
    allData.bar = bar; 
    allData.line = line;
    allData.pie = pie;
    allData.stat = stat;
    drawPieChart(pie); 
    drawLineChart(line); 
    drawBarChart(bar.filter(d => d.state === "VIC"));
    drawStatChart(stat); 
    
    

  })  
      
    
  

  .catch(error => {
    console.error("Error loading CSV files:", error);
  });