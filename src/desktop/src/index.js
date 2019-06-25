import React from "react";
import { render } from "react-dom";
import isEmpty from 'lodash/isEmpty';
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

if (Electron.mode === 'tray') {

} else {
  initialiseStorage(getEncryptionKey)
    .then(() => {
      
      const oldPersistedData = Electron.getAllStorage();
      const hasDataToMigrate = !isEmpty(oldPersistedData);
      console.log("migrate",hasDataToMigrate);
      if (hasDataToMigrate) {
        Object.assign(oldPersistedData.settings, {
          completedMigration: false,
        });
      }

      // Get persisted data from Realm storage
      const persistedDataFromRealm = mapStorageToState();
      const data = hasDataToMigrate ? oldPersistedData : persistedDataFromRealm;

      // Change provider on global iota instance
      const node = get(data, 'settings.node');
      changeIotaNode(node);

      // Update store with persisted state
      store.dispatch(mapStorageToStateAction(data));

      // Assign accountIndex to every account in accountInfo if it is not assigned already
      store.dispatch(assignAccountIndexIfNecessary(get(data, 'accounts.accountInfo')));

      // Proxy realm changes to Tray application
      realm.addListener('change', () => {
        const data = mapStorageToState();
        Electron.storeUpdate(JSON.stringify(data));
      });

      // Start Tray application if enabled in settings
      const isTrayEnabled = get(data, 'settings.isTrayEnabled');
      Electron.setTray(isTrayEnabled);

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
          <Index />
        </React.Fragment>
      </Router>
    </I18nextProvider>
  </Provider>,
  document.getElementById("root")
);
