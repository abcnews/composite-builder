const React = require('react');
const renderer = require('react-test-renderer');

const TwoImage = require('.');

describe('TwoImage', () => {
  test('It renders', () => {
    const component = renderer.create(<TwoImage />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
