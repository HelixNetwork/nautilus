import React from "react";
import { render } from "react-dom";
import { I18nextProvider } from 'react-i18next';
import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router";
import i18next from 'libs/i18next';
import store from "store";
import Index from "ui/index";

render(
  <Provider store={store}>
    <I18nextProvider i18n={i18next}>
      <Router>
        <React.Fragment>
          <Index />
        </React.Fragment>
      </Router>
    </I18nextProvider>
  </Provider>,
  document.getElementById("root")
);
