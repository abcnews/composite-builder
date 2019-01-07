const React = require('react');
const styles = require('./styles.scss');

// Component imports
const LayoutSelect = require('../LayoutSelect');
const TwoImage = require('../TwoImage');

class App extends React.Component {
  state = {
    view: 'layout-select'
  };

  changeView = (newView) => {
    this.setState( {view: newView })
  }

  render() {
    return (
      <div className={styles.wrapper}>
        {this.state.view === 'layout-select' && <LayoutSelect viewFunction={this.changeView}/>}
        {this.state.view === 'two-image' && <TwoImage viewFunction={this.changeView} />}
      </div>
    );
  }
}

module.exports = App;
