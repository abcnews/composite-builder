// Moving to React
import React from 'react';
import { render } from 'react-dom';
import 'promise-polyfill/src/polyfill';
import "./helpers";

import App from './components/App';

// To enable async/await
import 'regenerator-runtime/runtime.js';

const root = document.querySelector(`[data-composite-builder-root]`);

// Render main App in React
render(<App projectName={'composite-builder'} />, root);
