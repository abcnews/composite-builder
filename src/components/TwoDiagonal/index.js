import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';

import ImageLoader from '../ImageLoader';

import { removeHash } from '../../helpers';

const BUILDER_WIDTH = 640;
const BUILDER_HEIGHT = 480;

let app; // Will be the PIXI app

export default class TwoDiagonal extends React.Component {
  state = {
    imageIndex: 0
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
    app.stage.addChild(this.bottomImage);
    app.stage.addChild(this.topImage);

    this.draggify(this.topImage);
    this.draggify(this.bottomImage);

    // Add a mask to the stage
    var diagonalMask = new PIXI.Graphics();
    app.stage.addChild(diagonalMask);
    diagonalMask.x = 0;
    app.screen.width / 2;
    diagonalMask.y = 0;
    app.screen.height / 2;
    diagonalMask.lineStyle(0);

    this.topImage.mask = diagonalMask;

    diagonalMask.clear();

    diagonalMask.beginFill(0x8bc5ff, 0.4);
    diagonalMask.moveTo(0, 0);
    diagonalMask.lineTo(BUILDER_WIDTH, 0);
    diagonalMask.lineTo(0, BUILDER_HEIGHT);
    diagonalMask.lineTo(0, 0);
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
    if (this.state.imageIndex === 0) {
      const { width, height } = texture;
      const textureRatio = width / height;

      const heightRatio = BUILDER_HEIGHT / height;
      const widthRatio = BUILDER_WIDTH / width;

      if (textureRatio > 1) this.topImage.scale.set(heightRatio, heightRatio);
      else this.topImage.scale.set(widthRatio, widthRatio);

      // Load the texture into the sprite
      this.topImage.texture = texture;
      this.setState({ imageIndex: 1 });
    } else if (this.state.imageIndex === 1) {
      const { width, height } = texture;
      const textureRatio = width / height;

      const heightRatio = BUILDER_HEIGHT / height;
      const widthRatio = BUILDER_WIDTH / width;

      if (textureRatio > 1)
        this.bottomImage.scale.set(heightRatio, heightRatio);
      else this.bottomImage.scale.set(widthRatio, widthRatio);

      // Load the texture into the sprite
      this.bottomImage.texture = texture;

      this.setState({ imageIndex: 0 });
    }

    // Start the animation loop
    // app.ticker.add(delta => this.animationLoop(delta));
  };

  // Use this if we require animations perhaps
  animationLoop = delta => {
    // if (this.updateLink) {
    //   app.render();
    //   this.download.setAttribute(
    //     'href',
    //     app.renderer.view.toDataURL('image/jpeg', 0.5)
    //   );
    // }
  };

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
      let oldPositionX = this.x;
      let oldPositionY = this.y;

      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragPoint.x;
      this.y = newPosition.y - this.dragPoint.y;

      let bounds = this.getBounds();

      // Keep image within stage bounds
      if (this.x > 0) this.x = 0;
      if (this.y > 0) this.y = 0;
      if (bounds.x + bounds.width < BUILDER_WIDTH) this.x = -(bounds.width - BUILDER_WIDTH);
      if (bounds.y + bounds.height < BUILDER_HEIGHT) this.y = -(bounds.height - BUILDER_HEIGHT);
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
            onClick={event => {
              event.preventDefault();
              var a = document.createElement('a');
              document.body.append(a);
              a.download = 'download.jpg';
              a.href = app.renderer.view.toDataURL('image/jpeg', 0.5);
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
