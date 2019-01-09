import React from 'react';
import styles from './styles.scss';
import fileDialog from 'file-dialog';
import * as PIXI from 'pixi.js';

import { removeHash } from '../../helpers';

const DEFAULT_RENDERER_WIDTH = 800;
const DEFAULT_RENDERER_HEIGHT = 600;
const WIDTH_HEIGTH_RATIO = DEFAULT_RENDERER_WIDTH / DEFAULT_RENDERER_HEIGHT;

let pixiAPP;

export default class TwoDiagonal extends React.Component {
  sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);

  componentDidMount() {
    pixiAPP = new PIXI.Application({ backgroundColor: 0xf9f9f9 });
    pixiAPP.renderer.autoResize = true;
    pixiAPP.renderer.resize(100, 100);
    this.node.appendChild(pixiAPP.view);
    pixiAPP.stage.addChild(this.sprite);
  }

  handleImage = img => {
    console.log(img);
    const process = texture => {
      const { width, height } = texture;
      this.sprite.texture = texture;

      let ratio = 1;
      let rendererWidth = DEFAULT_RENDERER_WIDTH;
      let rendererHeight = DEFAULT_RENDERER_HEIGHT;

      pixiAPP.renderer.resize(rendererWidth, rendererHeight);

      if (width > DEFAULT_RENDERER_WIDTH || height > DEFAULT_RENDERER_HEIGHT) {
        const temp = height * WIDTH_HEIGTH_RATIO;

        if (temp > width) {
          ratio = DEFAULT_RENDERER_HEIGHT / height;
          rendererWidth = (DEFAULT_RENDERER_WIDTH * width) / temp;
        } else {
          ratio = DEFAULT_RENDERER_WIDTH / width;
          rendererHeight = DEFAULT_RENDERER_HEIGHT / (width / temp);
        }
      } else {
        rendererWidth = width < rendererWidth ? width : rendererWidth;
        rendererHeight = height < rendererHeight ? height : rendererHeight;
      }

      this.sprite.scale.set(ratio, ratio);
      // this.node.style.width = rendererWidth + 'px';
      // this.node.style.height = rendererHeight + 'px';

      pixiAPP.renderer.resize(rendererWidth, rendererHeight);
      // this.setState({ hasImg: true });
      // this.needUpdateDownloadLink = true;

      setTimeout(() => {
        pixiAPP.render();
        this.download.setAttribute('href', pixiAPP.renderer.view.toDataURL());
      }, 500);
    };

    const src = PIXI.loader.resources[img.src];

    if (src) {
      process(src.texture);
    } else {
      PIXI.loader.add(img.src).load(() => {
        process(PIXI.loader.resources[img.src].texture);
      });
    }
  };

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

  readFile(file) {
    const reader = new FileReader();

    reader.onload = evt => {
      try {
        const img = new Image();
        img.src = evt.target.result;
        this.handleImage(img);
      } catch (e) {
        return alert(e);
      }
    };

    reader.readAsDataURL(file);
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <button className="button" onClick={this.handlefileDialog}>
          Open image
        </button>
        <div className={styles.image} ref={el => (this.node = el)} />

        <p>
          <a
            href="#two-diagonal"
            ref={el => (this.download = el)}
            download="output.png"
            onClick={event => {}}
          >
            Download
          </a>
        </p>
        <p>
          <a
            href="#"
            onClick={event => {
              event.preventDefault();
              window.location.hash = '';
              removeHash();
            }}
          >
            Return to layout selection
          </a>
        </p>
      </div>
    );
  }
}
