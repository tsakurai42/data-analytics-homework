// set plot area
var svgWidth = 1000;
var svgHeight = 600;

var animationduration = 1000;
// margins
var margin = {
    top: 25,
    right: 25,
    bottom: 100,
    left: 100
};
var offset = 0.05 // used to bump the domain slightly so the dots don't land on the axes or the maxes
// calc chart area
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

var toolTipTextX = 'Poverty %'
var toolTipTextY = 'Lack Healthcare %'

function createXScale(statedata, chosenX) {
    var range = d3.extent(statedata.map(d=>d[chosenX]))[1]-d3.extent(statedata.map(d=>d[chosenX]))[0]
    var xScale = d3.scaleLinear()
        // .domain([0, d3.max(statedata.map(d => d[chosenX]))])
        // .domain(d3.extent(statedata.map(d => d[chosenX])))
        .domain([d3.min(statedata.map(d => d[chosenX]))-offset*range, d3.max(statedata.map(d => d[chosenX]))+offset*range])
        .range([0, chartWidth]);
    return xScale;
}

function createYScale(statedata, chosenY) {
    var range = d3.extent(statedata.map(d=>d[chosenY]))[1]-d3.extent(statedata.map(d=>d[chosenY]))[0]
    var yScale = d3.scaleLinear()
        // .domain([0, d3.max(statedata.map(d => d[chosenY]))])
        // .domain(d3.extent(statedata.map(d => d[chosenY])))
        .domain([d3.min(statedata.map(d => d[chosenY]))-offset*range, d3.max(statedata.map(d => d[chosenY]))+offset*range])
        .range([chartHeight, 0]);
    console.log(chosenY, d3.max(statedata.map(d => d[chosenY])))
    return yScale;
}

function moveCircles(circlesG, whichaxis, Scale, Cat) {
    if (whichaxis == 'x') {
        circlesG.transition()
            .duration(animationduration)
            .attr('cx', d => Scale(d[Cat]))
            .attr('data-x-val', d => d[Cat])
    } else if (whichaxis == 'y') {
        circlesG.transition()
            .duration(animationduration)
            .attr('cy', d => Scale(d[Cat]))
            .attr('data-y-val', d => d[Cat])
    }
    return circlesG
}

function moveText(textG, whichaxis, Scale, Cat) {
    if (whichaxis == 'x') {
        textG.transition()
            .duration(animationduration)
            .attr('x', d => Scale(d[Cat]))
    } else if (whichaxis == 'y') {
        textG.transition()
            .duration(animationduration)
            .attr('y', d => Scale(d[Cat]))
    }
    return textG
}

function ColorChange(circlesG, Scale, Cat) {
    circlesG.transition()
        .duration(animationduration)
        .attr("fill", d => d3.interpolateInferno(Scale(d[Cat]) / chartHeight))
    return circlesG
}

