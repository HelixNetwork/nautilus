import React from "react";
import { render } from "react-dom";
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import assign from 'lodash/assign';
import { I18nextProvider } from 'react-i18next';
import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router";
import i18next from 'libs/i18next';
import store from "store";
import Index from "ui/index";
import { getEncryptionKey } from 'utils/realm';
import { initialise as initialiseStorage, realm } from 'database';
import { assignAccountIndexIfNecessary } from 'actions/accounts';
import { mapStorageToState as mapStorageToStateAction } from 'actions/wallet';
import { mapStorageToState } from 'libs/mapStorageToState';
import Alerts from 'ui/global/alert';
import { changeHelixNode, quorum } from 'libs/hlx';

const init = () => {
  const modalElement = document.createElement('div');
  modalElement.id = 'modal';
  document.body.appendChild(modalElement);
  if (Electron.mode === 'tray') {

  } else {
    initialiseStorage(getEncryptionKey)
      .then(() => {

        const oldPersistedData = Electron.getAllStorage();
        const hasDataToMigrate = !isEmpty(oldPersistedData);

        if (hasDataToMigrate) {
          Object.assign(oldPersistedData.settings, {
            completedMigration: false,
          });
        }

        // Get persisted data from Realm storage
        const persistedDataFromRealm = mapStorageToState();
        const data = hasDataToMigrate ? oldPersistedData : persistedDataFromRealm;
        const node = get(data, 'settings.node');

        changeHelixNode(assign({}, node, { provider: node.url }));

        // Set quorum size
        quorum.setSize(get(data, 'settings.quorum.size'));
        // Update store with persisted state
        store.dispatch(mapStorageToStateAction(data));

        // Assign accountIndex to every account in accountInfo if it is not assigned already
        store.dispatch(assignAccountIndexIfNecessary(get(data, 'accounts.accountInfo')));

        // Show Wallet window after inital store update
        Electron.focus();
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err));
  }
  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>
        <Router>
          <React.Fragment>
            <Alerts />
            <Index />
          </React.Fragment>
        </Router>
      </I18nextProvider>
    </Provider>,
    document.getElementById("root")
  );
}
init();