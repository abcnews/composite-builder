import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';

import ImageLoader from '../ImageLoader';

import { removeHash } from '../../helpers';

const BUILDER_WIDTH = 640;
const BUILDER_HEIGHT = 480;

let app; // Will be the PIXI app
let that; // To access class from within anonymous event functions

export default class TwoDiagonal extends React.Component {
  state = {
    imageIndex: 0
  };

  topImage = new PIXI.Sprite(PIXI.Texture.EMPTY);
  bottomImage = new PIXI.Sprite(PIXI.Texture.EMPTY);

  // updateLink = false;

  componentDidMount() {
    that = this;
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
    // this.topImage.anchor.set(0.5);
    // app.stage.addChild(this.sprite2);

    // this.topImage.interactive = true;

    this.draggify(this.topImage);
    this.draggify(this.bottomImage);

    var thing = new PIXI.Graphics();
    app.stage.addChild(thing);
    thing.x = 0;
    app.screen.width / 2;
    thing.y = 0;
    app.screen.height / 2;
    thing.lineStyle(0);

    this.topImage.mask = thing;

    thing.clear();

    thing.beginFill(0x8bc5ff, 0.4);
    thing.moveTo(0, 0);
    thing.lineTo(BUILDER_WIDTH, 0);
    thing.lineTo(0, BUILDER_HEIGHT);
    thing.lineTo(0, 0);
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
    if (this.state.imageIndex === 0) {
      const { width, height } = texture;
      const textureRatio = width / height;
      console.log(textureRatio);

      const heightRatio = BUILDER_HEIGHT / height;
      const widthRatio = BUILDER_WIDTH / width;

      console.log(heightRatio, widthRatio);

      if (textureRatio > 1) this.topImage.scale.set(heightRatio, heightRatio);
      else this.topImage.scale.set(widthRatio, widthRatio);

      // Load the texture into the sprite
      this.topImage.texture = texture;
      this.setState({ imageIndex: 1 });
    } else if (this.state.imageIndex === 1) {
      const { width, height } = texture;
      const textureRatio = width / height;
      console.log(textureRatio);

      const heightRatio = BUILDER_HEIGHT / height;
      const widthRatio = BUILDER_WIDTH / width;

      console.log(heightRatio, widthRatio);

      if (textureRatio > 1)
        this.bottomImage.scale.set(heightRatio, heightRatio);
      else this.bottomImage.scale.set(widthRatio, widthRatio);

      // Load the texture into the sprite
      this.bottomImage.texture = texture;

      this.setState({ imageIndex: 0 });
    }

    // Start the animation loop
    // app.ticker.add(delta => this.animationLoop(delta));

    // Update the download link
    // this.updateLink = true;

    // Wait a bit because apparently PIXI renders asynchronously
    // setTimeout(() => {
    //   this.sprite.x = 100;
    //   app.render();
    //   this.download.setAttribute('href', app.renderer.view.toDataURL());
    // }, 1000);

    // const { width, height } = texture;

    // this.sprite.texture = texture;

    // let ratio = 1;
    // let rendererWidth = BUILDER_WIDTH;
    // let rendererHeight = BUILDER_HEIGHT;

    // app.renderer.resize(rendererWidth, rendererHeight);

    // if (width > BUILDER_WIDTH || height > BUILDER_HEIGHT) {
    //   const temp = height * WIDTH_HEIGTH_RATIO;

    //   if (temp > width) {
    //     ratio = BUILDER_HEIGHT / height;
    //     rendererWidth = (BUILDER_WIDTH * width) / temp;
    //   } else {
    //     ratio = BUILDER_WIDTH / width;
    //     rendererHeight = BUILDER_HEIGHT / (width / temp);
    //   }
    // } else {
    //   rendererWidth = width < rendererWidth ? width : rendererWidth;
    //   rendererHeight = height < rendererHeight ? height : rendererHeight;
    // }

    // this.node.style.width = rendererWidth + 'px';
    // this.node.style.height = rendererHeight + 'px';

    // app.renderer.resize(rendererWidth, rendererHeight);

    // this.setState({ hasImg: true });
    // this.needUpdateDownloadLink = true;
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
      // that.updateLink = true;
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