d3.csv('../assets/data/data.csv').then(statedata => {
    // set # as #s
    statedata.forEach(d => d.poverty = +d.poverty);
    statedata.forEach(d => d.age = +d.age);
    statedata.forEach(d => d.income = +d.income);
    
    statedata.forEach(d => d.healthcare = +d.healthcare);
    statedata.forEach(d => d.obesity = +d.obesity);
    statedata.forEach(d => d.smokes = +d.smokes);

    //set default poverty vs lacks healthcare
    var currentX = 'poverty';
    var currentY = 'healthcare';

    var xScale = createXScale(statedata,currentX);
    var yScale = createYScale(statedata,currentY);
    
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    var $scattersvg = d3.select('#scatter').append('svg')
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var $chartg = $scattersvg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var $xAxisLabelG = $chartg.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var $xAxisLabelPoverty = $xAxisLabelG.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .attr("id", "poverty")
        .text("% in Poverty");

    var $xAxisLabelAge = $xAxisLabelG.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .attr("id", "age")
        .text("Median Age");

    var $xAxisLabelIncome = $xAxisLabelG.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .attr("id", "income")
        .text("Median Household Income");

    var $yAxisLabelG = $chartg.append("g")
        .attr("transform", `translate(${20 - margin.left},${chartHeight / 2})`)

    var $yAxisLabelObesity = $yAxisLabelG.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", 0)
        .attr("y", 0)
        .attr("value", "obesity")
        .classed("inactive", true)
        .attr("id", "obesity")
        .text("% Obese");

    var $yAxisLabelSmoke = $yAxisLabelG.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes")
        .classed("inactive", true)
        .attr("id", "smokes")
        .text("% Smokers");

    var $yAxisLabelNoHealthCare = $yAxisLabelG.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "healthcare")
        .attr("id", "healthcare")
        .classed("active", true)
        .text("% Lack Healthcare");

    var xAxisG = $chartg.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);


    var colorResetG = $chartg.append("g")
        .attr("transform", `translate(${50}, ${svgHeight - 75})`);

    var $colorReset = colorResetG.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .classed("inactive", true)
        .attr("value", "reset")
        .html('Set Color Scale to Current Y-axis Category')

    var yAxisG = $chartg.append("g")
        .call(yAxis);

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `${d.state}<br>Poverty: ${d.poverty}%<br>No HealthCare: ${d.healthcare}%`);

    $chartg.call(tool_tip);

    var circlesG = $chartg.selectAll('circle')
        .data(statedata)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[currentX]))
        .attr('cy', d => yScale(d[currentY]))
        .attr('r', 10)
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .attr("fill", d => d3.interpolateInferno(yScale(d.healthcare) / chartHeight))
        .attr('opacity', '0.75')
        .attr('data-state', d => d.abbr)
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    var textG = $chartg.selectAll('#stateabbr')
        .data(statedata)
        .enter()
        .append('text')
        .classed("stateabbr", true)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr('x', d => xScale(d[currentX]))
        .attr('y', d => yScale(d[currentY]))
        .style("font-size", "10px")
        .text(d => d.abbr)
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    $xAxisLabelG.selectAll('text')
        .on('click', function () {
            var clickedvalue = d3.select(this).attr("value");
            if (clickedvalue != currentX) {
                xScale = createXScale(statedata, clickedvalue);
                xAxisG.transition().duration(animationduration).call(d3.axisBottom(xScale));
                currentX = clickedvalue;
                circlesG = moveCircles(circlesG, 'x', xScale, currentX)
                textG = moveText(textG, 'x', xScale, currentX)
                $xAxisLabelG.selectAll('text').classed("inactive", true);
                $xAxisLabelG.selectAll('text').classed("active", false);
                $xAxisLabelG.select(`#${clickedvalue}`).classed("active", true);
                $xAxisLabelG.select(`#${clickedvalue}`).classed("inactive", false);

                if (currentX == "poverty") {
                    toolTipTextX = "Poverty %";
                } else if (currentX == "age") {
                    toolTipTextX = "Median Age";
                } else if (currentX == "income") {
                    toolTipTextX = "Median Household Income";
                }
                tool_tip = tool_tip
                    .html(d => `${d.state}<br>${toolTipTextX}: ${d[currentX]}<br>${toolTipTextY}: ${d[currentY]}`);
            }
        })

    $yAxisLabelG.selectAll('text')
        .on('click', function () {
            var clickedvalue = d3.select(this).attr("value");
            if (clickedvalue != currentY) {
                yScale = createYScale(statedata, clickedvalue);
                yAxisG.transition().duration(animationduration).call(d3.axisLeft(yScale));
                currentY = clickedvalue;
                circlesG = moveCircles(circlesG, 'y', yScale, currentY);
                textG = moveText(textG, 'y', yScale, currentY);
                $yAxisLabelG.selectAll('text').classed("active", false);
                $yAxisLabelG.selectAll('text').classed("inactive", true);
                $yAxisLabelG.select(`#${clickedvalue}`).classed("active", true);
                $yAxisLabelG.select(`#${clickedvalue}`).classed("inactive", false);

                if (currentY == "healthcare") {
                    toolTipTextY = "No Healthcare %";
                } else if (currentY == "smokes") {
                    toolTipTextY = "Smoker %";
                } else if (currentY == "obesity") {
                    toolTipTextY = "Obesity %";
                }
                
                tool_tip = tool_tip
                    .html(d => `${d.state}<br>${toolTipTextX}: ${d[currentX]}<br>${toolTipTextY}: ${d[currentY]}`);
            }
        })

    $colorReset
        .on('click', function () {
            circlesG = ColorChange(circlesG, yScale, currentY)
        })
})