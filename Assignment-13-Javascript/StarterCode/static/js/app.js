// from data.js
var tableData = data;

// YOUR CODE HERE!
var ufoTable = d3.select("#ufo-table")
var ufoTableBody = d3.select("#ufo-table > tbody");
var countryList = []
var stateList = []

tableData.forEach((ufoData) => {
    var row = ufoTableBody.append("tr");
    var selectCountry = d3.select("#countryselect");

    Object.entries(ufoData).forEach(([key, val]) => {
        var cell = row.append("td");
        var val1 = [];
        if (key == "city") {
            val = val.split(" ");
            for (each_word of val) {
                val1.push(each_word.charAt(0).toUpperCase() + each_word.slice(1));
                val = val1.join(" ")
            }
        } else if (key == "country" || key == "state") {
            val = val.toUpperCase()
        }
        // cell.text(`${key} and ${val}`)
        cell.text(val)

        if (key == "country" && !countryList.includes(val)) {
            selectOption = selectCountry.append("option")
            selectOption.attr("value", val.toLowerCase())
            selectOption.text(val)
            countryList.push(val)
        }
        if (key == "state" && !stateList.includes(val)) {
            stateList.push(val)
        }
    })
})

var mapped  = tableData.map(ufo => {
    return Date.parse(ufo.datetime)

})
var mindate = new Date(math.min(mapped))
var maxdate = new Date(math.max(mapped))
minDateString = `${mindate.getMonth()+1}/${mindate.getDate()}/${mindate.getFullYear()}`
maxDateString = `${maxdate.getMonth()+1}/${maxdate.getDate()}/${maxdate.getFullYear()}`

var selectState = d3.select("#stateselect");
stateList.sort();
for (eachstate of stateList) {
    selectOption = selectState.append("option")
    selectOption.attr("value", eachstate.toLowerCase())
    selectOption.text(eachstate)
}

var filterButton = d3.select("#filter-btn")
var dateFilter = d3.select("#datetime")

filterButton.on("click", () => {
    tableData = data;
    // console.log(tableData)
    d3.event.preventDefault();

    if (d3.select("#countryselect").property('value') != "all") {
        // console.log(d3.select("#countryselect").property('value'))
        tableData = tableData.filter(ufo => ufo.country == d3.select("#countryselect").property('value'))
    }

    if (d3.select("#stateselect").property('value') != "all") {
        // console.log(d3.select("#countryselect").property('value'))
        tableData = tableData.filter(ufo => ufo.state == d3.select("#stateselect").property('value'))
    }
    chosenDate = dateFilter.property('value')
        if (chosenDate) {
        if (Date.parse(chosenDate) < mindate || Date.parse(chosenDate) > maxdate) {
            d3.select("#iferrorhere").text(`Date must be within ${minDateString} to ${maxDateString}`)
        } else {
            d3.select("#iferrorhere").text("")
            splitDate = chosenDate.split("/") // getting rid of leading zeros in case.
            chosenDate = [parseInt(splitDate[0]), parseInt(splitDate[1]), parseInt(splitDate[2])].join("/")
        }
        tableData = tableData.filter(date => date.datetime == chosenDate)
    }
    // console.log("print now!", tableData)
    ufoTableBody.remove();
    ufoTableBody = ufoTable.append("tbody")
    tableData.forEach((ufoData) => {
        var row = ufoTableBody.append("tr");
        Object.entries(ufoData).forEach(([key, val]) => {
            //console.log(val)
            var cell = row.append("td");
            var val1 = [];
            if (key == "city") {
                val = val.split(" ");
                for (each_word of val) {
                    val1.push(each_word.charAt(0).toUpperCase() + each_word.slice(1));
                    val = val1.join(" ")
                }
            } else if (key == "country" || key == "state") {
                val = val.toUpperCase()
            }
            // cell.text(`${key} and ${val}`)
            cell.text(val)
        }) 

    })
})

