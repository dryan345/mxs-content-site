// eslint-disable-file
import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import FontAwesome from 'react-fontawesome';

import styles from './field-wrapper.scss';

const FieldWrapper = props => (
  <div styleName="field">
    <label htmlFor={props.labelFor} styleName="label">
      <FontAwesome name={props.label} styleName="icon" />
    </label>
    {props.children}
  </div>
);

FieldWrapper.propTypes = {
  label: PropTypes.string.isRequired,
  labelFor: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default cssModules(FieldWrapper, styles);
