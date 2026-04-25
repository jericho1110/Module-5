const apiKey = '4ae9d32f';
const searchInput = document.querySelector('.landing__search');
const searchButton = document.querySelector('.landing__button');
const moviesList = document.querySelector('.movies__list');

let currentMovies = [];

function injectSortControls() {
    const existing = document.querySelector('.sort__controls');
    if (existing) return;

    const moviesSection = document.querySelector('#movies .container');
    const sortDiv = document.createElement('div');
    sortDiv.classList.add('sort__controls');
    sortDiv.innerHTML = `
        <div class="sort__dropdown">
            <button class="sort__toggle">Sort By ▾</button>
            <ul class="sort__menu">
                <li class="sort__option" data-sort="default">Default</li>
                <li class="sort__option" data-sort="alpha">A–Z</li>
                <li class="sort__option" data-sort="newest">Year: Newest First</li>
                <li class="sort__option" data-sort="oldest">Year: Oldest First</li>
            </ul>
        </div>
    `;
    moviesSection.insertBefore(sortDiv, moviesList);

    const toggle = sortDiv.querySelector('.sort__toggle');
    const menu = sortDiv.querySelector('.sort__menu');

    toggle.addEventListener('click', () => menu.classList.toggle('open'));

    document.addEventListener('click', (e) => {
        if (!sortDiv.contains(e.target)) menu.classList.remove('open');
    });

    sortDiv.querySelectorAll('.sort__option').forEach(option => {
        option.addEventListener('click', () => {
            sortDiv.querySelectorAll('.sort__option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            toggle.textContent = option.textContent + ' ▾';
            menu.classList.remove('open');
            displayMovies(currentMovies, option.dataset.sort);
        });
    });
}

async function searchMovies(searchTerm) {
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}`;
    moviesList.innerHTML = '<p class="movies__message">Loading...</p>';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'True') {
            currentMovies = data.Search;
            injectSortControls();
            const toggle = document.querySelector('.sort__toggle');
            if (toggle) toggle.textContent = 'Sort By ▾';
            document.querySelectorAll('.sort__option').forEach(o => o.classList.remove('active'));
            displayMovies(currentMovies, 'default');
        } else {
            moviesList.innerHTML = `<p class="movies__message">No movies found for "${searchTerm}". Try another search!</p>`;
        }
    } catch (error) {
        moviesList.innerHTML = '<p class="movies__message">Something went wrong. Please try again.</p>';
        console.error('Error fetching movies:', error);
    }
}

function sortMovies(movies, sortType) {
    const sorted = [...movies];
    if (sortType === 'alpha') sorted.sort((a, b) => a.Title.localeCompare(b.Title));
    else if (sortType === 'newest') sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    else if (sortType === 'oldest') sorted.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    return sorted;
}

function displayMovies(movies, sortType = 'default') {
    const sorted = sortMovies(movies, sortType);
    moviesList.innerHTML = '';

    sorted.forEach(movie => {
        const poster = movie.Poster !== 'N/A'
            ? movie.Poster
            : 'https://via.placeholder.com/200x300?text=No+Image';

        const card = document.createElement('div');
        card.classList.add('movie__card');
        card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}" class="movie__poster">
            <div class="movie__info">
                <h3 class="movie__title">${movie.Title}</h3>
                <p class="movie__year">${movie.Year}</p>
            </div>
        `;
        moviesList.appendChild(card);
    });
}

searchButton.addEventListener('click', () => {
    const term = searchInput.value.trim();
    if (term) searchMovies(term);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const term = searchInput.value.trim();
        if (term) searchMovies(term);
    }
});

searchMovies('avengers');

function setupLinks(homeId, moviesId, myListId) {
    document.getElementById(homeId).addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        searchInput.value = '';
        searchMovies('avengers');
    });

    document.getElementById(moviesId).addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById(myListId).addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = 'batman';
        searchMovies('batman');
        document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
    });
}

setupLinks('link-home',   'link-movies',   'link-mylist');
setupLinks('footer-home', 'footer-movies', 'footer-mylist');
