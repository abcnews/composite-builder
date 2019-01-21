import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';
import fileDialog from 'file-dialog';
const { detect } = require('detect-browser');
const browser = detect();

import { removeHash } from '../../helpers';

let BUILDER_WIDTH = 800;
let BUILDER_HEIGHT = 600;

let that;

export default class TwoDiagonal extends React.Component {
  state = {
    width: this.props.builderWidth,
    height: this.props.builderHeight,
    imageIndex: 0,
    topScale: 100,
    bottomScale: 100,
    sectionPercent: 50
  };

  app = new PIXI.Application({
    backgroundColor: 0xeeeeee,
    preserveDrawingBuffer: true,
    antialias: true
  });

  images = [];

  semicircle = new PIXI.Graphics();
  maskPlaceholder = new PIXI.Graphics();

  componentDidMount() {
    that = this;
    // Hackish way of accessing these in drag events
    BUILDER_WIDTH = this.props.builderWidth;
    BUILDER_HEIGHT = this.props.builderHeight;

    // Set up the sprite images
    const numberOfImages = 2;
    for (let i = 0; i < numberOfImages; i++) {
      this.images[i] = new PIXI.Sprite(PIXI.Texture.EMPTY);
    }

    this.app.renderer.autoResize = true;
    this.app.renderer.resize(this.props.builderWidth, this.props.builderHeight); // Default: 800 x 600
    this.composer.appendChild(this.app.view); // Attach PIXI app
    this.composer.style.width = this.props.builderWidth + 'px'; // Wrap container tightly
    this.app.stage.addChild(this.images[1]);

    // Use a placeholder for image 0
    this.maskPlaceholder.beginFill(0xcccccc);
    this.maskPlaceholder.lineStyle(4, 0xffd900, 1);
    this.maskPlaceholder.arc(0, 0, this.props.builderWidth, 0, Math.PI); // cx, cy, radius, startAngle, endAngle
    this.maskPlaceholder.x = this.props.builderWidth / 2;
    this.maskPlaceholder.y = this.props.builderHeight / 2;
    this.maskPlaceholder.rotation = Math.PI;

    // Add the placeholder
    this.app.stage.addChild(this.maskPlaceholder);

    // Image 0 top layer
    this.app.stage.addChild(this.images[0]);

    // Enable iamge dragging
    this.draggify(this.images[0]);
    this.draggify(this.images[1]);

    // Name images to check later for dragging and zoom bounds
    this.images[0].name = 'top';
    this.images[1].name = 'bottom';

    // Let's try a semi circle
    this.semicircle.beginFill(0xff0000);
    this.semicircle.lineStyle(4, 0xffd900, 1);
    this.semicircle.arc(0, 0, this.props.builderWidth, 0, Math.PI); // cx, cy, radius, startAngle, endAngle
    this.semicircle.x = this.props.builderWidth / 2;
    this.semicircle.y = this.props.builderHeight / 2;
    this.semicircle.rotation = Math.PI;

    // Add to stage and then mask first image
    this.app.stage.addChild(this.semicircle);
    this.images[0].mask = this.semicircle;
  }

  // This is usually called by the ImageLoader component
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
    const builderRatio = this.props.builderWidth / this.props.builderHeight;

    const heightRatio = this.props.builderHeight / height;
    const widthRatio = this.props.builderWidth / width;

    // Scale image so it fits on stage
    if (textureRatio > builderRatio) {
      this.images[this.state.imageIndex].scale.set(heightRatio, heightRatio);
      this.images[this.state.imageIndex].minScale = heightRatio;
    } else {
      this.images[this.state.imageIndex].scale.set(widthRatio, widthRatio);
      this.images[this.state.imageIndex].minScale = widthRatio;
    }

    // Reset our sliders to zero
    if (this.state.imageIndex === 0) this.setState({ topScale: 100 });
    else this.setState({ bottomScale: 100 });

    // Reposition image up top
    this.images[this.state.imageIndex].x = 0;
    this.images[this.state.imageIndex].y = 0;

    // Load the texture into the sprite
    this.images[this.state.imageIndex].texture = texture;

    // Start the animation loop
    this.app.ticker.add(delta => this.animationLoop(delta));
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

      let imageBounds = this.getBounds();

