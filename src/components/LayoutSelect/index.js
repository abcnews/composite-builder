const React = require('react');
const styles = require('./styles.scss');

// Import images
const twoImage = require('./images/two-image.jpg');
const twoDiagonal = require('./images/two-diagonal.jpg');
const twoDiagonalRight = require('./images/two-diagonal-right.jpg');

export default class LayoutSelect extends React.Component {
  handleClick = event => {
    event.preventDefault();
    window.location.hash = event.target.name;
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <p>Please select the layout you wish to use.</p>
        <div className={styles.layout}>
          <a
            onClick={this.handleClick}
            href="#two-image"
            title="Two images side by side"
          >
            <img width="320" src={twoImage} name={'two-image'} />
          </a>
          <br /><strong>Original</strong>
        </div>
        <div className={styles.layout}>
          <a
            onClick={this.handleClick}
            href="#two-diagonal"
            title="Two images split diagonally from top right to bottom left"
          >
            <img width="320" src={twoDiagonal} name={'two-diagonal'} />
          </a>
          <br /><strong>Diagonal</strong>
        </div>
        <div className={styles.layout}>
          <a
            onClick={this.handleClick}
            href="#two-diagonal-right"
            title="Two images split diagonally from top left to bottom right"
          >
            <img
              width="320"
              src={twoDiagonalRight}
              name={'two-diagonal-right'}
            />
          </a>
          <br /><strong>Diagonal (inverse)</strong>
        </div>
        <div className={styles.footer}><a href="https://github.com/abcnews/composite-builder/issues">Feedback / Ideas?</a></div>
      </div>
    );
  }
}
