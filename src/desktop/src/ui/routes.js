import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Onboarding from 'ui/views/onboarding/index';
/**
 * Defines components to routes mapping.
 *
 * Everytime a new view is created, entry is required here to map the component to a specific route.
 *
 * [IMPORTANT]
 * All route entries are required to be done before the notFound component.
 *
 * @returns {XML}
 */
export default () => {
    return (
        <Switch>
            <Route path="/onboarding" component={Onboarding} />
        </Switch>
    );
}
