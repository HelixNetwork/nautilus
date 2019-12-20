import React from 'react';
import { withI18n } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Send from 'ui/views/wallet/send';
import Receive from 'ui/views/wallet/receive';
import Chart from 'ui/views/wallet/chart';
import WalletHistory from 'ui/views/wallet/wallet_history';

/**
 * Wallet dashboard component
 */
class Dashboard extends React.PureComponent {
    static propTypes = {};
    render() {
        return (
            <div>
                <Switch>
                    <Route path="/wallet/" component={Send} />
                    <Route path="/wallet/send" component={Send} />
                    <Route path="/wallet/receive" component={Receive} />
                    <Route path="/wallet/chart" component={Chart} />
                    <Route path="/wallet/history" component={WalletHistory} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default withI18n()(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Dashboard),
);
