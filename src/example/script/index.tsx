import ReactDOM from 'react-dom';
import React, { ReactElement } from 'react';
import { hot } from 'react-hot-loader/root';

import Example from './react';

const Layouts: () => ReactElement = (): ReactElement => {
  return <Example />;
};

const rootEl: HTMLElement = document.getElementById('app');
rootEl ? ReactDOM.render(<Layouts />, rootEl) : null;

hot(Layouts);
