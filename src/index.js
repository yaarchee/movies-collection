import './scss/main.scss';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import 'basiclightbox/dist/basicLightbox.min.css';
import throttle from 'lodash.throttle';
import refs from './js/refs';
import moviesService from './js/APIService/moviesAPI-service';
import updateMoviesMarkup from './js/updateMoviesMarkup';
import lazyLoad from './js/components/lazyLoad';
import loadOnScroll from './js/components/loadOnScroll';
import scrollToTop from './js/components/scrollToTop';
import isVisible from './js/components/isScrollBtnVisible';
import * as basicLightbox from 'basiclightbox';
import globalVars from './js/globalVars/vars';
import fetchedMoviesHandler from './js/fetchedMoviesHandler';
import searchErrorNotFound from './js/components/notifyErrors';
import showLibraryTabs from './js/libraryTabs/showLibraryTabs';
import hideLibraryTabs from './js/libraryTabs/hideLibraryTabs';
import LocalStorageAPI from './js/localStorageAPI';
import modalOptions from './js/modalOptions';

function loadData() {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

loadData().then(() => {
  let preloaderEl = document.getElementById('preloader');
  preloaderEl.classList.add('hidden');
  preloaderEl.classList.remove('visible');
});

const localStorageAPI = new LocalStorageAPI();

loadOnScroll();
console.log('running populars fetch');
fetchedMoviesHandler('popular');

const submitHandler = (e) => {
  e.preventDefault();
  const reg = /^[0-9a-zа-яё\s]+$/iu;
  const inputValue = e.currentTarget.elements.query.value.trim().match(reg);
  if (!inputValue) {
    searchErrorNotFound(
      'Please enter correct movie name (numbers, latin and cyrillic symbols are allowed)'
    );
    return;
  }
  globalVars.searchQuery = inputValue;
  globalVars.moviesArr = [];
  updateMoviesMarkup.reset();
  moviesService.resetPage();
  fetchedMoviesHandler('search');
  e.currentTarget.reset();
};

const galleryClickHandler = ({ target }) => {
  const card = target.closest('.movie-card');
  if (target.closest('.movie-card').nodeName === 'DIV') {
    const movieID = card.children[0].dataset.id;
    if (localStorageAPI.checkMovie(movieID)) {
      const instance = basicLightbox.create(
        updateMoviesMarkup.showModalTemplate(globalVars.currentMovie),
        modalOptions
      );
      instance.show();
    } else {
      fetchedMoviesHandler(movieID);
    }
  }
};

const showSavedMovieWatched = () => {
  globalVars.activeTab = 'watched';
  localStorageAPI.getMovies('watchedMovies').length > 0
    ? updateMoviesMarkup.show(localStorageAPI.getMovies('watchedMovies'))
    : updateMoviesMarkup.defaultMsg('Вы не просмотрели ни одного фильма');
};

const showSavedMovieQueue = () => {
  globalVars.activeTab = 'queue';
  localStorageAPI.getMovies('queueMovies').length > 0
    ? updateMoviesMarkup.show(localStorageAPI.getMovies('queueMovies'))
    : updateMoviesMarkup.defaultMsg('У вас нет очереди к просмотру');
};

const showLibraryHandler = ({ target: { value } }) => {
  if (value === 'library') {
    showLibraryTabs();
    updateMoviesMarkup.reset();
    refs.queueTab.checked ? showSavedMovieQueue() : showSavedMovieWatched();
  }

  if (value === 'homePage') {
    globalVars.activeTab = value;
    hideLibraryTabs();
    updateMoviesMarkup.reset();
    updateMoviesMarkup.show(globalVars.moviesArr);
  }
  lazyLoad();
};

const showSavedMovieFromGrade = (e) => {
  if (e.target.tagName === 'INPUT') {
    updateMoviesMarkup.reset();
    globalVars.activeTab = e.target.value;

    if (e.target.value === 'watched') {
      showSavedMovieWatched();
    } else if (e.target.value === 'queue') {
      showSavedMovieQueue();
    }
    lazyLoad();
  }
};

refs.gallery.addEventListener('click', galleryClickHandler);
refs.headNav.addEventListener('click', showLibraryHandler);
refs.searchForm.addEventListener('submit', submitHandler);
refs.sectionWatched.addEventListener('click', showSavedMovieFromGrade);
refs.toTop.addEventListener('click', function () {
  scrollToTop(30);
});

refs.headNav.addEventListener('click', showLibraryHandler);
refs.sectionWatched.addEventListener('click', showSavedMovieFromGrade);

document.addEventListener(
  'click',
  (event) => {
    if (event.target.id === 'btnW') {
      localStorageAPI.toggleMovie(globalVars.watched);
      if (event.target.textContent === 'add to watched') {
        document.querySelector('#btnW').innerHTML = 'delete from watched';
        document.querySelector('#btnQ').innerHTML = 'add to queue';
      } else {
        document.querySelector('#btnW').innerHTML = 'add to watched';
      }
    } else if (event.target.id === 'btnQ') {
      localStorageAPI.toggleMovie(globalVars.queue);
      if (event.target.textContent === 'add to queue') {
        document.querySelector('#btnQ').innerHTML = 'delete from queue';
        document.querySelector('#btnW').innerHTML = 'add to watched';
      } else {
        document.querySelector('#btnQ').innerHTML = 'add to queue';
      }
    }
  },
  false
);

window.addEventListener('scroll', throttle(isVisible, 500));
