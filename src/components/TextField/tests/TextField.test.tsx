import * as React from 'react';
import {shallow, mount} from 'enzyme';
import TextField from '..';

describe('<TextField />', () => {
  it('sets all pass through properties on the input', () => {
    const pattern = '\\d\\d';
    const input = shallow(
      <TextField
        label="TextField"
        disabled
        readOnly={false}
        autoFocus
        name="TextField"
        placeholder="A placeholder"
        value="Some value"
        min={20}
        max={50}
        minLength={2}
        maxLength={2}
        spellCheck={false}
        pattern={pattern}
      />,
    ).find('input');

    expect(input.prop('disabled')).toBe(true);
    expect(input.prop('readOnly')).toBe(false);
    expect(input.prop('autoFocus')).toBe(true);
    expect(input.prop('name')).toBe('TextField');
    expect(input.prop('placeholder')).toBe('A placeholder');
    expect(input.prop('value')).toBe('Some value');
    expect(input.prop('min')).toBe(20);
    expect(input.prop('max')).toBe(50);
    expect(input.prop('minLength')).toBe(2);
    expect(input.prop('maxLength')).toBe(2);
    expect(input.prop('spellCheck')).toBe(false);
    expect(input.prop('pattern')).toBe(pattern);
  });

  describe('onChange()', () => {
    it('is called with the new value', () => {
      const spy = jest.fn();
      const element = mount(<TextField label="TextField" onChange={spy} />);
      (element.find('input') as any).node.value = 'two';
      element.find('input').simulate('change');
      expect(spy).toHaveBeenCalledWith('two');
    });
  });

  describe('onFocus()', () => {
    it('is called when the input is focused', () => {
      const spy = jest.fn();
      shallow(<TextField label="TextField" onFocus={spy} />).find('input').simulate('focus');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onBlur()', () => {
    it('is called when the input is blurred', () => {
      const spy = jest.fn();
      const element = shallow(<TextField label="TextField" onBlur={spy} />);
      element.find('input').simulate('focus').simulate('blur');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('id', () => {
    it('sets the id on the input', () => {
      const id = shallow(<TextField label="TextField" id="MyField" />).find('input').prop('id');
      expect(id).toBe('MyField');
    });

    it('sets a random id on the input when none is passed', () => {
      const id = shallow(<TextField label="TextField" />).find('input').prop('id');
      expect(typeof id).toBe('string');
      expect(id).toBeTruthy();
    });
  });

  describe('autoComplete', () => {
    it('defaults to no autoComplete attribute', () => {
      const textField = shallow(<TextField label="TextField" />);
      expect(textField.find('input').prop('autoComplete')).toBeUndefined();
    });

    it('sets autoComplete to "off" when false', () => {
      const textField = shallow(<TextField label="TextField" autoComplete={false} />);
      expect(textField.find('input').prop('autoComplete')).toBe('off');
    });

    it('sets autoComplete to "on" when false', () => {
      const textField = shallow(<TextField label="TextField" autoComplete />);
      expect(textField.find('input').prop('autoComplete')).toBe('on');
    });
  });

  describe('helpText', () => {
    it('connects the input to the help text', () => {
      const textField = mount(<TextField label="TextField" helpText="Some help" />);
      const helpTextID = textField.find('input').prop<string>('aria-describedby');
      expect(typeof helpTextID).toBe('string');
      expect(textField.find(`#${helpTextID}`).text()).toBe('Some help');
    });
  });

  describe('prefix', () => {
    it('connects the input to the prefix and label', () => {
      const textField = mount(<TextField label="TextField" prefix="$" />);
      const labels = textField.find('input').prop<string>('aria-labelledby').split(' ');
      expect(labels.length).toBe(2);
      expect(textField.find(`#${labels[0]}`).text()).toBe('TextField');
      expect(textField.find(`#${labels[1]}`).text()).toBe('$');
    });

    it('connects the input to the prefix, suffix, and label', () => {
      const textField = mount(<TextField label="TextField" prefix="$" suffix=".00" />);
      const labels = textField.find('input').prop<string>('aria-labelledby').split(' ');
      expect(labels.length).toBe(3);
      expect(textField.find(`#${labels[0]}`).text()).toBe('TextField');
      expect(textField.find(`#${labels[1]}`).text()).toBe('$');
      expect(textField.find(`#${labels[2]}`).text()).toBe('.00');
    });
  });

  describe('suffix', () => {
    it('connects the input to the suffix and label', () => {
      const textField = mount(<TextField label="TextField" suffix="kg" />);
      const labels = textField.find('input').prop<string>('aria-labelledby').split(' ');
      expect(labels.length).toBe(2);
      expect(textField.find(`#${labels[0]}`).text()).toBe('TextField');
      expect(textField.find(`#${labels[1]}`).text()).toBe('kg');
    });
  });

  describe('type', () => {
    it('sets the type on the input', () => {
      const type = shallow(<TextField label="TextField" type="email" />).find('input').prop('type');
      expect(type).toBe('email');
    });

    describe('number', () => {
      it('adds an increment button that increases the value', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" value="3" onChange={spy} />);
        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenCalledWith('4');
      });

      it('adds a decrement button that increases the value', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" value="3" onChange={spy} />);
        element.find('[role="button"]').last().simulate('click');
        expect(spy).toHaveBeenCalledWith('2');
      });

      it('handles incrementing from no value', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" onChange={spy} />);
        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenCalledWith('1');
      });

      it('uses the step prop when incrementing', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" step={0.5} value="1.25" onChange={spy} />);
        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenCalledWith('1.75');
      });

      it('respects a min value', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" min={2} value="2" onChange={spy} />);

        element.find('[role="button"]').last().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('2');

        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('3');
      });

      it('respects a max value', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" max={2} value="2" onChange={spy} />);

        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('2');

        element.find('[role="button"]').last().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('1');
      });

      it('brings an invalid value up to the min', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" min={2} value="-1" onChange={spy} />);

        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('2');

        element.find('[role="button"]').last().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('2');
      });

      it('brings an invalid value down to the max', () => {
        const spy = jest.fn();
        const element = mount(<TextField label="TextField" type="number" max={2} value="12" onChange={spy} />);

        element.find('[role="button"]').first().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('2');

        element.find('[role="button"]').last().simulate('click');
        expect(spy).toHaveBeenLastCalledWith('2');
      });
    });
  });
});