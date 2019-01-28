import React from 'react';
import renderer from 'react-test-renderer';

import TwoHorizontal from '.';

describe('TwoHorizontal', () => {
  test('It renders', () => {
    const component = renderer.create(<TwoHorizontal />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
