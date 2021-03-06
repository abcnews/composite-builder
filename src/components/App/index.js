import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';
PIXI.utils.skipHello();

// Component imports
import LayoutSelect from '../LayoutSelect';
import TwoImage from '../TwoImage';
import TwoDiagonal from '../TwoDiagonal';
import TwoVertical from '../TwoVertical';
import TwoHorizontal from '../TwoHorizontal';
import MultipleHorizontal from '../MultipleHorizontal';

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
        {this.state.view === 'two-horizontal' && <TwoHorizontal />}
        {this.state.view === 'three-horizontal' && <MultipleHorizontal panelCount={3} />}
        {this.state.view === 'four-horizontal' && <MultipleHorizontal panelCount={4} />}
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
