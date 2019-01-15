export function removeHash() {
  var scrollV,
    scrollH,
    loc = window.location;
  if ('pushState' in history)
    history.pushState('', document.title, loc.pathname + loc.search);
  else {
    // Prevent scrolling by storing the page's current scroll offset
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;

    loc.hash = '';

    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}