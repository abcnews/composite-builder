import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';
import fileDialog from 'file-dialog';
const { detect } = require('detect-browser');
const browser = detect();

import AspectSelect from '../AspectSelect';

import { removeHash } from '../../helpers';

let that; // Later used to access class in drag events

export default class TwoVertical extends React.Component {
  state = {
    width: this.props.builderWidth,
    height: this.props.builderHeight,
    imageIndex: 0,
    topScale: 100,
    bottomScale: 100,
    sectionPercentY: 50
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
    that = this; // To access this in dPIXI drag events

    // Set up the sprite images
    const numberOfImages = 2;
    for (let i = 0; i < numberOfImages; i++) {
      this.images[i] = new PIXI.Sprite(PIXI.Texture.EMPTY);
    }

    this.app.renderer.autoResize = true;
    this.app.renderer.resize(this.state.width, this.state.height); // Default: 800 x 600
    this.composer.appendChild(this.app.view); // Attach PIXI app
    this.composer.style.width = this.state.width + 'px'; // Wrap container tightly
    this.app.stage.addChild(this.images[1]);

    // Use a placeholder for image 0
    this.maskPlaceholder.beginFill(0xcccccc);
    this.maskPlaceholder.lineStyle(0, 0xffd900, 1);
    this.maskPlaceholder.arc(
      0,
      0,
      Math.hypot(this.state.width, this.state.height),
      0,
      Math.PI
    ); // cx, cy, radius, startAngle, endAngle
    this.maskPlaceholder.x = this.state.width / 2;
    this.maskPlaceholder.y =
      this.state.height * (this.state.sectionPercentY / 100);
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

    this.images[0].baseY = 0;
    this.images[1].baseY =
      this.state.height * (this.state.sectionPercentY / 100);

    // Let's try a semi circle
    this.semicircle.beginFill(0xff0000);
    this.semicircle.lineStyle(4, 0xffd900, 1);
    this.semicircle.arc(
      0,
      0,
      Math.hypot(this.state.width, this.state.height),
      0,
      Math.PI
    ); // cx, cy, radius, startAngle, endAngle
    this.semicircle.x = this.state.width / 2;
    this.semicircle.y = this.state.height * (this.state.sectionPercentY / 100);
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

    const topPanelHeight =
      this.state.height * (this.state.sectionPercentY / 100);
    const bottomPanelHeight =
      this.state.height * (1 - this.state.sectionPercentY / 100);

    const panelHeight =
      this.state.imageIndex === 0
        ? this.state.height * (this.state.sectionPercentY / 100)
        : this.state.height * (1 - this.state.sectionPercentY / 100);

    const panelRatio =
      this.state.width /
      (this.state.imageIndex === 0 ? topPanelHeight : bottomPanelHeight);

    const widthRatio = this.state.width / width;
    const heightRatio = panelHeight / height;

    // Scale image so it fits on stage
    if (textureRatio > panelRatio) {
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
    this.images[this.state.imageIndex].y = this.images[
      this.state.imageIndex
    ].baseY;

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

        if (imageBounds.x + imageBounds.width < that.state.width)
          this.x = -(imageBounds.width - that.state.width);
        if (
          imageBounds.y + imageBounds.height <
          that.state.height * (that.state.sectionPercentY / 100)
        )
          this.y = -(
            imageBounds.height -
            that.state.height * (that.state.sectionPercentY / 100)
          );
      } else {
        if (this.x > 0) this.x = 0;
        if (this.y > 0 + that.state.height * (that.state.sectionPercentY / 100))
          this.y = 0 + that.state.height * (that.state.sectionPercentY / 100);

        if (imageBounds.x + imageBounds.width < that.state.width)
          this.x = -(imageBounds.width - that.state.width);
        if (imageBounds.y + imageBounds.height < that.state.height)
          this.y = -(imageBounds.height - that.state.height);
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

      if (img.x + imageBounds.width < this.state.width)
        img.x = -(imageBounds.width - this.state.width);
      if (
        img.y + imageBounds.height <
        this.state.height * (this.state.sectionPercentY / 100)
      )
        img.y = -(
          imageBounds.height -
          this.state.height * (this.state.sectionPercentY / 100)
        );
    } else {
      if (img.x > 0) img.x = 0;
      if (img.y > 0 + this.state.height * (this.state.sectionPercentY / 100))
        img.y = 0 + this.state.height * (this.state.sectionPercentY / 100);

      if (img.x + imageBounds.width < this.state.width)
        img.x = -(imageBounds.width - this.state.width);
      if (img.y + imageBounds.height < this.state.height)
        img.y = -(imageBounds.height - this.state.height);
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
    event.preventDefault();

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

  aspectSelect = async event => {
    const ratio = event.target.id;

    switch (ratio) {
      case '4x3':
        await this.setState({ width: 800, height: 600 });
        break;
      case '3x2':
        await this.setState({ width: 870, height: 580 });
        break;
      case '1x1':
        await this.setState({ width: 700, height: 700 });
        break;
      case '16x9':
        await this.setState({ width: 960, height: 540 });
        break;
      case 'swap':
        await this.setState(prevState => {
          return { width: prevState.height, height: prevState.width };
        });
    }

    this.app.renderer.resize(this.state.width, this.state.height);
    this.composer.style.width = this.state.width + 'px'; // Wrap container tightly

    // Reset bottom image base
    this.images[1].baseY =
      this.state.height * (this.state.sectionPercentY / 100);

    this.maskPlaceholder.y =
      this.state.height * (this.state.sectionPercentY / 100);
    this.maskPlaceholder.x = this.state.width / 2;
    this.maskPlaceholder.width = Math.hypot(
      this.state.width,
      this.state.height
    );
    this.maskPlaceholder.height = Math.hypot(
      this.state.width,
      this.state.height
    );

    this.semicircle.y = this.state.height * (this.state.sectionPercentY / 100);
    this.semicircle.x = this.state.width / 2;
    this.semicircle.width = Math.hypot(this.state.width, this.state.height);
    this.semicircle.height = Math.hypot(this.state.width, this.state.height);

    this.images.forEach(image => {
      this.rescaleImage(image);
      this.reboundImage(image);
    });
  };

  sectionUp = async () => {
    await this.setState(prevState => {
      if (prevState.sectionPercentY === 50) return { sectionPercentY: 100 / 3 };
      if (prevState.sectionPercentY < 50)
        return { sectionPercentY: prevState.sectionPercentY };
      if (prevState.sectionPercentY > 50) return { sectionPercentY: 50 };
    });
    this.redrawPanels();
  };

  sectionDown = async () => {
    await this.setState(prevState => {
      if (prevState.sectionPercentY === 50)
        return { sectionPercentY: 100 - 100 / 3 };
      if (prevState.sectionPercentY > 50)
        return { sectionPercentY: prevState.sectionPercentY };
      if (prevState.sectionPercentY < 50) return { sectionPercentY: 50 };
    });
    this.redrawPanels();
  };

  redrawPanels = () => {
    this.images[1].baseY =
      this.state.height * (this.state.sectionPercentY / 100);

    this.maskPlaceholder.y =
      this.state.height * (this.state.sectionPercentY / 100);

    this.semicircle.y = this.state.height * (this.state.sectionPercentY / 100);

    this.images.forEach(image => {
      this.rescaleImage(image);
      this.reboundImage(image);
    });
  };

  rescaleImage = image => {
    const { width, height } = image.texture.orig;

    // Dont process if no image loaded
    if (width < 2 && height < 2) return;

    const textureRatio = width / height;

    const topPanelHeight =
      this.state.height * (this.state.sectionPercentY / 100);
    const bottomPanelHeight =
      this.state.height * (1 - this.state.sectionPercentY / 100);

    const panelHeight =
      image.name === 'top' ? topPanelHeight : bottomPanelHeight;

    const panelRatio =
      this.state.width /
      (image.name === 'top' ? topPanelHeight : bottomPanelHeight);

    const widthRatio = this.state.width / width;
    const heightRatio = panelHeight / height;

    // Scale image so it fits on stage
    if (textureRatio > panelRatio) {
      image.scale.set(heightRatio, heightRatio);
      image.minScale = heightRatio;
    } else {
      image.scale.set(widthRatio, widthRatio);
      image.minScale = widthRatio;
    }
  };

  reboundImage = image => {
    let imageBounds = image.getBounds();

    // Dont process if no image loaded
    if (imageBounds.width < 2 && imageBounds.height < 2) return;

    // Top and bottom images hhave different bounding boxes
    if (image.name === 'top') {
      // Keep image within stage bounds
      if (image.x > 0) image.x = 0;
      if (image.y > 0) image.y = 0;

      if (image.x + imageBounds.width < this.state.width)
        image.x = -(imageBounds.width - this.state.width);
      if (
        image.y + imageBounds.height <
        this.state.height * (this.state.sectionPercentY / 100)
      )
        image.y = -(
          imageBounds.height -
          this.state.height * (this.state.sectionPercentY / 100)
        );
    } else {
      if (image.x > 0) image.x = 0;
      if (image.y > 0 + this.state.height * (this.state.sectionPercentY / 100))
        image.y = 0 + this.state.height * (this.state.sectionPercentY / 100);

      if (image.x + imageBounds.width < this.state.width)
        image.x = -(imageBounds.width - this.state.width);
      if (image.y + imageBounds.height < this.state.height)
        image.y = -(imageBounds.height - this.state.height);
    }
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <AspectSelect handler={this.aspectSelect} />

        <p>Double-click panel to open image</p>

        <div
          className={styles.composer}
          ref={el => (this.composer = el)}
          onDoubleClick={this.handleDoubleClick}
        />

        <div>
          <button onClick={this.sectionUp}>▲</button>
          &nbsp;&nbsp;&nbsp;
          <button onClick={this.sectionDown}>▼</button>
        </div>

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

TwoVertical.defaultProps = {
  builderWidth: 800,
  builderHeight: 600,
  maxZoom: 250
};
