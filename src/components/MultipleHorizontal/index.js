import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';
import fileDialog from 'file-dialog';
const { detect } = require('detect-browser');
const browser = detect();

import AspectSelect from '../AspectSelect';

import { removeHash, roundNumber } from '../../helpers';

let that; // Later used to access class in drag events

/**
 * Currently supports @props panelCount={3} (or 4)
 * TODO: extend support for 2
 */
export default class MultipleHorizontal extends React.Component {
  state = {
    width: this.props.builderWidth,
    height: this.props.builderHeight,
    imageIndex: 0,
    image1Scale: 100,
    image2Scale: 100,
    image3Scale: 100,
    image4Scale: 100,
    sectionPercentX: 50,
    section1: (function(panelCount) {
      return 1 / panelCount;
    })(this.props.panelCount),
    section2: (function(panelCount) {
      return 2 / panelCount;
    })(this.props.panelCount),
    section3: (function(panelCount) {
      return 3 / panelCount;
    })(this.props.panelCount),
    panel1: [
      0,
      0,
      Math.round(this.props.builderWidth / this.props.panelCount),
      this.props.builderHeight
    ],
    panel2: [
      Math.round(this.props.builderWidth / this.props.panelCount),
      0,
      Math.round(this.props.builderWidth * (2 / this.props.panelCount)),
      this.props.builderHeight
    ],
    panel3: [
      Math.round(this.props.builderWidth * (2 / this.props.panelCount)),
      0,
      Math.round(this.props.builderWidth * (3 / this.props.panelCount)),
      this.props.builderHeight
    ],
    panel4: [
      Math.round(this.props.builderWidth * (3 / this.props.panelCount)),
      0,
      Math.round(this.props.builderWidth * (4 / this.props.panelCount)),
      this.props.builderHeight
    ]
  };

  app = new PIXI.Application({
    backgroundColor: 0xeeeeee,
    preserveDrawingBuffer: true,
    antialias: true
  });

  images = [];
  panels = [];

  componentDidMount() {
    that = this; // To access this in PIXI drag events

    // Set up the sprite images
    const numberOfImages = this.props.panelCount;
    for (let i = 0; i < numberOfImages; i++) {
      this.images[i] = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.panels[i] = new PIXI.Graphics();
    }

    this.app.renderer.autoResize = true;
    this.app.renderer.resize(this.state.width, this.state.height); // Default: 800 x 600
    this.composer.appendChild(this.app.view); // Attach PIXI app
    this.composer.style.width = this.state.width + 'px'; // Wrap container tightly

    // Add images to stage and 
    // enable iamge dragging
    this.images.forEach(image => {
      this.app.stage.addChild(image);
      this.draggify(image);
    });

    // Name images to check later for dragging and zoom bounds
    this.images[0].name = 'image1';
    this.images[1].name = 'image2';
    this.images[2].name = 'image3';

    // Tint images temporarily so we can tell them apart
    this.images[0].x = this.state.panel1[0];
    this.images[0].y = this.state.panel1[1];
    this.images[0].width = this.state.panel1[2] - this.state.panel1[0];
    this.images[0].height = this.state.panel1[3] - this.state.panel1[1];
    this.images[0].tint = 0xdddddd;

    this.images[1].x = this.state.panel2[0];
    this.images[1].y = this.state.panel2[1];
    this.images[1].width = this.state.panel2[2] - this.state.panel2[0];
    this.images[1].height = this.state.panel2[3] - this.state.panel2[1];
    this.images[1].tint = 0xcccccc; //  0xc0c0c0;

    this.images[2].x = this.state.panel3[0];
    this.images[2].y = this.state.panel3[1];
    this.images[2].width = this.state.panel3[2] - this.state.panel3[0];
    this.images[2].height = this.state.panel3[3] - this.state.panel3[1];
    this.images[2].tint = 0xbbbbbb; // 0xa9a9a9;

    if (this.props.panelCount > 3) {
      this.images[3].x = this.state.panel4[0];
      this.images[3].y = this.state.panel4[1];
      this.images[3].width = this.state.panel4[2] - this.state.panel4[0];
      this.images[3].height = this.state.panel4[3] - this.state.panel4[1];
      this.images[3].tint = 0xaaaaaa; // 0x999999;
    }

    // Add panels for masking
    this.panels.forEach(panel => {
      panel.beginFill(Math.random() * 0xffffff);
      panel.drawRect(...this.state.panel1);
    });

    // Offset initial panels instead of drawing them offsetted (is that a word?)
    this.panels[1].x = Math.round(this.state.width * this.state.section1);
    this.panels[2].x = Math.round(this.state.width * this.state.section2);

    if (this.props.panelCount > 3) {
      this.panels[3].x = Math.round(this.state.width * this.state.section3);
    }

    // Add panels to stage
    this.panels.forEach(panel => {
      this.app.stage.addChild(panel);
    });

    // Apply panel masks
    this.images.forEach((image, i) => {
      image.mask = this.panels[i];
    });
  }

