import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import css from './button.scss';

/**
 * Button component
 */
export default class Button extends React.PureComponent {
    static propTypes = {
        /** Target link */
        to: PropTypes.string,
        /** Click event callback function
         * @param {object} Event - Click event object
         * @returns {undefined}
         */
        onClick: PropTypes.func,
        /** Button content */
        children: PropTypes.node,
        /** Custom button style definitions */
        style: PropTypes.object,
        /** Is button disabled */
        disabled: PropTypes.bool,
        /** Button element type */
        type: PropTypes.oneOf(['button', 'submit']),
        /** Buttons secondary class */
        className: PropTypes.oneOf([
            'outline',
            'small',
            'outlineSmall',
            'square',
            'icon',
            'icon_hover',
            'backgroundNone',
            'navleft',
            'navright',
            'modal_navleft',
            'modal_navright',
            'log_navleft',
            'log_navright',
            'reset_button',
        ]),
        /** Is button loading state active */
        loading: PropTypes.bool,
    };

    render() {
        const { onClick, children, className, to, variant, style, type, disabled } = this.props;
        if (to) {
            return (
                <Link
                    {...this.props}
                    className={classNames(css.button, css[className], disabled ? css.disabled : null)}
                >
                    {children}
                </Link>
            );
        }
        return (
            <button
                style={style}
                type={type ? type : 'button'}
                onClick={onClick}
                disabled={disabled}
                className={classNames(css.button, css[className], css[variant])}
            >
                {children}
            </button>
        );
    }
}
