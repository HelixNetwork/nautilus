import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import Button from 'ui/components/button';
import Icon from 'ui/components/icon';
import Language from 'ui/components/input/language';
import Select from 'ui/components/input/select';
import { I18N_LOCALE_LABELS, I18N_LOCALES } from 'libs/i18n';
import { setLocale } from 'actions/settings';

/**
 * Setting component
 */

class SettingsLanguage extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        setLocale: PropTypes.func.isRequired,

    }
    state = {
        step: 'language',
        scrollEnd: false,
    };
    changeLocale = (e) => {
        e.preventDefault();

        const { selection } = this.state;

        this.props.setLocale(selection);
        i18next.changeLanguage(selection);

        this.setState({
            selection: null,
        });
    };



    render() {
        const { t, locale } = this.props;
        const { selection } = this.state;
        return (
            <div className={classNames(css.foo_bxx12)}>
                <form  style={{marginTop:'7vw'}} onSubmit={(e) => this.changeLocale(e)} >
                    <Select
                        label={t('languageSetup:language')}
                        value={I18N_LOCALE_LABELS[I18N_LOCALES.indexOf(selection || locale)]}
                        onChange={(value) => this.setState({ selection: value })}
                        options={I18N_LOCALES.map((item, index) => {
                            return { value: item, label: I18N_LOCALE_LABELS[index] };
                        })}
                    />
                    <Button style={{ marginLeft: '26vw', marginTop: '4vw' }} type="submit" >{t('global:save')}</Button>
                    <div className={classNames(css.spe_bx)}></div>
                </form>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    locale: state.settings.locale,
});
const mapDispatchToProps = {
    setLocale,

};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(SettingsLanguage));