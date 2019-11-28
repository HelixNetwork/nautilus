/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';

import css from './clipboard.scss';

/**
 * Copy to clipboard wrapper component
 */
export class ClipboardComponent extends React.PureComponent {
    static timeout = null;

    static propTypes = {
        /** Target content copied to clipboard */
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        /** Clipboard wrapper content */
        children: PropTypes.any,
        /** Timeout to clear the clipboard */
        timeout: PropTypes.number,
        /** Success notification title */
        title: PropTypes.string.isRequired,
        /** Success notification description */
        success: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    copy = (e) => {
        if (e) {
            e.stopPropagation();
        }

        const { text, generateAlert, title, success, timeout } = this.props;
        console.log('timeout=', timeout);

        Electron.clipboard(text);
        generateAlert('success', title, success, 1000);

        if (timeout > 0) {
            console.log('entered');
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                console.log('entered 3');

                Electron.clipboard('');
            }, timeout * 1000);
        }
        console.log('entered 2');
    };

    render() {
        const { children, text } = this.props;
        console.log('entered 4');

        return (
            <span className={css.clipboard} onClick={this.copy}>
                {children || text}
            </span>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    null,
    mapDispatchToProps,
)(ClipboardComponent);
