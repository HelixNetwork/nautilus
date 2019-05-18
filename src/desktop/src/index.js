import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router";
import { I18nextProvider } from 'react-i18next';
import i18next from 'libs/i18next';
import store from "store";
import Index from "ui/index";

render(
  <Provider store={store}>
    <Router>
      <React.Fragment>
        <Index />
      </React.Fragment>
    </Router>
  </Provider>,
  document.getElementById("root")
);
