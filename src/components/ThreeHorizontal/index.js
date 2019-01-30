import React from 'react';
import styles from './styles.scss';
import * as PIXI from 'pixi.js';
import fileDialog from 'file-dialog';
const { detect } = require('detect-browser');
const browser = detect();

const SLIDER_WIDTH = 5;

import AspectSelect from '../AspectSelect';

import { removeHash, roundNumber } from '../../helpers';

let that; // Later used to access class in drag events

export default class ThreeHorizontal extends React.Component {
  state = {
    width: this.props.builderWidth,
    height: this.props.builderHeight,
    imageIndex: 0,
    image1Scale: 100,
    image2Scale: 100,
    image3Scale: 100,
    sectionPercentX: 50,
    section1: 1 / 3,
    section2: 2 / 3,
    panel1: [
      0,
      0,
      Math.round(this.props.builderWidth / 3),
      this.props.builderHeight
    ],
    panel2: [
      Math.round(this.props.builderWidth / 3),
      0,
      Math.round(this.props.builderWidth * (2 / 3)),
      this.props.builderHeight
    ],
    panel3: [
      Math.round(this.props.builderWidth * (2 / 3)),
      0,
      this.props.builderWidth,
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

  // semicircle = new PIXI.Graphics();
  // maskPlaceholder = new PIXI.Graphics();
  slider = new PIXI.Graphics();

  componentDidMount() {
    that = this; // To access this in PIXI drag events

    // Set up the sprite images
    const numberOfImages = 3;
    for (let i = 0; i < numberOfImages; i++) {
      this.images[i] = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.panels[i] = new PIXI.Graphics();
    }

    this.app.renderer.autoResize = true;
    this.app.renderer.resize(this.state.width, this.state.height); // Default: 800 x 600
    this.composer.appendChild(this.app.view); // Attach PIXI app
    this.composer.style.width = this.state.width + 'px'; // Wrap container tightly

    // Add images to stage
    this.app.stage.addChild(this.images[0]);
    this.app.stage.addChild(this.images[1]);
    this.app.stage.addChild(this.images[2]);

    // Enable iamge dragging
    this.draggify(this.images[0]);
    this.draggify(this.images[1]);
    this.draggify(this.images[2]);

    // Name images to check later for dragging and zoom bounds
    this.images[0].name = 'image1';
    this.images[1].name = 'image2';
    this.images[2].name = 'image3';

    // Tint images temporarily so we can tell them apart
    this.images[0].x = this.state.panel1[0];
    this.images[0].y = this.state.panel1[1];
    this.images[0].width = this.state.panel1[2] - this.state.panel1[0];
    this.images[0].height = this.state.panel1[3] - this.state.panel1[1];
    this.images[0].tint = 0xdcdcdc;

    this.images[1].x = this.state.panel2[0];
    this.images[1].y = this.state.panel2[1];
    this.images[1].width = this.state.panel2[2] - this.state.panel2[0];
    this.images[1].height = this.state.panel2[3] - this.state.panel2[1];
    this.images[1].tint = 0xc0c0c0;

    this.images[2].x = this.state.panel3[0];
    this.images[2].y = this.state.panel3[1];
    this.images[2].width = this.state.panel3[2] - this.state.panel3[0];
    this.images[2].height = this.state.panel3[3] - this.state.panel3[1];
    this.images[2].tint = 0xa9a9a9;

    // Add panels for masking
    this.panels[0].beginFill(0x111111);
    this.panels[1].beginFill(0x111111);
    this.panels[2].beginFill(0x111111);

    // Use initial state to construct the panels
    this.panels[0].drawRect(...this.state.panel1);
    this.panels[1].drawRect(...this.state.panel1);
    this.panels[2].drawRect(...this.state.panel1);

    // Offset initial panels instead of drawing them offsetted (is that a word?)
    this.panels[1].x = Math.round(this.state.width * this.state.section1);
    this.panels[2].x = Math.round(this.state.width * this.state.section2);

    // Add panels to stage
    this.panels.forEach(panel => {
      this.app.stage.addChild(panel);
    });

    // Apply panel masks
    this.images.forEach((image, i) => {
      image.mask = this.panels[i];
    });

    // Use a placeholder for image 0
    // this.maskPlaceholder.beginFill(0xcccccc);
    // this.maskPlaceholder.lineStyle(0, 0xffd900, 1);
    // this.maskPlaceholder.arc(
    //   0,
    //   0,
    //   Math.hypot(this.state.width, this.state.height),
    //   0,
    //   Math.PI
    // ); // cx, cy, radius, startAngle, endAngle
    // this.maskPlaceholder.x =
    //   this.state.width * (this.state.sectionPercentX / 100);
    // this.maskPlaceholder.y = this.state.height / 2;
    // this.maskPlaceholder.rotation = Math.PI / 2;

    // Add the placeholder
    // this.app.stage.addChild(this.maskPlaceholder);

    // this.images[0].baseX = 0;
    // this.images[1].baseX =
    //   this.state.width * (this.state.sectionPercentX / 100);

    // // Let's try a semi circle
    // this.semicircle.beginFill(0xff0000);
    // this.semicircle.lineStyle(4, 0xffd900, 1);
    // this.semicircle.arc(
    //   0,
    //   0,
    //   Math.hypot(this.state.width, this.state.height),
    //   0,
    //   Math.PI
    // ); // cx, cy, radius, startAngle, endAngle
    // this.semicircle.x = this.state.width * (this.state.sectionPercentX / 100);
    // this.semicircle.y = this.state.height / 2;
    // this.semicircle.rotation = Math.PI / 2; // Vertical

    // // Add to stage and then mask first image
    // this.app.stage.addChild(this.semicircle);
    // this.images[0].mask = this.semicircle;

    // Create a slider to control the section
    // set a fill and a line style again and draw a rectangle
    // this.slider.lineStyle(0, 0x0000ff, 1);
    // this.slider.beginFill(0xff700b, 0.0);
    // this.slider.drawRect(0, 0, SLIDER_WIDTH * 2, this.state.height);
    // this.slider.x = this.state.width / 2 - SLIDER_WIDTH;
    // this.slider.y = 0;

    // this.app.stage.addChild(this.slider);

    // this.sliderInit(this.slider);
  }

  componentDidUpdate() {}

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
    // Reset our sliders to zero
    if (this.state.imageIndex === 0) this.setState({ leftScale: 100 });
    else if (this.state.imageIndex === 1) this.setState({ rightScale: 100 });

    // Reposition image up top
    // this.images[this.state.imageIndex].x = this.images[
    //   this.state.imageIndex
    // ].baseX;
    // this.images[this.state.imageIndex].y = 0;

    // Load the texture into the sprite
    this.images[this.state.imageIndex].texture = texture;

    this.rescaleImage(this.images[this.state.imageIndex]);
    this.reZoom(this.images[this.state.imageIndex]);
    this.reboundImage(this.images[this.state.imageIndex]);

    // Remove initial tint
    this.images[this.state.imageIndex].tint = 0xffffff;

    // Start the animation loop
    // this.app.ticker.add(delta => this.animationLoop(delta));
  };

  // Use this if we require PIXI animations
  // animationLoop = delta => {};

  // Pass a sprite to this to enable dragging
  draggify = object => {
    object.interactive = true;
    object.buttonMode = true;
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
    }
  }

