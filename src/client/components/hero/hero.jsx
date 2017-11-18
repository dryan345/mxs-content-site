import React from 'react';
import cssModules from 'react-css-modules';
import FontAwesome from 'react-fontawesome';

import LandingNavbar from 'components/landing-navbar';

import styles from './hero.css';

const Hero = () => (
  <div styleName="wrapper">
    <LandingNavbar />
    <div styleName="container">
      <h2 styleName="slogan">Create. Upload. <span styleName="red">Share.</span></h2>
    </div>
    <div>
      <FontAwesome name="fa-angle-double-down" />
    </div>
  </div>
);

export default cssModules(Hero, styles, { allowMultiple: true });
