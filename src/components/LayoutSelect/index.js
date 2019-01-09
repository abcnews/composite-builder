const React = require('react');
const styles = require('./styles.scss');

// Import images
const twoImage = require('./images/two-image.jpg');
const twoDiagonal = require('./images/two-diagonal.jpg');

class LayoutSelect extends React.Component {
  handleClick = event => {
    event.preventDefault();
    window.location.hash = event.target.name;
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <p>Please select the layout you wish to use.</p>
        <a onClick={this.handleClick} href="#two-image" title="Two images side by side">
          <img width="320" src={twoImage} name={'two-image'} />
        </a>
        <a onClick={this.handleClick} href="#two-diagonal" title="Two images split diagonally">
          <img width="320" src={twoDiagonal} name={'two-diagonal'} />
        </a>
      </div>
    );
  }
}

module.exports = LayoutSelect;
