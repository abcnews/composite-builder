import React from 'react';
import styles from './styles.scss';
import fileDialog from 'file-dialog';

export default class ImageLoader extends React.Component {
  handlefileDialog = async () => {
    let files = await fileDialog();
    this.handleFileInput(files);
  };

  handleFileInput = files => {
    if (files.length !== 1) return alert('Just give me one file please...');

    const file = files[0];
    if (file.type.split('/')[0] !== 'image')
      return alert('Only image files are supported...');

    this.readFile(file);
  };

  readFile = (file) => {
    const reader = new FileReader();

    reader.onload = evt => {
      try {
        const img = new Image();
        img.src = evt.target.result;
        this.props.handleImage(img);
      } catch (e) {
        return alert(e);
      }
    };

    reader.readAsDataURL(file);
  }

  render() {
    return (
      <div className={styles.root}>
        <button className="button" onClick={this.handlefileDialog}>
          {this.props.label || "Open image" }
        </button>
      </div>
    );
  }
}
