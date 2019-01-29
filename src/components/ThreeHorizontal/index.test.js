import React from 'react';
import renderer from 'react-test-renderer';

import ThreeHorizontal from '.';

describe('ThreeHorizontal', () => {
  test('It renders', () => {
    const component = renderer.create(<ThreeHorizontal />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
