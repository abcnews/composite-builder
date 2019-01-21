import React from 'react';
import renderer from 'react-test-renderer';

import TwoVertical from '.';

describe('TwoVertical', () => {
  test('It renders', () => {
    const component = renderer.create(<TwoVertical />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
