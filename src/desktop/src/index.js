import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router";
import store from "store";
import Index from "ui/Index";

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
