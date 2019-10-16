import React from 'react';
import PropTypes from 'prop-types';
import Logo from 'ui/components/logo';
import css from './loading.scss';
import classNames from 'classnames';

export default class Loading extends React.PureComponent {
    static propTypes = {
        /** Should animation loop */
        loop: PropTypes.bool,
        /** Should component have inline class */
        inline: PropTypes.bool,
        /** Should component have transparent class */
        transparent: PropTypes.bool,
        /** On animation end event callback */
        onEnd: PropTypes.func,
    };
    render() {
        const { loop, inline, transparent, onEnd } = this.props;
        return (
            <div className={classNames(css.loading, inline ? css.inline : null, transparent ? css.transparent : null)}>
                <Logo size={300} animate loop={loop} onEnd={onEnd}></Logo>
            </div>
        );
    }
}
