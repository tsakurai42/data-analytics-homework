playerListURL = '/top_100_players';

d3.json(playerListURL).then(data => {
    console.log(data)
    selectHTML = d3.select('#top100players')
    selectHTML.selectAll('option')
        .data(data)
        .enter()
        .append('option')
        .text(d => d.Name)
        .attr('value', d => d.ID)
})

function splitRating(ratingString) {
    rating = ratingString.split("+")
    return parseInt(rating[0])+parseInt(rating[1])
}
function changePlayer(playerID) {
    console.log(playerID)
    playerPosRatingURL = `/player_position_rating/${playerID}`
    d3.json(playerPosRatingURL).then(data => {
        console.log(data)
        fieldRatings = d3.select('#fieldRatings')
        // fieldRatings.html(null)
        colorScale = chroma.scale(['red','yellow','green']).domain([0,100])
        // d3.select('#LW')
        //     .text(data.LW)
        //     .style('background-color',colorScale(splitRating(data.LW)))
        // d3.select("#ST")
        //     .text(data.ST)
        //     .style('background-color',colorScale(splitRating(data.ST)))
        // d3.select("#RW")
        //     .text(data.RW)
        //     .style('background-color',colorScale(splitRating(data.RW)))
        console.log(Object.entries(data))
        fieldRatings.html(null);
        fieldRatings.selectAll('div')
            .data(Object.entries(data))
            .enter()
            .append('div')
            .attr('id',d=>d[0])
            .text(d=>`${d[0]}: ${d[1]}`)
            .style('background-color',d=>colorScale(splitRating(d[1])))
    })
}