var margin = 200;//one way dimension reduction
var width = 960 - margin, //width of canvas that holds the bar chart
height = 600 - margin;//height of canvas that holds the bar chart

//Create a canvas(svg)
var canvas = d3.select("body").append("svg").attr("width",width + margin).attr("height",height + margin).attr("class","svgborder");


var dropDownValue = "batterypower";//default dropDownValue
var currentMode = "bar"; //current visualization mode to switch accordingly on click
var sliderValue;
var xValue = "Batter Power in mAh"; //default X-axis value
var xLabel = {}; //array to hold X-axis label
var colorValue = d3.scaleOrdinal(d3.schemeCategory20c);//picks range of values from the color scheme
//Load data from CSV hosted in http server

d3.csv("http://localhost:8080/TEST.csv")
.row(function(d) { return { batterypower: +d.batterypower,bluetooth: +d.bluetooth,clockspeed:+d.clockspeed,dualsim:+d.dualsim,frontcampixels:+d.frontcampixels
  ,fourg:+d.fourg,intmemgb:+d.intmemgb,mdepth:+d.mdepth*10
,mweight:+d.mweight,ncores:+d.ncores,pcpixels:+d.pcpixels,pxwidth:+d.pxwidth,ramMB:+d.ramMB
,scheight:+d.scheight,talktime:+d.talktime,threeg:+d.threeg,touchscreen:+d.touchscreen,pxheight:+d.pxheight,scwidth:+d.scwidth,wifi:+d.wifi};})//curate the type of data if needed as d3 returns all as string
.get(function(error,d) {//callback function that gets called when all the data is loaded in the variable d here.

  if(error){throw error;} //error handling

  columnNames = d.columns;//load all column names for dynamic loading of data
  loadColumns(); //Load the columns as a dropdown for user to select

  var inputArray = new Array(d.length).fill(0);//create an empty input array

  //loop through to get all the data for column GRE as default dropDownValue is gre
  d.forEach(function(data,i) {
    inputArray[i] = data[dropDownValue];
  })
  //mouse drag
  var slider = document.getElementById("myRange");
  var output = document.getElementById("demo");
  output.innerHTML = slider.value;
  console.log(slider.value);
  sliderValue = slider.value;

  slider.oninput = function() {
    sliderValue = slider.value;
  output.innerHTML = " "+this.value;}
  //loads data as bar chart
  loadBarChart(inputArray,dropDownValue,+sliderValue);

  //adding on change event handler that loads bar chart based on drop down value
  d3.select("#p1").on("change",function(inp){
    d.forEach(function(data,i) {
      dropDownValue = d3.select('#p1').property('value');
      inputArray[i] = data[dropDownValue];
    })
    loadBarChart(inputArray,dropDownValue,+sliderValue);
  })
});