  onDragMove() {
    if (this.tint !== 0xffffff) return;

    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragPoint.x;
      this.y = newPosition.y - this.dragPoint.y;

      that.reboundImage(this);
    }
  }

  sliderInit = object => {
    object.interactive = true;
    object.cursor = 'ew-resize';

    object
      .on('mousedown', this.onSliderDragStart)
      .on('touchstart', this.onSliderDragStart)
      .on('mouseup', this.onSliderDragEnd)
      .on('mouseupoutside', this.onSliderDragEnd)
      .on('touchend', this.onSliderDragEnd)
      .on('touchendoutside', this.onSliderDragEnd)
      .on('mousemove', this.onSliderDragMove)
      .on('touchmove', this.onSliderDragMove);
  };

  onSliderDragStart(event) {
    if (!this.dragging) {
      this.data = event.data;
      this.oldGroup = this.parentGroup;
      this.dragging = true;

      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

  onSliderDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.parentGroup = this.oldGroup;

      // set the interaction data to null
      this.data = null;
    }
  }

  onSliderDragMove = async function() {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragPoint.x;
      // this.y = newPosition.y - this.dragPoint.y;

      // Keep within sensible bounds
      if (this.x < 0 - SLIDER_WIDTH) this.x = 0 - SLIDER_WIDTH;
      if (this.x > that.state.width - SLIDER_WIDTH)
        this.x = that.state.width - SLIDER_WIDTH;

      let newPercentageX = ((this.x + SLIDER_WIDTH) / that.state.width) * 100;
      that.setState({ sectionPercentX: newPercentageX });

      that.redrawPanels();
    }
  };

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

    // Reset bottom image base
    // this.images[1].baseX =
    //   this.state.width * (this.state.sectionPercentX / 100);

    // this.maskPlaceholder.y = this.state.height / 2;
    // this.maskPlaceholder.x =
    //   this.state.width * (this.state.sectionPercentX / 100);
    // this.maskPlaceholder.width = Math.hypot(
    //   this.state.width,
    //   this.state.height
    // );
    // this.maskPlaceholder.height = Math.hypot(
    //   this.state.width,
    //   this.state.height
    // );

    // this.semicircle.y = this.state.height / 2;
    // this.semicircle.x = this.state.width * (this.state.sectionPercentX / 100);
    // this.semicircle.width = Math.hypot(this.state.width, this.state.height);
    // this.semicircle.height = Math.hypot(this.state.width, this.state.height);

    this.images.forEach(image => {
      this.rescaleImage(image);
      this.reboundImage(image);
    });

    // Realign the slider
    // this.slider.height = this.state.height;
    // this.slider.x =
    //   this.state.width * (this.state.sectionPercentX / 100) - SLIDER_WIDTH;
  };

  setSectionPercent = async percent => {
    await this.setState({ sectionPercentX: percent });

    this.slider.x =
      this.state.width * (this.state.sectionPercentX / 100) - SLIDER_WIDTH;

    this.redrawPanels();
  };

  redrawPanels = () => {
    // this.images[1].baseX =
    //   this.state.width * (this.state.sectionPercentX / 100);

    // this.maskPlaceholder.x =
    //   this.state.width * (this.state.sectionPercentX / 100);

    // this.semicircle.x = this.state.width * (this.state.sectionPercentX / 100);

    this.images.forEach(image => {
      this.rescaleImage(image);
      this.reboundImage(image);
    });
  };

  rescaleImage = image => {
    const { width, height } = image.texture.orig;

    // Dont process if no image loaded
    // if (width < 2 && height < 2) return;
    // if (image.tint !== 0xFFFFFF) return;

    const textureRatio = width / height;

    // const leftPanelWidth =
    //   this.state.width * (this.state.sectionPercentX / 100);
    // const rightPanelWidth =
    //   this.state.width * (1 - this.state.sectionPercentX / 100);

    // const panelWidth = image.name === 'left' ? leftPanelWidth : rightPanelWidth;

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

    // Reset sliders
    this.setState({ leftScale: 100 });
    this.setState({ rightScale: 100 });
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
  };

  render() {
    return (
      <div className={styles.wrapper}>
        {/* <AspectSelect handler={this.aspectSelect} /> */}

        <p>Double-click panel (or drag and drop) to open image</p>

        {/* <button
          onClick={() => {
            this.handlefileDialog(0);
          }}
        >
          Image 1
        </button>

        <button
          onClick={() => {
            this.handlefileDialog(1);
          }}
        >
          Image 2
        </button>

        <button
          onClick={() => {
            this.handlefileDialog(2);
          }}
        >
          Image 3
        </button> */}

        <div
          className={styles.composer}
          ref={el => (this.composer = el)}
          onDoubleClick={this.handleDoubleClick}
          onDrop={this.handleDrop}
          onDragOver={this.handleDragOver}
        />

        {/* <div>
          <p className={styles.label}>
            Section position {roundNumber(this.state.sectionPercentX, 0)}%
          </p>

          <button
            onClick={() => {
              this.setSectionPercent(100 / 3);
            }}
          >
            33.3%
          </button>
          <button
            onClick={() => {
              this.setSectionPercent(50);
            }}
          >
            50%
          </button>
          <button
            onClick={() => {
              this.setSectionPercent(100 - 100 / 3);
            }}
          >
            66.6%
          </button>
        </div> */}

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

ThreeHorizontal.defaultProps = {
  builderWidth: 800,
  builderHeight: 600,
  maxZoom: 250
};
