import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import Button from 'ui/components/button';
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
        selection: null
    };

    render() {
        const { t, locale } = this.props;
        const { selection } = this.state;
        return (
            <div>
                    <Top
                        bal={'none'}
                        main={'block'}
                        user={'none'}
                        history={this.props.history}
                    />
                    <section className="spage_1">
                        <div className="container">
                        <div className="col-lg-4">

                        </div>
                        <div className="col-lg-8">
                            <div className={classNames(css.foo_bxx12)}>
                                <div cllassname={classNames(css.set_bxac)}>

                                    <h5>{t('accountManagement:editAccountName')}</h5>
                                    {/* <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br /> */}
                                    <Select
                                        label={t('languageSetup:language')}
                                        value={I18N_LOCALE_LABELS[I18N_LOCALES.indexOf(selection || locale)]}
                                        onChange={(value) => this.setState({ selection: value })}
                                        options={I18N_LOCALES.map((item, index) => {
                                            return { value: item, label: I18N_LOCALE_LABELS[index] };
                                        })}
                                    />
                                    <Button onClick={() => this.stepForward('done')}>{t('global:save')}</Button>
                                    <div className={classNames(css.spe_bx)}>
                                        <a href="#" className={classNames(css.spe_boxs)}><img src="images/lock.png" alt="" /><br />Lorem Ipsum  -></a>
                                        <hr className={classNames(css.ser_bts)} />
                                        <a href="#" className={classNames(css.ar_btns)}><img src="images/down_ar.png" alt="" /></a>
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
    locale: state.settings.locale,
});
const mapDispatchToProps = {
    setLocale
};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(SettingsLanguage));