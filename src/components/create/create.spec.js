import React from 'react';
import 'jest-styled-components';
import { shallow } from 'enzyme';
import TestRenderer from 'react-test-renderer';
import Create from './create.component';
import classicTheme from '../../style/themes/classic';
import CreateClassicStyle from './create-classic.style';
import CreateStyle from './create.style';

function render(props) {
  return shallow(<Create { ...props }> Create component </Create>);
}

describe('Create', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render({});
  });

  it('should render correctly', () => {
    expect(TestRenderer.create(<CreateStyle />)).toMatchSnapshot();
  });

  it('should render correct', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('when classic style has been provided', () => {
    it('should apply custom styling ', () => {
      wrapper.setProps({ theme: 'classic' });

      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when `custom class` is privded', () => {
    it('component should contain correct className', () => {
      wrapper.setProps({ className: 'custom-class' });

      expect(wrapper.hasClass('custom-class')).toBeTruthy();
    });
  });
});

describe('Create classic', () => {
  expect(shallow(<CreateClassicStyle theme={ classicTheme } />)).toMatchSnapshot();
});
