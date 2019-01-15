import React from 'react';
import styles from './styles.scss';

import { removeHash } from '../../helpers';

// Old Mercury frontend library
const { app, Delegator } = require('mercury');
const CompositeBuilder = require('../../CompositeBuilder');
require('../../CompositeBuilder/global.scss');

const del = Delegator();

del.listenTo('dragover');
del.listenTo('dragleave');
del.listenTo('drop');

export default class TwoImage extends React.Component {
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
