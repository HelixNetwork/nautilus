import React from 'react';
import PropTypes from 'prop-types';

/*
 * Seed input component
 */
export class SeedComponent extends React.PureComponent {
    static propTypes = {
        seed: PropTypes.array.isRequired,
        label: PropTypes.string.isRequired,
        focus: PropTypes.bool,
        closeLabel: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        updateImportName: PropTypes.bool,
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        showScanner: false,
        importBuffer: null,
        hidden: true,
        cursor: 0,
        accounts: [],
        accountIndex: -1,
    };

    componentDidMount() {
        if (this.props.focus) {
            this.input.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focus && nextProps.focus) {
            this.input.focus();
        }
    }

    componentDidUpdate() {
        if (this.input && this.props.seed && this.props.seed.length >= this.state.cursor) {
            try {
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(this.input, this.state.cursor);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                this.input.scrollLeft = range.startOffset * 10;
            } catch (error) {}
        }
    }
}
