import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';

import ImageLoader from '../ImageLoader';

import { removeHash } from '../../helpers';

const DEFAULT_RENDERER_WIDTH = 800;
const DEFAULT_RENDERER_HEIGHT = 600;
const WIDTH_HEIGTH_RATIO = DEFAULT_RENDERER_WIDTH / DEFAULT_RENDERER_HEIGHT;

let app; // Will be the PIXI app
let that; // To access class from within event functions

export default class TwoDiagonal extends React.Component {
  state = {
    imagesLoaded: 0
  };

  topImage = new PIXI.Sprite(PIXI.Texture.EMPTY);
  // sprite2 = new PIXI.Sprite(PIXI.Texture.EMPTY);

  updateLink = false;

  componentDidMount() {
    that = this;
    app = new PIXI.Application({ backgroundColor: 0xeeeeee });
    app.renderer.autoResize = true;
    app.renderer.resize(DEFAULT_RENDERER_WIDTH, DEFAULT_RENDERER_HEIGHT); // Default: 800 x 600
    this.composer.appendChild(app.view);
    app.stage.addChild(this.topImage);
    // this.topImage.anchor.set(0.5);
    // app.stage.addChild(this.sprite2);

    // this.topImage.interactive = true;

    this.draggify(this.topImage);
  }

  handleImage = (image, imageIndex) => {
    const src = PIXI.loader.resources[image.src];

    if (src) {
      this.process(src.texture);
    } else {
      PIXI.loader.add(image.src).load(() => {
        this.process(PIXI.loader.resources[image.src].texture);
      });
    }
  };

  process = texture => {
    this.topImage.texture = texture;

    app.ticker.add(delta => this.animationLoop(delta));

    this.updateLink = true;

    // Wait a bit because apparently PIXI renders asynchronously
    // setTimeout(() => {
    //   this.sprite.x = 100;
    //   app.render();
    //   this.download.setAttribute('href', app.renderer.view.toDataURL());
    // }, 1000);

    // const { width, height } = texture;

    // this.sprite.texture = texture;

    // let ratio = 1;
    // let rendererWidth = DEFAULT_RENDERER_WIDTH;
    // let rendererHeight = DEFAULT_RENDERER_HEIGHT;

    // app.renderer.resize(rendererWidth, rendererHeight);

    // if (width > DEFAULT_RENDERER_WIDTH || height > DEFAULT_RENDERER_HEIGHT) {
    //   const temp = height * WIDTH_HEIGTH_RATIO;

    //   if (temp > width) {
    //     ratio = DEFAULT_RENDERER_HEIGHT / height;
    //     rendererWidth = (DEFAULT_RENDERER_WIDTH * width) / temp;
    //   } else {
    //     ratio = DEFAULT_RENDERER_WIDTH / width;
    //     rendererHeight = DEFAULT_RENDERER_HEIGHT / (width / temp);
    //   }
    // } else {
    //   rendererWidth = width < rendererWidth ? width : rendererWidth;
    //   rendererHeight = height < rendererHeight ? height : rendererHeight;
    // }

    // if (this.state.imagesLoaded === 0) {
    //   this.topImage.texture = texture;
    //   // this.sprite.scale.set(ratio, ratio);
    //   this.setState({ imagesLoaded: 1 });
    // } else if (this.state.imagesLoaded === 1) {
    //   this.sprite2.texture = texture;
    //   // this.sprite2.scale.set(ratio, ratio);
    //   this.setState({ imagesLoaded: 0 });
    // }

    // this.node.style.width = rendererWidth + 'px';
    // this.node.style.height = rendererHeight + 'px';

    // app.renderer.resize(rendererWidth, rendererHeight);

    // this.setState({ hasImg: true });
    // this.needUpdateDownloadLink = true;
  };

  animationLoop = delta => {
    // this.topImage.y += 0.1;

    if (this.updateLink) {
      app.render();
      this.download.setAttribute('href', app.renderer.view.toDataURL());
      this.updateLink = false;
    }
  };

  draggify = (obj) => {
    obj.interactive = true;
    obj.buttonMode = true;
    obj
      .on('mousedown', this.onDragStart)
      .on('touchstart', this.onDragStart)
      .on('mouseup', this.onDragEnd)
      .on('mouseupoutside', this.onDragEnd)
      .on('touchend', this.onDragEnd)
      .on('touchendoutside', this.onDragEnd)
      .on('mousemove', this.onDragMove)
      .on('touchmove', this.onDragMove);
  }

  onDragStart(event) {
    if (!this.dragging) {
      this.data = event.data;
      this.oldGroup = this.parentGroup;
      // this.parentGroup = dragGroup;
      this.dragging = true;
  
      // this.scale.x *= 1.1;
      // this.scale.y *= 1.1;
      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

   onDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.parentGroup = this.oldGroup;
      // this.scale.x /= 1.1;
      // this.scale.y /= 1.1;
      // set the interaction data to null
      this.data = null;
      
      // Render out new position to download
      that.updateLink = true;
    }
  }
  
   onDragMove() {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragPoint.x;
      this.y = newPosition.y - this.dragPoint.y;
    }
  }
  

  render() {
    return (
      <div className={styles.wrapper}>
        <ImageLoader handleImage={this.handleImage} />
        <div className={styles.image} ref={el => (this.composer = el)} />

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
} // End component

