/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import PosterHolder from '../../components/UI/Carousel/PosterHolder/PosterHolder';
import { fetchMultiSearch } from '../../utils/API/api-requests';
import ErrorMessage from '../../components/UI/ErrorMessage/ErrorMessage';

import styles from './Search.module.css';

const INITIAL_STATE = {
  movieList: [],
  tvList: [],
  peopleList: [],
  type: 'movie',
  display: [],
  searchPage: 1,
  totalPages: undefined,
  showMovies: true,
  hasError: false,
  message: ''
};

function deleteDuplicated(content) {
  // Removes duplicated movies with same ID
  const uniquesArray = content.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  return uniquesArray;
}

function contentReducer(state, action) {
  switch (action.type) {
    case 'SET_MOVIES': {
      const movies = action.payload;
      const newArray = [...movies];
      if (state.type === 'movie') {
        return {
          ...state,
          hasError: false,
          message: '',
          movieList: newArray,
          display: newArray
        };
      }
      return { ...state, hasError: false, message: '', movieList: newArray };
    }
    case 'SET_TV': {
      const tv = action.payload;
      const newArray = [...tv];
      if (state.type === 'tv') {
        return {
          ...state,
          hasError: false,
          message: '',
          tvList: newArray,
          display: newArray
        };
      }
      return { ...state, hasError: false, message: '', tvList: newArray };
    }
    case 'SET_PEOPLE': {
      const people = action.payload;
      const newArray = [...people];
      if (state.type === 'people') {
        return {
          ...state,
          hasError: false,
          message: '',
          peopleList: newArray,
          display: newArray
        };
      }
      return { ...state, hasError: false, message: '', peopleList: newArray };
    }
    case 'UPDATE_MOVIES': {
      const movies = action.payload;
      const newArray = deleteDuplicated([...state.movieList, ...movies]);
      if (state.type === 'movie') {
        return {
          ...state,
          hasError: false,
          message: '',
          movieList: newArray,
          display: newArray
        };
      }
      return { ...state, hasError: false, message: '', movieList: newArray };
    }
    case 'UPDATE_TV': {
      const tv = action.payload;
      const newArray = deleteDuplicated([...state.tvList, ...tv]);
      if (state.type === 'tv') {
        return {
          ...state,
          hasError: false,
          message: '',
          tvList: newArray,
          display: newArray
        };
      }
      return { ...state, hasError: false, message: '', tvList: newArray };
    }
    case 'UPDATE_PEOPLE': {
      const people = action.payload;
      const newArray = deleteDuplicated([...state.peopleList, ...people]);
      if (state.type === 'people') {
        return {
          ...state,
          hasError: false,
          message: '',
          peopleList: newArray,
          display: newArray
        };
      }
      return { ...state, hasError: false, message: '', peopleList: newArray };
    }
    case 'SET_DISPLAY': {
      let newDisplay = [];
      if (action.payload === 'movie') {
        newDisplay = state.movieList;
      } else if (action.payload === 'tv') {
        newDisplay = state.tvList;
      } else if (action.payload === 'people') {
        newDisplay = state.peopleList;
      }
      return { ...state, display: newDisplay, type: action.payload };
    }
    case 'SET_TOTAL_PAGES': {
      return { ...state, totalPages: action.payload };
    }
    case 'SET_PAGE': {
      return { ...state, searchPage: action.payload };
    }
    case 'SET_ERROR': {
      return {
        ...INITIAL_STATE,
        hasError: true,
        message: action.payload
      };
    }
    case 'RESET_STATE': {
      return { ...INITIAL_STATE };
    }
    default:
      return {
        ...state
      };
  }
}