  // Called when an image is loaded
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
    // Load the texture into the sprite
    this.images[this.state.imageIndex].texture = texture;

    this.rescaleImage(this.images[this.state.imageIndex]);
    this.reZoom(this.images[this.state.imageIndex]);
    this.reboundImage(this.images[this.state.imageIndex]);

    // Remove initial tint
    this.images[this.state.imageIndex].tint = 0xffffff;
  };

  // Pass a sprite to this to enable dragging
  draggify = object => {
    object.interactive = true;
    object.cursor = 'pointer';
    object
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

      this.cursor = 'pointer';
    }
  }

  onDragMove() {
    if (this.tint !== 0xffffff) return;

    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragPoint.x;
      this.y = newPosition.y - this.dragPoint.y;

      that.reboundImage(this);

      this.cursor = 'move';
    }
  }

  doZoom = event => {
    let scale = event.target.value / 100;
    let img;

    // Update state so we can zero scale on image reload
    if (event.target.id === 'image1Zoom') {
      img = this.images[0];
      this.setState({ image1Scale: event.target.value });
    } else if (event.target.id === 'image2Zoom') {
      img = this.images[1];
      this.setState({ image2Scale: event.target.value });
    } else if (event.target.id === 'image3Zoom') {
      img = this.images[2];
      this.setState({ image3Scale: event.target.value });
    } else if (event.target.id === 'image4Zoom') {
      img = this.images[3];
      this.setState({ image4Scale: event.target.value });
    }

    // Used to reZoom
    img.lastKnownZoom = event.target.value;

    // Abort if no image loaded
    if (img.tint !== 0xffffff) return;

    img.scale.x = img.minScale * scale; //+ (scale / 100 - 0.01);
    img.scale.y = img.minScale * scale; //+ (scale / 100 - 0.01);

    this.reboundImage(img);
  };

  reZoom = image => {
    let scale = image.lastKnownZoom / 100 || 1;
    image.scale.x = image.minScale * scale;
    image.scale.y = image.minScale * scale;
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

  handleFileDropped = async (files, imageIndex = 0) => {
    if (imageIndex !== undefined)
      await this.setState({ imageIndex: imageIndex });

    this.handleFileInput(files);
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

    const imageIndex = this.getImageIndex(event);

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

    this.panels[1].x = Math.floor(this.state.width * this.state.section1);
    this.panels[2].x = Math.floor(this.state.width * this.state.section2);
    if (this.props.panelCount > 3)
      this.panels[3].x = Math.floor(this.state.width * this.state.section3);

    this.panels.forEach(panel => {
      panel.width = Math.round(this.state.width / this.props.panelCount);
      panel.height = this.state.height;
    });

    this.images.forEach(image => {
      this.rescaleImage(image);
      this.reZoom(image);
      this.reboundImage(image);
    });
  };

  redrawPanels = () => {
    this.images.forEach(image => {
      this.rescaleImage(image);
      this.reboundImage(image);
    });
  };

  rescaleImage = image => {
    const { width, height } = image.texture.orig;
    const textureRatio = width / height;
    const panelWidth = image.mask.width || this.state.width / 3;

    const panelRatio = panelWidth / this.state.height;
    const widthRatio = panelWidth / width;
    const heightRatio = this.state.height / height;

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
    const imageBounds = image.getBounds();
    const panelBounds = image.mask.getBounds();

    if (imageBounds.x > panelBounds.x) image.x = panelBounds.x;
    if (imageBounds.y > panelBounds.y) image.y = panelBounds.y;

    if (imageBounds.x + imageBounds.width < panelBounds.x + panelBounds.width) {
      image.x = -(imageBounds.width - panelBounds.width) + panelBounds.x;
    }

    if (imageBounds.y + imageBounds.height < panelBounds.y + panelBounds.height)
      image.y = -(imageBounds.height - panelBounds.height);
  };

  handleDragOver = event => {
    event.stopPropagation();
    event.preventDefault();
  };

  handleDrop = event => {
    event.stopPropagation();
    event.preventDefault();

    const imageIndex = this.getImageIndex(event);

    const files = event.dataTransfer.files;

    this.handleFileDropped(files, imageIndex);
  };

  // Returns which panel was double clicked on or had a file dropped on
  getImageIndex = event => {
    let canvasTop = this.app.renderer.view.offsetTop;
    let canvasLeft = this.app.renderer.view.offsetLeft;
    let clickX = event.clientX;
    let clickY = event.clientY;
    let topOffset = window.pageYOffset;
    let leftOffset = window.pageXOffset;
    let clickCanvasX = clickX - canvasLeft + leftOffset;
    let clickCanvasY = clickY - canvasTop + topOffset;

    let point = new PIXI.Point(clickCanvasX, clickCanvasY);

    // Use PIXI's containsPoint method to check
    if (this.panels[0].containsPoint(point)) return 0;
    if (this.panels[1].containsPoint(point)) return 1;
    if (this.panels[2].containsPoint(point)) return 2;
    if (this.panels[3].containsPoint(point)) return 3;
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <AspectSelect handler={this.aspectSelect} />

        <p>Double-click panel (or drag and drop) to open image</p>

        <div
          className={styles.composer}
          ref={el => (this.composer = el)}
          onDoubleClick={this.handleDoubleClick}
          onDrop={this.handleDrop}
          onDragOver={this.handleDragOver}
        />

        <div className={styles.scale}>
          <p className={styles.label}>Image 1 scale</p>

          <input
            className={styles.slider}
            id="image1Zoom"
            type="range"
            min="100"
            max={this.props.maxZoom}
            step="1"
            value={this.state.image1Scale}
            onChange={this.doZoom}
          />
        </div>

        <div className={styles.scale}>
          <p className={styles.label}>Image 2 scale</p>

          <input
            className={styles.slider}
            id="image2Zoom"
            type="range"
            min="100"
            max={this.props.maxZoom}
            step="1"
            value={this.state.image2Scale}
            onChange={this.doZoom}
          />
        </div>

        <div className={styles.scale}>
          <p className={styles.label}>Image 3 scale</p>

          <input
            className={styles.slider}
            id="image3Zoom"
            type="range"
            min="100"
            max={this.props.maxZoom}
            step="1"
            value={this.state.image3Scale}
            onChange={this.doZoom}
          />
        </div>

        {this.props.panelCount > 3 && (
          <div className={styles.scale}>
            <p className={styles.label}>Image 4 scale</p>

            <input
              className={styles.slider}
              id="image4Zoom"
              type="range"
              min="100"
              max={this.props.maxZoom}
              step="1"
              value={this.state.image4Scale}
              onChange={this.doZoom}
            />
          </div>
        )}

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

MultipleHorizontal.defaultProps = {
  builderWidth: 800,
  builderHeight: 600,
  maxZoom: 250,
  panelCount: 3
};
