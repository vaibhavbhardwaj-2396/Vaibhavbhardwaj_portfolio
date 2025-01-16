import React from 'react';
import { Navigation } from '../Navigation';
import { ThemeToggle } from '../ThemeToggle';
import { SocialBubbles } from '../SocialBubbles';

export const Header = () => {
  return (
    <>
      <Navigation />
      <ThemeToggle />
      <SocialBubbles />
    </>
  );
};