//loadBarChart takes in data, dropDownValue and current sliderValue to plot the bar chart
function loadBarChart(d,val,slider){
  var loop=0;//looping through any array in the code
  var numBins = slider;//number of bins/bars in the graph
  var binSize = 0;//range of values bin can hold i.e binSize = 5 if it can hold 290-294 values
  var xRanges = new Array(numBins).fill(0);//initialize an array with 0. This array is to define the range of values x Axis will be taking
  var binArray = new Array(numBins).fill(0);//initialize an array with 0. This array is to define the count of values in each bin
  var maxValue = 0;//min Value in the input
  var minValue = 0;//max value in the input
  var binWidth = width/(numBins);//calculate the width of the rect aka bar
  var columnNames = [0]; //populate all the columnNames
  var dropDownValue = "batterypower";
  var currentMode = "bar";
  d3.selectAll("g").remove();//clear the canvas for fresh load

  //create a group element to hold other group elements that makes up the chart in window
  var parentGroup = canvas.append("g").attr("transform", "translate(" + 120 + "," + 70 + ")");

  maxValue = d3.max(d3.extent(d,function(d){ return d}));//get the max value from the array of GRE values in the input
  minValue = d3.min(d3.extent(d,function(d){ return d}));//get the min value from the array of GRE values in the input

  binSize = Math.ceil((maxValue - minValue)/numBins);//calculate the range of values bin can hold in each bucket

  //calculate the values/ranges to be listed in xAxis
  var min = minValue;
  var factor = Math.ceil((maxValue-minValue)/numBins);
  for(loop=0;loop<xRanges.length;loop++)
  {
    xRanges[loop] = Math.floor((min+(min+factor))/2);
    min = min + factor;
  }

  //loop through the input data and assign it to a bin and increment the count
  //Hash it into the 10 bins we have
  d.forEach(function(data,i) {
    if(!Number.isInteger((data-minValue)/binSize)) //data handling that is an integer multiple to avoid index overflow
      binArray[Math.floor((data-minValue)/binSize)]++;
    else {
      binArray[Math.floor((data-minValue)/(binSize+0.001))]++; //padding of 0.001 to get clear floor values
    }
  })

  //calculating the max value of Y axis to define the Y-axis scale
  var maxValueForYAxis = d3.max(d3.extent(d,function(d,i){ return binArray[i]}));

  //deining the x-axis range and domain values
  var xScale = d3.scaleBand()
  .range([0,width]);
  var yScale = d3.scaleLinear()
  .range([height,0]);

  xScale.domain(xRanges); //provide values to the x axis
  yScale.domain([0, maxValueForYAxis+10]); // provide values for Y axis. Plus 10 adds one more tick to bound everything

  var yScaleValues = d3.scaleLinear().domain([maxValueForYAxis+10,0])
  .range([height,0]);

  //define axes
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale).tickFormat(function(d){ // You can return whatever text you want to display on range values for Y axis. Like $ 20
    return  d;
  }).tickSize(-width);

  //Append to the parent group i.e. html -> svg -> g (parentGroup)
  parentGroup.append("g")
  .attr("class","xaxis")
  .attr("transform","translate(0,"+height+")")
  .call(xAxis)
  .append("text")
  .attr("y", 40)
  .attr("x", width/2)
  .attr("dx","4.1em")
  .attr("text-anchor", "end")
  .attr("stroke", "#ff6600")
  .attr("font-size","13px")
  .text(xLabel[val].toUpperCase());

  //Append to the parent group i.e. html -> svg -> g (parentGroup)
  parentGroup.append("g")
  .attr("class","yaxis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x",(-height/2)+15)
  .attr("y", 10)
  .attr("dy", "-3.4em")
  .attr("text-anchor", "end")
  .attr("stroke", "#ff6600")
  .attr("font-size","13px")
  .text("# OF PHONES");

  //Append to the parent group i.e. html -> svg -> g (parentGroup) and class as dataplots
  var barGroups = parentGroup.selectAll("dataplots")
  .data(binArray)
  .enter()
  .append("g")
  .attr("class","dataplots")

  //Append to the set of group elements created as barGroups
  var groupElements = barGroups
  .append("rect")
  .attr("val",function(d, i) {return (binArray[i]);})//setting val attribute to retrieve it for displaying data on hover
  .attr("x",function(d, i) {return (binWidth*i);})
  .attr("y",function(d, i) {return height-yScaleValues(binArray[i])})
  .transition().ease(d3.easeBounce).duration(2000)
  .attr("width",binWidth-5)//offset of 5
  .attr("height",function(d,i){
    return yScaleValues(binArray[i])})

  d3.selectAll('rect').on("mouseover",function(inp){
      var x = d3.select(this).attr("x");
      var y = d3.select(this).attr("y");
      var val = d3.select(this).attr("val");
      var currentBarWidth = d3.select(this).attr("width");
      d3.select(this).attr("fill","orange").attr("stroke-width","3").attr("stroke","green")
      .attr("height",d3.select(this).node().getBoundingClientRect().height+2)
      .attr("width",function(d, i) {return binWidth-3})

      parentGroup.append("text")
       .attr('class', 'val')
       .attr("stroke","white")
       .attr('x', function() {
         console.log(x);
         return +x+((currentBarWidth-10)/2);
       })
       .attr('y', function() {
           return +y-2;//reset the offset of 2
       })
       .text(function() {
           return val;  // Value of the text
       });

    })
    .on("mouseout",function(inp){
      d3.selectAll('.val').remove()
      var newHeight = d3.select(this).node().getBoundingClientRect().height;
      d3.select(this).attr("fill","#00ff99").attr("stroke-width","0")
      .attr("height",d3.select(this).node().getBoundingClientRect().height-2)
      .attr("width",function(d, i) {return binWidth-5})
    })
    //
    d3.selectAll('.dataplots').transition().style("fill","#00ff99").duration(4000);
    //d3.selectAll('rect').transition().ease(d3.easeLinear).duration(4000);
    //Clean if anything was added extra
    barGroups.exit().remove();


    //Pie code on clicking anywhere on the svg
    canvas.on("click",function(inp){
      if(currentMode=="bar")
      {
        currentMode = "pie";
        d3.selectAll("g").remove();

        var parentGroup = canvas.append("g").attr("transform", "translate(" + 450 + "," + 300 + ")");
        var radius = Math.min(width, height) / 2;
        var pie = d3.pie()
        .value(function(d) { return d; })(binArray);
        var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0)
        .cornerRadius(5);

        var labelArc = d3.arc()
        .outerRadius(radius - 60)
        .innerRadius(radius - 60);

        var background = parentGroup.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .style("stroke","black")
        .style("stroke-width","3px")
        .style("fill", function(d,i){
          return colorValue(i);
      })
      .attr("d",arc)

      var getAngle = function (d) {
        console.log("Angles"+d.startAngle+" "+d.endAngle);
        return (210 / Math.PI * (d.startAngle + d.endAngle) / 2 );//Customized function but Reference from - http://jsfiddle.net/2uT7F/ //180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90;
      };
      console.log(dropDownValue);

      parentGroup.selectAll("text").data(pie).enter().append("text").attr("transform", function(d) { console.log(d);return "translate(" + labelArc.centroid(d) + ")" +
      "rotate(" + getAngle(d) + ")"; })
      .text(function(d,i) { //If there is no count in bin do not display label in Pie
        if(binArray[i]==0)return "";return xRanges[i]})
        .style("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size","12px")
        .attr("font-weight","bold")

        //heading for pie chart
        parentGroup.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", -350)
        .attr("y", -220)
        .attr("font-size", "24px")
        .attr("stroke","white")
        .attr("stroke-width","1")
        .text("Distribution of phones based on - "+xLabel[val])

      }
      else {
        currentMode = "bar";
        var slider = document.getElementById("myRange");
        var output = document.getElementById("demo");
        output.innerHTML = slider.value;
        loadBarChart(d,val,+slider.value)
    }
    })//end pie

    //mouse drag
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;

    slider.oninput = function() {
    output.innerHTML = " "+this.value;
    loadBarChart(d,val,+this.value);
}

}

  //load the select dropdown
  function loadColumns(){
    console.log(columnNames);
    var selected = false;
    var select = document.getElementById("p1");
    for(index in columnNames) {
      if(columnNames[index] == "batterypower")
      xLabel[columnNames[index]] = "Battery Power in mAh";
      else if(columnNames[index] == "bluetooth")
      xLabel[columnNames[index]] = "BlueTooth (Yes=1/No=0)";
      else if(columnNames[index] == "clockspeed")
      xLabel[columnNames[index]] = "Clock Speed in GHz";
      else if(columnNames[index] == "dualsim")
      xLabel[columnNames[index]] = "Dual Sim (Yes=1/No=0)";
      else if(columnNames[index] == "frontcampixels")
      xLabel[columnNames[index]] = "Front Camera Pixels";
      else if(columnNames[index] == "fourg")
      xLabel[columnNames[index]] = "4G Enabled(Yes=1/No=0)";
      else if(columnNames[index] == "intmemgb")
      xLabel[columnNames[index]] = "Internal Memory in GB";
      else if(columnNames[index] == "mdepth")
      xLabel[columnNames[index]] = "Mobile Depth in mm";
      else if(columnNames[index] == "mweight")
      xLabel[columnNames[index]] = "Mobile Weight in grams";
      else if(columnNames[index] == "ncores")
      xLabel[columnNames[index]] = "Number of CPU Cores";
      else if(columnNames[index] == "pcpixels")
      xLabel[columnNames[index]] = "Primary Camera Pixels";
      else if(columnNames[index] == "pxheight")
      xLabel[columnNames[index]] = "Pixel Height";
      else if(columnNames[index] == "pxwidth")
      xLabel[columnNames[index]] = "Pixel Width";
      else if(columnNames[index] == "ramMB")
      xLabel[columnNames[index]] = "RAM in MB";
      else if(columnNames[index] == "scheight")
      xLabel[columnNames[index]] = "Screen Height in cm";
      else if(columnNames[index] == "scwidth")
      xLabel[columnNames[index]] = "Screen Width in cm";
      else if(columnNames[index] == "talktime")
      xLabel[columnNames[index]] = "Longest battery life during call (Hrs)";
      else if(columnNames[index] == "threeg")
      xLabel[columnNames[index]] = "3G ENABLED (Yes=1 / No = 0)";
      else if(columnNames[index] == "touchscreen")
      xLabel[columnNames[index]] = "Touch Screen (Yes=1/No=0)";
      else if(columnNames[index] == "wifi")
      xLabel[columnNames[index]] = "WIFI (Yes=1/No=0)";

      if(columnNames[index] == "batterypower")//select by default
      selected = true;
      else if(columnNames[index] == "id")
        continue;
      else
      selected = false;
      select.options[select.options.length] = new Option(xLabel[columnNames[index]], columnNames[index],selected,selected);
    }
    //Needed for showing meaningful X-axis name for the end users
    for(index in columnNames) {

    }
}
