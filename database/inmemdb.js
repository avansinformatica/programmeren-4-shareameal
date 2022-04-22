// Deze variabelen worden niet geëxporteerd en kunnen dus niet
// vanuit andere bestanden gewijzigd worden - alleen via de databasefuncties.
const _moviedb = []
const timeout = 500 // msec
let id = 0

// Dit is het object dat geexporteerd wordt, en dus in andere JavaScript bestanden geïmporteerd kan worden, via require.
module.exports = {
    /**
     * Maak een nieuwe movie aan in de database. De naam van de movie moet uniek zijn.
     *
     * @param {*} movie De movie die we toevoegen
     * @param {*} callback De functie die ofwel een error, ofwel een resultaat teruggeeft.
     */
    createMovie(movie, callback) {
        console.log('createMovie called')
        // we simuleren hier dat de database query 'lang' duurt, door een setTimeout toe te voegen.
        setTimeout(() => {
            // de naam van de movie moet uniek zijn.
            // controleer daarom eerst of er al een movie met die naam in de _moviedb zit.
            if (
                movie &&
                movie.name &&
                _moviedb.filter((item) => item.name === movie.name).length > 0
            ) {
                const error = 'A movie with this name already exists.'
                console.log(error)
                // roep de callback functie aan met error als resultaat, en result = undefined.
                callback(error, undefined)
            } else {
                // voeg de id toe aan de movie, in de moveToAdd
                const movieToAdd = {
                    id: id++,
                    ...movie,
                }
                _moviedb.push(movieToAdd)
                // roep de callback aan, zonder error, maar met de nieuwe movie als result.
                callback(undefined, movieToAdd)
            }
        }, timeout)
    },

    /**
     * Retourneer een lijst van alle movies.
     * Om alle movies op te halen hebben we geen input param nodig,
     * dus alleen een callback als parameter.
     *
     * @param {*} callback De functie die het resultaat retourneert.
     */
    listMovies(callback) {
        console.log('lisMovies called')
        setTimeout(() => {
            // roep de callback aan, zonder error, maar met de hele moviedb als result.
            callback(undefined, _moviedb)
        }, timeout)
    },

    getMovieById() {
        // zelf uitwerken
    },

    updateMovie() {
        // zelf uitwerken
    },

    deleteMovie() {
        // zelf uitwerken
    },
}
