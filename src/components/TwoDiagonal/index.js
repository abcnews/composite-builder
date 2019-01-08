const React = require('react');
const styles = require('./styles.scss');

class TwoDiagonal extends React.Component {
  render() {
    return (
      <div className={styles.wrapper}>
        Find me in <strong>src/components/TwoDiagonal/index.js</strong>
      </div>
    );
  }
}

module.exports = TwoDiagonal;