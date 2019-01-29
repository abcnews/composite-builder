const React = require('react');
const styles = require('./styles.scss');

// Import images
const twoImage = require('./images/two-image.jpg');
const threeHorizontal = require('./images/three-horizontal.jpg');
const twoDiagonal = require('./images/two-diagonal.jpg');
const twoDiagonalRight = require('./images/two-diagonal-right.jpg');
const twoVertical = require('./images/two-vertical.jpg');

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
            href="#two-horizontal"
            title="Two images side by side"
          >
            <img width="320" src={twoImage} name={'two-horizontal'} />
          </a>
        </div>

        <div className={styles.layout}>
          <a
            onClick={this.handleClick}
            href="#three-horizontal"
            title="Three images side by side"
          >
            <img width="320" src={threeHorizontal} name={'three-horizontal'} />
          </a>
        </div>

        <div className={styles.layout}>
          <a
            onClick={this.handleClick}
            href="#two-diagonal"
            title="Two images split diagonally from top right to bottom left"
          >
            <img width="320" src={twoDiagonal} name={'two-diagonal'} />
          </a>
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
        </div>

        <div className={styles.layout}>
          <a
            onClick={this.handleClick}
            href="#two-diagonal-right"
            title="Two images split horizontally"
          >
            <img width="320" src={twoVertical} name={'two-vertical'} />
          </a>
        </div>

        <div className={styles.footer}>
          <a href="https://github.com/abcnews/composite-builder/issues">
            Feedback / Ideas?
          </a>
        </div>
      </div>
    );
  }
}
