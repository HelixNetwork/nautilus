import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';
import { dismissAlert } from 'actions/alerts';
import css from './alerts.scss';

/**
 * Alerts UI helper component
 */
class Alerts extends React.PureComponent {
    static timeout = null;

    static propTypes = {
        /** @ignore */
        dismissAlert: PropTypes.func.isRequired,
        /** @ignore */
        alerts: PropTypes.object.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        shouldUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        dismissUpdate: false,
    };

    componentWillReceiveProps(nextProps) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (nextProps.alerts.category && nextProps.alerts.category.length && nextProps.alerts.closeInterval > 0) {
            this.timeout = setTimeout(() => {
                this.props.dismissAlert();
            }, nextProps.alerts.closeInterval);
        }
    }

    closeAlert() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.props.dismissAlert();
    }

    render() {
        const { alerts, dismissAlert, t } = this.props;

        /**
         * Temporarily override account fetch error by adding Proxy setting suggestion
         */
        const message =
            alerts.message === t('invalidResponseFetchingAccount')
                ? t('invalidResponseFetchingAccountDesktop')
                : alerts.message;

        return (
            <div className={css.wrapper}>
                <div
                    onClick={() => dismissAlert()}
                    className={classNames(
                        alerts.category && alerts.category.length ? css.visible : null,
                        css[`${alerts.category}`],
                    )}
                >
                    {alerts.title && <h2>{alerts.title}</h2>}
                    {message && <p>{message}</p>}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    alerts: state.alerts,
    forceUpdate: state.wallet.forceUpdate,
    shouldUpdate: state.wallet.shouldUpdate,
});

const mapDispatchToProps = {
    dismissAlert,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Alerts));
