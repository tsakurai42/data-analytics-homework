playerListURL = '/top_100_players';

d3.json(playerListURL).then(data => {
    // console.log(data.id_list)
    // console.log(data.players)
    selectHTML = d3.select('#top100players')
    selectHTML.selectAll('option')
        .data(data.players)
        .enter()
        .append('option')
        .text(d => d['Name'])
        .attr('value', d => d.ID)

    selectHTML.on('change', function () {
        changePlayer(data.players[data.id_list[this.value]])
    })
    changePlayer(data.players[0]) // init on top rated player, Messi
})

// ratings in this game are given as ##+#, for reasons (players get bonus rating for 'chemistry')
// so need to split the string on the +, then add the values.
function splitRating(ratingString) {
    rating = ratingString.split("+")
    return parseInt(rating[0]) + parseInt(rating[1])
}

function changePlayer(data) {
    colorScale = chroma.scale(['red', 'yellow', 'green']).domain([0, 100])
    for (each_zone of Object.entries(data)) {
        if (each_zone[0] != 'ID' && each_zone[0] != 'Name') {
            d3.select(`#${each_zone[0]}`)  //fill color by color scale 0-100
                .transition()
                .duration(500)
                .attr('fill', colorScale(splitRating(each_zone[1])))
            d3.select(`#${each_zone[0]}-t`)  // write rating score
                .text(splitRating(each_zone[1]))
        }
    }
}