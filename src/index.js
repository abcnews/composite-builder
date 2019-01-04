// Moving to React
import React from 'react';
import { render } from 'react-dom';

const App = require('./components/App');

const root = document.querySelector(`[data-composite-builder-root]`);

// Render main App in React
render(<App projectName={"composite-builder"} />, root);
