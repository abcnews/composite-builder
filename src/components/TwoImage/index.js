const React = require('react');
const styles = require('./styles.scss');

// Old Mercury frontend library
const { app, Delegator } = require('mercury');
const CompositeBuilder = require('../../CompositeBuilder');
require('../../CompositeBuilder/global.scss');

const del = Delegator();

del.listenTo('dragover');
del.listenTo('dragleave');
del.listenTo('drop');

class TwoImage extends React.Component {
  componentDidMount() {
    app(this.node, CompositeBuilder(), CompositeBuilder.render);
  }

  handleClick = event => {
    event.preventDefault();
    window.location.hash = '';
    removeHash();
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <div ref={el => (this.node = el)} />
        <a href="#" onClick={this.handleClick}>
          Return to layout selection
        </a>
      </div>
    );
  }
}

module.exports = TwoImage;

function removeHash () { 
  var scrollV, scrollH, loc = window.location;
  if ("pushState" in history)
      history.pushState("", document.title, loc.pathname + loc.search);
  else {
      // Prevent scrolling by storing the page's current scroll offset
      scrollV = document.body.scrollTop;
      scrollH = document.body.scrollLeft;

      loc.hash = "";

      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scrollV;
      document.body.scrollLeft = scrollH;
  }
}