const Search = () => {
  const placeholder = 'Peliculas, series, actores, etc.';
  const [searchState, searchDispatch] = useReducer(
    contentReducer,
    INITIAL_STATE
  );
  const [searchInput, setSearchInput] = useState('');
  const [showBadges, setShowBadges] = useState(false);

  const {
    searchPage,
    totalPages,
    display,
    type,
    movieList,
    tvList,
    peopleList,
    hasError,
    message
  } = searchState;

  const fetchSearch = useCallback(async (searchValue, pageValue) => {
    const searchData = await fetchMultiSearch(searchValue, pageValue);
    if (!searchData.hasError) {
      const results = [...searchData.results];

      const searchResults = {
        movies: [],
        tv: [],
        people: []
      };

      if (results) {
        searchResults.movies = results.filter(
          (item) => item.media_type === 'movie'
        );
        searchResults.tv = results.filter((item) => item.media_type === 'tv');
        searchResults.people = results.filter(
          (item) => item.media_type === 'person'
        );
      }

      const response = {
        searchResults,
        totalPages: searchData.total_pages
      };

      return response;
    }
    return searchData;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim().length !== 0) {
        fetchSearch(searchInput, searchPage).then((response) => {
          if (response.hasError) {
            searchDispatch({
              type: 'SET_ERROR',
              payload: response.message
            });
          } else if (searchPage === 1) {
            searchDispatch({
              type: 'SET_MOVIES',
              payload: response.searchResults.movies
            });
            searchDispatch({
              type: 'SET_TV',
              payload: response.searchResults.tv
            });
            searchDispatch({
              type: 'SET_PEOPLE',
              payload: response.searchResults.people
            });
            searchDispatch({
              type: 'SET_TOTAL_PAGES',
              payload: response.totalPages
            });
          } else {
            searchDispatch({
              type: 'UPDATE_MOVIES',
              payload: response.searchResults.movies
            });
            searchDispatch({
              type: 'UPDATE_TV',
              payload: response.searchResults.tv
            });
            searchDispatch({
              type: 'UPDATE_PEOPLE',
              payload: response.searchResults.people
            });
          }
          setShowBadges(true);
        });
      } else {
        setShowBadges(false);
        searchDispatch({ type: 'RESET_STATE' });
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchInput, fetchSearch, searchPage]);

  const searchInputHandler = (event) => {
    setSearchInput(event.target.value);
    searchDispatch({ type: 'SET_PAGE', payload: 1 });
  };

  const notFoundMsg =
    searchInput.trim().length === 0
      ? 'Ingrese el termino de busqueda deseado'
      : 'No se encontraron resultados en esta categoria para tu búsqueda o todavía no se ha seleccionado una';

  const showSearchHandler = (event) => {
    switch (event.target.name) {
      case 'movie':
        searchDispatch({
          type: 'SET_DISPLAY',
          payload: 'movie'
        });
        break;
      case 'tv':
        searchDispatch({
          type: 'SET_DISPLAY',
          payload: 'tv'
        });
        break;
      case 'people':
        searchDispatch({
          type: 'SET_DISPLAY',
          payload: 'people'
        });
        break;
      default:
        break;
    }
  };

  const loadMoreHandler = () => {
    if (searchPage + 1 <= totalPages && searchInput.trim().length > 0) {
      searchDispatch({ type: 'SET_PAGE', payload: searchPage + 1 });
    }
  };

  return (
    <main className={styles.search}>
      <div className={styles.search__searchGroup}>
        <div className={styles.search__searchBar}>
          <input
            className={styles.search__searchInput}
            type="text"
            placeholder={placeholder}
            onChange={searchInputHandler}
          />
        </div>
        <div className={styles.search__searchFilters}>
          <div className={styles.search__filtersTitle}>
            <span>Resultados de la búsqueda</span>
          </div>
          <div className={styles.search__filtersClasses}>
            <button
              type="button"
              className={`${styles.search__filtersClass} ${
                type === 'movie' ? styles['search__filtersClass--active'] : ''
              }`}
              onClick={showSearchHandler}
              name="movie"
            >
              <span>Películas</span>
              {showBadges && (
                <span className={styles.search__countBadge}>
                  {movieList.length}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`${styles.search__filtersClass} ${
                type === 'tv' ? styles['search__filtersClass--active'] : ''
              }`}
              onClick={showSearchHandler}
              name="tv"
            >
              <span>Series</span>
              {showBadges && (
                <span className={styles.search__countBadge}>
                  {tvList.length}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`${styles.search__filtersClass} ${
                type === 'people' ? styles['search__filtersClass--active'] : ''
              }`}
              onClick={showSearchHandler}
              name="people"
            >
              <span>Personas</span>
              {showBadges && (
                <span className={styles.search__countBadge}>
                  {peopleList.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={loadMoreHandler}
          className={`${styles.search__more} ${
            searchPage === totalPages && styles['search__more--disabled']
          }`}
        >
          {searchPage === totalPages
            ? 'Se han cargado todos los resultados'
            : 'Cargar más resultados'}
        </button>
      </div>
      {!hasError && (
        <div className={styles.search__searchResults}>
          {display.length > 0 ? (
            <>
              {display.map((item) => (
                <PosterHolder item={item} key={item.id} isSearch />
              ))}
            </>
          ) : (
            <>
              <h3 className={styles.search__notFoundMsg}>{notFoundMsg}</h3>
            </>
          )}
        </div>
      )}
      {hasError && <ErrorMessage message={message} isSmall />}
    </main>
  );
};

export default Search;
