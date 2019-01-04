const React = require('react');
const renderer = require('react-test-renderer');

const App = require('.');

describe('App', () => {
  test('It renders', () => {
    const component = renderer.create(<App />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
