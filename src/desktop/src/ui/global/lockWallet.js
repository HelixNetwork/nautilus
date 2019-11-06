import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import { setPassword } from 'actions/wallet';

import ModalPassword from 'ui/components/modal/Password';

const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

/**
 * User idle lock wallet screen component
 */
class LockWallet extends React.Component {
    static propTypes = {
        setPassword: PropTypes.func.isRequired,
        timeout: PropTypes.number.isRequired,
        isAuthorised: PropTypes.bool.isRequired,
    };

    state = {
        locked: false,
    };

    componentDidMount() {
        this.restartLockTimeout = debounce(this.handleEvent, 500);
        this.attachEvents();
        this.onSetIdle = this.lock.bind(this);
        // eslint-disable-next-line no-undef
        Electron.onEvent('lockScreen', this.onSetIdle);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isAuthorised && nextProps.isAuthorised) {
            this.handleEvent();
        }
    }

    componentWillUnmount() {
        this.removeEvents();
        // eslint-disable-next-line no-undef
        Electron.removeEvent('lockScreen', this.onSetIdle);
    }

    lock() {
        if (this.props.isAuthorised) {
            this.props.setPassword({});
            this.setState({ locked: true });
            // eslint-disable-next-line no-undef
            Electron.updateMenu('enabled', false);
        }
    }

    unlock(password) {
        this.props.setPassword(password);
        this.setState({
            locked: false,
        });
        // eslint-disable-next-line no-undef
        Electron.updateMenu('enabled', true);
    }

    attachEvents() {
        events.forEach((event) => {
            window.addEventListener(event, this.restartLockTimeout, true);
        });
    }

    removeEvents() {
        events.forEach((event) => {
            window.removeEventListener(event, this.restartLockTimeout, true);
        });
    }

    handleEvent = () => {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            if (this.props.isAuthorised) {
                this.lock();
            } else {
                this.handleEvent();
            }
        }, this.props.timeout * 60 * 1000);
    };

    render() {
        if (!this.state.locked) {
            return null;
        }
        return <ModalPassword isOpen isForced content={{}} onSuccess={(password) => this.unlock(password)} />;
    }
}

const mapStateToProps = (state) => ({
    timeout: state.settings.lockScreenTimeout,
    isAuthorised: state.wallet.ready,
});

const mapDispatchToProps = {
    setPassword,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LockWallet);
