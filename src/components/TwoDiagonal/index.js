import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';
PIXI.utils.skipHello(); // Remove PIXI console ad

import ImageLoader from '../ImageLoader';

import { removeHash } from '../../helpers';

const BUILDER_WIDTH = 800;
const BUILDER_HEIGHT = 600;

let app; // Will be the PIXI app
let semicircle; // Will be our mask

// Set up the sprite images
let images = [];
const numberOfImages = 2;
for (let i = 0; i < numberOfImages; i++) {
  images[i] = new PIXI.Sprite(PIXI.Texture.EMPTY);
}

export default class TwoDiagonal extends React.Component {
  state = {
    imageIndex: 0,
    topScaleMin: 100
  };

  topImage = new PIXI.Sprite(PIXI.Texture.EMPTY);
  bottomImage = new PIXI.Sprite(PIXI.Texture.EMPTY);

  componentDidMount() {
    app = new PIXI.Application({
      backgroundColor: 0xeeeeee,
      preserveDrawingBuffer: true,
      antialias: true
    });
    app.renderer.autoResize = true;
    app.renderer.resize(BUILDER_WIDTH, BUILDER_HEIGHT); // Default: 800 x 600
    this.composer.appendChild(app.view);
    app.stage.addChild(images[1]);
    app.stage.addChild(images[0]);

    this.draggify(images[0]);
    this.draggify(images[1]);

    // Let's try a semi circle just for fun
    semicircle = new PIXI.Graphics();
    semicircle.beginFill(0xff0000);
    semicircle.lineStyle(4, 0xffd900, 1);
    semicircle.arc(0, 0, BUILDER_WIDTH, 0, Math.PI); // cx, cy, radius, startAngle, endAngle
    semicircle.x = BUILDER_WIDTH / 2;
    semicircle.y = BUILDER_HEIGHT / 2;
    semicircle.rotation = Math.PI - Math.atan(BUILDER_HEIGHT / BUILDER_WIDTH);
    app.stage.addChild(semicircle);

    images[0].mask = semicircle;
  }

  handleImage = image => {
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
    const { width, height } = texture;
    const textureRatio = width / height;

    const heightRatio = BUILDER_HEIGHT / height;
    const widthRatio = BUILDER_WIDTH / width;

    if (textureRatio > 1) {
      images[this.state.imageIndex].scale.set(heightRatio, heightRatio);
      images[this.state.imageIndex].minScale = heightRatio;
    } else {
      images[this.state.imageIndex].scale.set(widthRatio, widthRatio);
      images[this.state.imageIndex].minScale = widthRatio;
    }

    // Reposition image up top
    images[this.state.imageIndex].x = 0;
    images[this.state.imageIndex].y = 0;

    // Load the texture into the sprite
    images[this.state.imageIndex].texture = texture;

    // Toggle image loader target
    if (this.state.imageIndex === 0) this.setState({ imageIndex: 1 });
    else this.setState({ imageIndex: 0 });

    // Start the animation loop
    app.ticker.add(delta => this.animationLoop(delta));
  };

  // Use this if we require PIXI animations
  animationLoop = delta => {};

  // Pass a sprite to this to enable dragging
  draggify = obj => {
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
  };

  onDragStart(event) {
    if (!this.dragging) {
      this.data = event.data;
      this.oldGroup = this.parentGroup;
      this.dragging = true;

      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

  onDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.parentGroup = this.oldGroup;

      // set the interaction data to null
      this.data = null;
    }
  }

  onDragMove() {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragPoint.x;
      this.y = newPosition.y - this.dragPoint.y;

      let bounds = this.getBounds();

      // Keep image within stage bounds
      if (this.x > 0) this.x = 0;
      if (this.y > 0) this.y = 0;
      if (bounds.x + bounds.width < BUILDER_WIDTH)
        this.x = -(bounds.width - BUILDER_WIDTH);
      if (bounds.y + bounds.height < BUILDER_HEIGHT)
        this.y = -(bounds.height - BUILDER_HEIGHT);
    }
  }

  doZoom = event => {
    let scale = event.target.value / 100;
    let img = event.target.id === 'topZoom' ? images[0] : images[1];

    img.scale.x = img.minScale + (scale / 100 - 0.01);
    img.scale.y = img.minScale + (scale / 100 - 0.01);

    let bounds = img.getBounds();

    // Keep image within stage bounds
    if (img.x > 0) img.x = 0;
    if (img.y > 0) img.y = 0;
    if (img.x + bounds.width < BUILDER_WIDTH)
      img.x = -(bounds.width - BUILDER_WIDTH);
    if (img.y + bounds.height < BUILDER_HEIGHT)
      img.y = -(bounds.height - BUILDER_HEIGHT);
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <ImageLoader handleImage={this.handleImage} />
        <div className={styles.image} ref={el => (this.composer = el)} />

        <input
          className={styles.slider}
          id="topZoom"
          type="range"
          min="100"
          max="10000"
          step="1"
          defaultValue="100"
          onChange={this.doZoom}
        />

        <input
          className={styles.slider}
          id="bottomZoom"
          type="range"
          min="100"
          max="10000"
          step="1"
          defaultValue="100"
          onChange={this.doZoom}
        />

        <p>
          <a
            href="#two-diagonal"
            ref={el => (this.download = el)}
            onClick={event => {
              event.preventDefault();
              let a = document.createElement('a');
              document.body.append(a);
              let d = new Date();
              // Set the filename to current time
              a.download =
                'download-' +
                d.getFullYear() +
                '-' +
                ('' + d.getMonth() + 1) +
                '-' +
                d.getDate() +
                '-' +
                (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) +
                '.' +
                (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) +
                '.' +
                (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()) +
                '.jpg';
              // a.href = app.renderer.view.toDataURL('image/jpeg', 0.8);
              a.href = app.renderer.extract.base64(app.stage.view)
              a.click();
              a.remove();
            }}
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
