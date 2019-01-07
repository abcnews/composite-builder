const React = require('react');
const renderer = require('react-test-renderer');

const LayoutSelect = require('.');

describe('LayoutSelect', () => {
  test('It renders', () => {
    const component = renderer.create(<LayoutSelect />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
