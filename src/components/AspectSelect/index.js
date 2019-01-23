import React from 'react';
import styles from './styles.scss';

export default class AspectSelect extends React.Component {
  aspectSelect = event => {
    this.props.handler(event);
  };

  render() {
    return (
      <div className={styles.root}>
        <button
          className={styles.button}
          onClick={this.aspectSelect}
          id={'4x3'}
        >
          4 x 3
        </button>
        <button
          className={styles.button}
          onClick={this.aspectSelect}
          id={'3x2'}
        >
          3 x 2
        </button>
        <button
          className={styles.button}
          onClick={this.aspectSelect}
          id={'16x9'}
        >
          16 x 9
        </button>
        <button
          className={styles.button}
          onClick={this.aspectSelect}
          id={'1x1'}
        >
          1 x 1
        </button>
        <button
          className={styles.button}
          onClick={this.aspectSelect}
          id={'swap'}
        >
          Swap X/Y
        </button>
      </div>
    );
  }
}
