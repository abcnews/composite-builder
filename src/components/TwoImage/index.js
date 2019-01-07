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
  render() {
    return <div className={styles.wrapper} ref={el => (this.node = el)} />;
  }
}

module.exports = TwoImage;
