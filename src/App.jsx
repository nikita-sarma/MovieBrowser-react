import React, { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};


const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isloading, setIsLoading] = useState(false);


const fetchMovies = async (query = '') => {
  setIsLoading(true);
  setErrorMessage('');

  try {
    const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endpoint, API_OPTIONS);

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();
    setMovieList(data.results || []);
  } catch (error) {
    console.error(`Error fetching movies: ${error}`);
    setErrorMessage('Failed to fetch movies. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchMovies();

  },[]);

  useEffect(() => {
    const controller = new AbortController();

    const performSearch = async () => {
      if (!searchTerm) {
        // empty search -> restore default list
        fetchMovies();
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
          searchTerm
        )}`;

        const response = await fetch(endpoint, { ...API_OPTIONS, signal: controller.signal });

        if (!response.ok) {
          throw new Error('failed to fetch search results');
        }

        const data = await response.json();
        setMovieList(data.results || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error(`Error searching movies: ${error}`);
        setErrorMessage('Failed to search movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      performSearch();
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  useEffect(() => {
  const timeout = setTimeout(() => {
    fetchMovies(searchTerm);
  }, 500);

  return () => clearTimeout(timeout);
}, [searchTerm]);


  return (
    <main>

      <div className="pattern" />
      
      <div className="wrapper">

        <header>
          <img src="./hero-img.png" alt="Hero banner"/>
          <h1>Find <span className="text-gradient">Movies</span>  You'll Enjoy Without the Hassle </h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies"> 
          <h2 className="mt-[40px]">All Movies</h2>

          {isloading ? (
            // <p className='text-white'>Loading...</p>
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

        </section>

      </div>
      
    </main>
  )
}


export default App




