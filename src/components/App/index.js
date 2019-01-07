const React = require('react');
const styles = require('./styles.scss');

// Import components
const TwoImage = require('../TwoImage');

class App extends React.Component {
  state = {
    view: 'two-image'
  };

  render() {
    return (
      <div className={styles.wrapper}>
        {this.state.view === 'two-image' && <TwoImage />}
      </div>
    );
  }
}

module.exports = App;
