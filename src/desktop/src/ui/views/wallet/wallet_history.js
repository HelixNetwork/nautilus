import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import List from 'ui/components/list';
import { getSelectedAccountName, getSelectedAccountMeta } from 'selectors/accounts';
import { getAccountInfo } from 'actions/accounts';

import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';

/**
 * Wallet History component
 */
class WalletHistory extends React.PureComponent {
    static propTypes = {
        /**@ignore */
        location: PropTypes.object,
        /**@ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /**@ignore */
        t: PropTypes.func.isRequired,
        /**@ignore */
        getAccountInfo: PropTypes.func.isRequired,
        /**@ignore */
        accountName: PropTypes.string.isRequired,
        /**@ignore */
        accountMeta: PropTypes.object.isRequired,
        /**@ignore */
        password: PropTypes.object.isRequired,
    };
    state = {
        active: 'li0',
    };
    handleActive(element) {
        this.setState({
            active: element,
        });
    }

    render() {
        const { history, location } = this.props;
        const subroute = location.pathname.split('/')[3] || null;

        return (
            <div>
                <section className={css.home}>
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <h3 className={css.heading}>TRANSACTION HISTORY</h3>
                                        <List
                                            updateAccount={() => this.updateAccount()}
                                            setItem={(item) =>
                                                item !== null
                                                    ? history.push(`/wallet/history/${item}`)
                                                    : history.push('/wallet/history')
                                            }
                                            currentItem={subroute}
                                            style={{ height: '20vw' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    getAccountInfo,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(WalletHistory));