      // Top and bottom images hhave different bounding boxes
      if (this.name === 'top') {
        // Keep top corner in bounds
        if (this.x > 0) this.x = 0;
        if (this.y > 0) this.y = 0;

        if (imageBounds.x + imageBounds.width < BUILDER_WIDTH)
          this.x = -(imageBounds.width - BUILDER_WIDTH);
        if (
          imageBounds.y + imageBounds.height <
          BUILDER_HEIGHT * (that.state.sectionPercent / 100)
        )
          this.y = -(
            imageBounds.height -
            BUILDER_HEIGHT * (that.state.sectionPercent / 100)
          );
      } else {
        if (this.x > 0) this.x = 0;
        if (this.y > 0 + BUILDER_HEIGHT * (that.state.sectionPercent / 100))
          this.y = 0 + BUILDER_HEIGHT * (that.state.sectionPercent / 100);

        if (imageBounds.x + imageBounds.width < BUILDER_WIDTH)
          this.x = -(imageBounds.width - BUILDER_WIDTH);
        if (imageBounds.y + imageBounds.height < BUILDER_HEIGHT)
          this.y = -(imageBounds.height - BUILDER_HEIGHT);
      }
    }
  }

  doZoom = event => {
    let scale = event.target.value / 100;
    let img = event.target.id === 'topZoom' ? this.images[0] : this.images[1];

    // Update state so we can zero scale on image reload
    if (event.target.id === 'topZoom')
      this.setState({ topScale: event.target.value });
    else this.setState({ bottomScale: event.target.value });

    img.scale.x = img.minScale * scale; //+ (scale / 100 - 0.01);
    img.scale.y = img.minScale * scale; //+ (scale / 100 - 0.01);

    let imageBounds = img.getBounds();

    // Top and bottom images hhave different bounding boxes
    if (img.name === 'top') {
      // Keep image within stage bounds
      if (img.x > 0) img.x = 0;
      if (img.y > 0) img.y = 0;

      if (img.x + imageBounds.width < this.props.builderWidth)
        img.x = -(imageBounds.width - this.props.builderWidth);
      if (
        img.y + imageBounds.height <
        this.props.builderHeight * (this.state.sectionPercent / 100)
      )
        img.y = -(
          imageBounds.height -
          this.props.builderHeight * (this.state.sectionPercent / 100)
        );
    } else {
      if (img.x > 0) img.x = 0;
      if (img.y > 0 + BUILDER_HEIGHT * (this.state.sectionPercent / 100))
        img.y = 0 + BUILDER_HEIGHT * (this.state.sectionPercent / 100);

      if (img.x + imageBounds.width < this.props.builderWidth)
        img.x = -(imageBounds.width - this.props.builderWidth);
      if (img.y + imageBounds.height < this.props.builderHeight)
        img.y = -(imageBounds.height - this.props.builderHeight);
    }
  };

  handleSave = type => event => {
    event.preventDefault();

    // Generate a filename
    let d = new Date();
    let filename =
      'download-' +
      d.getFullYear() +
      '-' +
      // Months start at 0 for some reason
      ('' + d.getMonth() + 1) +
      '-' +
      d.getDate() +
      '-' +
      // So we get at least 2 digits
      (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) +
      '.' +
      (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) +
      '.' +
      (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()) +
      (type === 'png' ? '.png' : '.jpg');

    // Work out if we want to png or jpeg
    let encoding = type === 'png' ? 'image/png' : 'image/jpeg';

    // Detect if we are on a Microsoft browser or not
    if (browser.name === 'edge' || browser.name === 'ie') {
      this.app.renderer.view.toBlob(blob => {
        console.log(blob);
        window.navigator.msSaveOrOpenBlob(blob, filename);
      }, encoding);
    } else {
      let a = document.createElement('a');
      document.body.appendChild(a);

      // Set the filename to current time
      a.download = filename;
      a.href = this.app.renderer.extract
        .canvas(this.app.stage.view)
        .toDataURL(encoding);
      a.click();
      a.remove();
    }
  };

  handlefileDialog = async imageIndex => {
    let files = await fileDialog();
    this.handleFileInput(files);

    if (imageIndex !== undefined) this.setState({ imageIndex: imageIndex });
  };

  handleFileInput = files => {
    if (files.length !== 1) return alert('Just give me one file please...');

    const file = files[0];
    if (file.type.split('/')[0] !== 'image')
      return alert('Only image files are supported...');

    this.readFile(file);
  };

  readFile = file => {
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
  };

  handleDoubleClick = event => {
    let canvasTop = this.app.renderer.view.offsetTop;
    let canvasLeft = this.app.renderer.view.offsetLeft;
    let clickX = event.clientX;
    let clickY = event.clientY;
    let topOffset = window.pageYOffset;
    let leftOffset = window.pageXOffset;
    let clickCanvasX = clickX - canvasLeft + leftOffset;
    let clickCanvasY = clickY - canvasTop + topOffset;

    let point = new PIXI.Point(clickCanvasX, clickCanvasY);

    let imageIndex = this.semicircle.containsPoint(point) ? 0 : 1;

    this.handlefileDialog(imageIndex);
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <p>Double-click to open image</p>
        <div
          className={styles.composer}
          ref={el => (this.composer = el)}
          onDoubleClick={this.handleDoubleClick}
        />

        <div className={styles.scale}>
          Top scale
          <br />
          <input
            className={styles.slider}
            id="topZoom"
            type="range"
            min="100"
            max={this.props.maxZoom}
            step="1"
            value={this.state.topScale}
            onChange={this.doZoom}
          />
        </div>

        <div className={styles.scale}>
          Bottom scale
          <br />
          <input
            className={styles.slider}
            id="bottomZoom"
            type="range"
            min="100"
            max={this.props.maxZoom}
            step="1"
            value={this.state.bottomScale}
            onChange={this.doZoom}
          />
        </div>
        <p>
          <a
            className={styles.button}
            href="#"
            ref={el => (this.download = el)}
            onClick={this.handleSave('jpg')}
          >
            Download JPG
          </a>
          <a
            className={styles.button}
            href="#"
            ref={el => (this.download = el)}
            onClick={this.handleSave('png')}
          >
            Download PNG
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

TwoDiagonal.defaultProps = {
  direction: 'left',
  builderWidth: BUILDER_WIDTH,
  builderHeight: BUILDER_HEIGHT,
  maxZoom: 250
};
