const React = require('react');
const styles = require('./styles.scss');

class LayoutSelect extends React.Component {
  handleClick = event => {
    event.preventDefault();
    // location.hash = 'two-image';
    this.props.viewFunction(event.target.name);
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <p>Please select the layout you wish to use.</p>
        <a onClick={this.handleClick} href="#" name={'two-image'}>
          Two images
        </a>
      </div>
    );
  }
}

module.exports = LayoutSelect;
