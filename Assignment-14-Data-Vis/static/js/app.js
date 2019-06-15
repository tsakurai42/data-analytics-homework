; function buildMetadata(sample) {
  d3.select('.panel-body').html('');
  // @TODO: Complete the following function that builds the metadata panel
  d3.json(`/metadata/${sample}`).then(sampled => {
    Object.entries(sampled).forEach((k) => {
      d3.select('.panel-body').append('p').text(`${k[0]}: ${k[1]}`)
    })
    buildGauge(sampled.WFREQ);
  });

}

function buildCharts(sample) {
  d3.json(`/samples/${sample}`).then(sampled => {
    //console.log(sampled)
    var otu_ids = Object.entries(sampled)[0][1]
    var otu_labels = Object.entries(sampled)[1][1]
    var sample_values = Object.entries(sampled)[2][1]
    //console.log(otu_ids, otu_labels, sample_values)

    var trace = [{
      "x": otu_ids,
      "y": sample_values,
      "marker": {
        "size": sample_values,
        "color": otu_ids,
        "colorscale":'Viridis'
      },
      "textinfo": otu_labels,
      "text":otu_labels,
      "hoverinfo":"text",
      "mode": "markers"

    }];
    var layout = {
      "title": "Belly Button Bacteria",
      "xaxis": {
        "title": {
          "text": "OTU IDs"
        }
      },
      "yaxis": {
        "title": {
          "text": "Sample Value"
        }
      },
      "autosize":true,
      "height":600
    }
    Plotly.newPlot('bubble', trace, layout)


    var layout = {
      "title": "Top 10 Belly Button Bacteria",
    }
    trace = [{
      "labels": otu_ids.slice(0, 10),
      "values": sample_values.slice(0, 10),
      "text": otu_labels.slice(0, 10).map(bacteria => bacteria.split(";").pop()),
      "textinfo": "value+percent",
      'hoverinfo': "text",
      "type": "pie"
    }];
    Plotly.newPlot('pie', trace,layout)
  })
  // @TODO: Use `d3.json` to fetch the sample data for the plots

  // @TODO: Build a Bubble Chart using the sample data

  // @TODO: Build a Pie Chart
  // HINT: You will need to use slice() to grab the top 10 sample_values,
  // otu_ids, and labels (10 each).
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();


function buildGauge(sample) {
  // Enter a speed between 0 and 180
  //var level = 175;
  var level = sample * 20;
  // Trig to calc meter point
  var degrees = 162 / 180 * (180 - level) + 9,
    radius = .6;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
  var path = mainPath.concat(pathX, space, pathY, pathEnd);

  var data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 28, color: 'F26C28' },
    showlegend: false,
    name: 'speed',
    text: level,
    hoverinfo: 'text+name'
  },
  {
    values: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 50],
    rotation: 90,
    text: ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', ''],
    textinfo: 'text',
    textposition: 'inside',
    marker: {
      colors: ['rgba(97, 0, 229, .5)', 'rgba(145, 23, 231, .5)',
        'rgba(185, 46, 234, .5)', 'rgba(220, 71, 236, .5)',
        'rgba(239, 95, 231, .5)', 'rgba(242,121,216, .5)',
        'rgba(244,146,208, .5)', 'rgba(247,173,208, .5)',
        'rgba(249,199,215, .5)', 'rgba(252,227,231, 0)',
        'rgba(255, 255, 255, 0)']
    },
    labels: ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: 'F26C28',
      line: {
        color: 'F26C28'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> Washes per week',
    height: 500,
    width: 500,
    xaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    },
    yaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', data, layout);
}