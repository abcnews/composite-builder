var FIREBASE_URL = 'https://composite-archive.firebaseio.com/';

module.exports = window.Firebase && new window.Firebase(FIREBASE_URL);
