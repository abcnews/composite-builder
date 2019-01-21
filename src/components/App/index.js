const React = require('react');
const styles = require('./styles.scss');

// Component imports
import LayoutSelect from '../LayoutSelect';
import TwoImage from '../TwoImage';
import TwoDiagonal from '../TwoDiagonal';
import TwoVertical from '../TwoVertical';

export default class App extends React.Component {
  state = {
    view: 'layout-select'
  };

  componentDidMount() {
    // Implementing hash based navigation (against better judgement)
    window.addEventListener('hashchange', this.hashChange);

    // Initially read the hash and render accordingly
    this.checkHash();
  }

  componentWillUnmount() {
    // Take out the trash in case we hot reload
    window.removeEventListener('hashchange', this.hashChange);
  }

  hashChange = () => {
    // Set state based on hash
    this.checkHash();
  };

  checkHash = () => {
    // Checks the URL location and gives a view based on that hash
    if (window.location.hash === '') this.setState({ view: 'layout-select' });
    else {
      let currentHash = window.location.hash.substr(1);
      this.setState({ view: currentHash });
    }
  };

  render() {
    return (
      <div className={styles.wrapper}>
        {this.state.view === 'layout-select' && <LayoutSelect />}
        {this.state.view === 'two-image' && <TwoImage />}
        {this.state.view === 'two-diagonal' && <TwoDiagonal />}
        {this.state.view === 'two-diagonal-right' && (
          <TwoDiagonal direction={'right'} />
        )}
        {this.state.view === 'two-vertical' && (
          <TwoVertical direction={'right'} />
        )}
      </div>
    );
  }
}

// module.exports = App;
