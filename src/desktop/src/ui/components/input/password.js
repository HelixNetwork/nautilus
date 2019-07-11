import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withI18n } from 'react-i18next';
import { zxcvbn } from 'libs/exports';

import { passwordReasons } from 'libs/password';

import Icon from 'ui/components/icon';
import css from './input.scss';

/**
 * Password input component
 */
export class PasswordComponent extends React.PureComponent {

    render() {
        return (
            <div>Hi</div>
        )
    }
}
export default ((withI18n)(PasswordComponent));