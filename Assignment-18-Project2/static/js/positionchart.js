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

changePlayer(158023); // initialize field with Lionel Messi

// ratings in this game are given as ##+#, due to something called a chemistry bonus. Map is utilized, by default USING the chem bonus
// so need to split the string on the +, then adding the values.
function splitRating(ratingString) {
    rating = ratingString.split("+")
    return parseInt(rating[0])+parseInt(rating[1])
}

function changePlayer(playerID) {
    // console.log(playerID)
    colorScale = chroma.scale(['red','yellow','green']).domain([0,100])
    d3.json(`/player_position_rating/${playerID}`).then(data => {
        // fieldRatings = d3.select('#fieldRatings')
        // console.log(Object.entries(data))
        for (each_zone of Object.entries(data)) {
            d3.select(`#${each_zone[0]}`)  //fill color by color scale 0-100
                .attr('fill',colorScale(splitRating(each_zone[1])))
            d3.select(`#${each_zone[0]}-t`)   // write rating score
                .text(splitRating(each_zone[1]))
        }
    })
}