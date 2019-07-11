import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import css from './input.scss';

/**
 * Single line input component
 */
export default class Text extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        focus: PropTypes.bool,
        label: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        maxLength: PropTypes.number,
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

    render() {
        const { value, onChange, disabled, maxLength } = this.props;

        return (
            <input
                ref={(input) => {
                    this.input = input;
                }}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                className={classNames(css.sseed_textline)}
            />
        );
    }
}
