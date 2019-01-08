const React = require('react');
const renderer = require('react-test-renderer');

const TwoDiagonal = require('.');

describe('TwoDiagonal', () => {
  test('It renders', () => {
    const component = renderer.create(<TwoDiagonal />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
