import React from 'react';
import renderer from 'react-test-renderer';

import AspectSelect from '.';

describe('AspectSelect', () => {
  test('It renders', () => {
    const component = renderer.create(<AspectSelect />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
