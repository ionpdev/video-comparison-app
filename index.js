const autoCompleteConfig = {
    // how to show an individual item
    renderOption: (movie) => {
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster
        return `
            <img src="${imgSrc}" />
            ${movie.Title} (${movie.Year})
        `
    }, 
    // takes the Title and save it in search term, a backfill when someone clicks an item
    inputValue: (movie) => {
        return movie.Title
    },
    // fetch the data
    fetchData: async (searchTerm) => {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'cc4a46c4',
                s: searchTerm
            }
        })
        if ( response.data.Error) {
            return []
        }
    
        return response.data.Search
    }
}

createAutoComplete({
    //make a copy of autocomplete in our object
    ...autoCompleteConfig,
    // where to render
    root: document.querySelector('#left-autocomplete'),
    // what to do when someone clicks on an item
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left')
    },
    
})
createAutoComplete({
    //make a copy of autocomplete in our object
    ...autoCompleteConfig,
    // where to render
    root: document.querySelector('#right-autocomplete'),
    // what to do when someone clicks on an item
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right')
    },
})

let leftMovie
let rightMovie

const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: 'cc4a46c4',
        i: movie.imdbID
      }
    })
  
    summaryElement.innerHTML = movieTemplate(response.data);

    if (side === 'left') {
        leftMovie = response.data
    } else {
        rightMovie = response.data
    }

    //run comparison between movies if both are defined
    if (leftMovie && rightMovie) {
        runComparison()
    }
  }

  const runComparison = () => {
    //get all elements from left and right
    const leftSideStats = document.querySelectorAll('#left-summary .notification')
    const rightSideStats = document.querySelectorAll('#right-summary .notification')
    //loop over each
    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index]
        //get the actual value off of each
        const leftSideValue = parseInt(leftStat.dataset.value)
        const rightSideValue = parseInt(rightStat.dataset.value)
        //compariosn
        if (rightSideValue > leftSideValue) {
            //if right is greater than left, then
            //change teh collor from green to yellow
            leftStat.classList.remove('is-primary')
            leftStat.classList.add('is-warning')
        } else {
            rightStat.classList.remove('is-primary')
            rightStat.classList.add('is-warning')
        }
    })
  }

const movieTemplate = (movieDetail) => {

    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''))
    const metascore = parseInt(movieDetail.Metascore)
    const imdbRating = parseFloat(movieDetail.imdbRating)
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''))
    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
        
        const value = parseInt(word)

        if (isNaN(value)) {
            return prev
        } else {
            return prev + value
        }
    }, 0)


    return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}" />
                </p>
            </figure>
            <div class="media-content>
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="title">${movieDetail.BoxOffice}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value=${metascore} class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imdbRating} class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `
}