import React from 'react';
import renderer from 'react-test-renderer';

import ImageLoader from '.';

describe('ImageLoader', () => {
  test('It renders', () => {
    const component = renderer.create(<ImageLoader />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
