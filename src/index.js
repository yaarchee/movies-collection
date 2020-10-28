import './scss/main.scss';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import throttle from 'lodash.throttle';
import refs from './js/refs';
import imagesService from './js/moviesAPI-service';
import updateMoviesMarkup from './js/updateMoviesMarkup';
import Loader from './js/components/Loader';
import lazyLoad from './js/components/lazyLoad';
import loadOnScroll from './js/components/loadOnScroll';
import scrollToTop from './js/components/scrollToTop';
import isVisible from './js/components/isScrollBtnVisible';
//import filmsList from './js/currentFilmList'
import updateMoviesLocalStorage from './js/updateMoviesLocalStorage'
import globalVars from "./js/globalVars/vars";

import showLightbox from './js/showLightbox';

const loader = new Loader('.js-loader', 'is-hidden');


imagesService.fetchPopularMovies().then((movies) => {
  console.log(movies);
  globalVars.popularMoviesArr =  movies;

  updateMoviesMarkup.show(movies);
  lazyLoad();
});

const submitHandler = (e) => {
  e.preventDefault();
  const reg = /^[a-zа-яё\s]+$/iu;
  const inputValue = e.currentTarget.elements.query.value.match(reg).input;
  //TODO check if inputValue is not a null
  updateMoviesMarkup.reset();
  loader.show();
  imagesService.query = inputValue;
  imagesService.resetPage();
  imagesService
    .fetchPopularMovies()
    .then((movies) => {

      updateMoviesMarkup.show(movies);
      lazyLoad();
      loadOnScroll();
    })
    .finally(() => loader.hide());
  e.currentTarget.reset();
};

const galleryClickHandler = ({ target }) => {
  if (target.nodeName === 'IMG') {
    const imageElArr = Array.from(
      refs.gallery.querySelectorAll('.gallery-image')
    );
    const imageSrcArr = imageElArr.map((image) => image.dataset.source);
    const currentTargetId = imageSrcArr.findIndex(
      (value) => value === target.dataset.source
    );
    showLightbox(imageSrcArr, currentTargetId);
  }
};


const showLibrary = e => {
  if (e.target.value === 'library') {
    globalVars.activeTab = 'watched';
    refs.sectionWatched.classList.add('visibility');
    refs.searchForm.classList.add('unVisibility');
    showSavedMovieWatched();
  }else{
    globalVars.activeTab = e.target.value;
    refs.sectionWatched.classList.remove('visibility');
    refs.searchForm.classList.remove('unVisibility');

    updateMoviesMarkup.reset();
    updateMoviesMarkup.show(globalVars.popularMoviesArr);
    lazyLoad();
    loadOnScroll();
  }

}

const showSavedMovieFromGrade = e =>{
  updateMoviesMarkup.reset();
  globalVars.activeTab = e.target.value;
  if (e.target.value === 'watched') {

    showSavedMovieWatched();
  }else if(e.target.value === 'queue'){
    showSavedMovieQueue();
  }

  lazyLoad();
  loadOnScroll();
}


const runLoadScroll = () => {

}

const showSavedMovieWatched = ()=>{
  globalVars.activeTab = 'watched';
  updateMoviesLocalStorage.getWatchedMovies() ?
    updateMoviesMarkup.show(updateMoviesLocalStorage.getWatchedMovies()) :
    updateMoviesMarkup.defaultMsg("Вы не просмотрели ни одного фильма")

}

const showSavedMovieQueue = ()=>{
  updateMoviesLocalStorage.getQueueMovies()?
    updateMoviesMarkup.show(updateMoviesLocalStorage.getQueueMovies()) :
    updateMoviesMarkup.defaultMsg("У вас нет очереди к просмотру")
}

refs.searchForm.addEventListener('submit', submitHandler);
refs.gallery.addEventListener('click', galleryClickHandler);
refs.toTop.addEventListener('click', function () {
  scrollToTop(30);
});

refs.headNav.addEventListener('click', showLibrary);
refs.sectionWatched.addEventListener('click', showSavedMovieFromGrade)

window.addEventListener('scroll', throttle(isVisible, 500));
