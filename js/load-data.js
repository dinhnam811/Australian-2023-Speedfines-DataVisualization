let allData = {
  bar: [],
  line: [],
  pie: []
};
Promise.all([
    d3.csv("data/data_barcharrt.csv", d => ({year: +d["YEAR"],state: d["JURISDICTION"],ageband: d["AGE_BAND"],fines: +d["Sum(FINES)"]})),
    d3.csv("data/data_line1.csv", d => ({state: d["JURISDICTION"],date: new Date(d["START_DATE"]),fine: +d["Sum(FINES)"]})),
    d3.csv("data/data_pie.csv", d => ({method: d["DETECTION_METHOD"],count: +d["OCCURRENCE_COUNT"]})),
     
  ])
  .then(([bar , line, pie]) => {
    console.log("All CSV files loaded");
    allData.bar = bar; 
    allData.line = line;
    allData.pie = pie;
    drawPieChart(pie); 
    drawBarChart(bar.filter(d => d.state === "VIC")); 
  })  
      
    
  

  .catch(error => {
    console.error("Error loading CSV files:", error);
  });