// from data.js
var tableData = data;

// YOUR CODE HERE!

var ufoTableBody = d3.select("#ufo-table > tbody");
var selectCountry = d3.select("#countryselect");
var selectState = d3.select("#stateselect");
var filterButton = d3.select("#filter-btn")
var dateFilter = d3.select("#datetime")

populate_filters();

function populate_filters() {

    var countryList = []
    var stateList = []

    //on init, this is blank so start with "all". On change when this fxn is run, it may or may not be "all"
    // if (selectCountry.property("value") == "") {
    //     var countrySelected = "all"
    // } else {
    //     var countrySelected = selectCountry.property("value")
    // }
    // if (selectState.property("value") == "") { 
    //     var stateSelected = "all"
    // } else {
    //     var stateSelected = selectState.property("value")
    // }

    // d3.selectAll("#countryselect").html(null);
    // d3.selectAll("#stateselect").html(null);

    selectCountryOption = selectCountry.append("option")
    selectCountryOption.attr("value", "all").text("All").attr("selected", true)

    selectStateOption = selectState.append("option")
    selectStateOption.attr("value", "all").text("All").attr("selected", true)

    // if (countrySelected != "all") {
    //     countryList = [countrySelected]
    // }
    // if (stateSelected != "all") {
    //     stateList = [stateSelected]
    // }

    // ------------------------------
    // a bit of code to filter state and country based on the selections (like if CA country is selected, only ON state shows up). It turned out less user friendly because on misclick, you would have to exit
    // to 'all' and then choose the one you want instead. Maybe a filter based on Country being selected, still lists All/US/CA, but will filter states based on the country selection? Might work better.
    // ------------------------------

    // tableData.forEach(ufodat => {
    //     if (countrySelected != "all" && stateSelected == "all") { // if country is selected but not country
    //         console.log("country but not state")
    //         if (ufodat.country == countrySelected && !stateList.includes(ufodat.state)) {
    //             stateList.push(ufodat.state)
    //         }
    //     } else if (stateSelected != "all" && countrySelected == "all") {  //if state is selected but not country
    //         console.log("state but not country")
    //         if (ufodat.state == stateSelected && !countryList.includes(ufodat.country)) {
    //             countryList.push(ufodat.country)
    //         }
    //     } else if (stateSelected == "all" && countrySelected == "all") { //if neither state or country is selected
    //         console.log("neither state nor country")
    //         if (!stateList.includes(ufodat.state)) {
    //             stateList.push(ufodat.state)
    //         }
    //         if (!countryList.includes(ufodat.country)) {
    //             countryList.push(ufodat.country)
    //         }
    //     } else {
    //         console.log("both selected")
    //     }
    // })
    var tableData = data // reload full dataset
    tableData.forEach(ufodat => {
        if (!stateList.includes(ufodat.state)) {
            stateList.push(ufodat.state)
        }
        if (!countryList.includes(ufodat.country)) {
            countryList.push(ufodat.country)
        }
    })

    for (eachcountry of countryList) {
        selectCountryOption = selectCountry.append("option")
        selectCountryOption.attr("value", eachcountry.toLowerCase())
        selectCountryOption.text(eachcountry.toUpperCase())
        // if (eachcountry == countrySelected) {
        //     selectCountryOption.attr("selected", true)
        // }
    }
    stateList.sort();
    for (eachstate of stateList) {
        selectStateOption = selectState.append("option")
        selectStateOption.attr("value", eachstate.toLowerCase())
        selectStateOption.text(eachstate.toUpperCase())
        // if (eachstate == stateSelected) {
        //     selectStateOption.attr("selected", true)
        // }
    }
}

// initial table setup
tableData.forEach((ufoData) => {
    var row = ufoTableBody.append("tr");

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
        cell.text(val)
    })
})

//get min and max date values
var mapped = tableData.map(ufo => {
    return Date.parse(ufo.datetime)
})

var mindate = new Date(math.min(mapped))
var maxdate = new Date(math.max(mapped))
minDateString = `${mindate.getMonth() + 1}/${mindate.getDate()}/${mindate.getFullYear()}` //why is getMonth 0 indexed but getDate isn't...???
maxDateString = `${maxdate.getMonth() + 1}/${maxdate.getDate()}/${maxdate.getFullYear()}`

filterButton.on("click", filterAndShow)

function filterAndShow() {
    tableData = data; // reload full dataset
    d3.event.preventDefault();

    // if countryselect dropdown is not "all", filter based on the chosen value
    if (selectCountry.property('value') != "all") {
        tableData = tableData.filter(ufo => ufo.country == selectCountry.property('value'))
    }

    // if stateselect dropdown is not "all", filter based on the chosen value. This filters what was already filtered if both country and state are selected
    if (selectState.property('value') != "all") {
        tableData = tableData.filter(ufo => ufo.state == selectState.property('value'))
    }

    chosenDate = dateFilter.property('value')
    if (chosenDate) {
        if (Date.parse(chosenDate) < mindate || Date.parse(chosenDate) > maxdate) { // if date is not within min or max date.
            d3.select("#iferrorhere").text(`Data only exists between ${minDateString} to ${maxDateString}`)
        } else {
            d3.select("#iferrorhere").text("")
            splitDate = chosenDate.split("/") // getting rid of leading zeros in case. split to list, convert list values to integers, rejoin.
            chosenDate = [parseInt(splitDate[0]), parseInt(splitDate[1]), parseInt(splitDate[2])].join("/")
        }
        tableData = tableData.filter(date => date.datetime == chosenDate) // filter based on this date. data.js did not have any leading zeros.
    }

    ufoTableBody.html(null)
    tableData.forEach((ufoData) => {
        var row = ufoTableBody.append("tr");
        Object.entries(ufoData).forEach(([key, val]) => {
            var cell = row.append("td");
            if (key == "city") { // Try to capitalize city names. Split on space, capitalize each word, rejoin.
                val = val.split(" ");
                var val1 = [];
                for (each_word of val) {
                    val1.push(each_word.charAt(0).toUpperCase() + each_word.slice(1));
                    val = val1.join(" ")
                }
            } else if (key == "country" || key == "state") { // all caps state and country abbreviations.
                val = val.toUpperCase()
            }
            cell.text(val)
        })

    })
}

selectCountry.on("change", filterAndShow)
selectState.on("change", filterAndShow)