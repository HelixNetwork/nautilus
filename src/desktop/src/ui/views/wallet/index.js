/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Switch, Route } from 'react-router-dom';
import TopBar from './topBar';
import Send from 'ui/views/wallet/send';
import Receive from 'ui/views/wallet/receive';
import Chart from 'ui/views/wallet/chart';
import WalletHistory from 'ui/views/wallet/wallet_history';
import Support from 'ui/views/wallet/support';
import DashSidebar from 'ui/components/dash_sidebar';
import Polling from 'ui/global/polling';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        /**@ignore */
        location: PropTypes.object,
        /**@ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };

    render() {
        const { location, history } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
        if (currentKey === '/') {
            return (
                <div>
                    <TopBar history={history} />
                    <DashSidebar disp={'none'} history={history} active={'send'} />

                    <Switch>
                        <Route path="/wallet/" component={Send} />
                        <Route path="/wallet/send" component={Send} />
                        <Route path="/wallet/receive" component={Receive} />
                        <Route path="/wallet/chart" component={Chart} />
                        <Route path="/wallet/history" component={WalletHistory} />
                        <Route path="/wallet/support" component={Support} />
                    </Switch>
                </div>
            );
        }
        return (
            <div>
                <Polling />
                <TopBar history={history} />
                <DashSidebar disp={'none'} history={history} active={currentKey} />
                <Switch>
                    <Route path="/wallet/send" component={Send} />
                    <Route path="/wallet/receive" component={Receive} />
                    <Route path="/wallet/chart" component={Chart} />
                    <Route path="/wallet/history" component={WalletHistory} />
                    <Route path="/wallet/support" component={Support} />
                </Switch>
            </div>
        );
    }
}

export default withRouter(Wallet);
