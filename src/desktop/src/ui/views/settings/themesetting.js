import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import themes from 'themes/themes';
import Icon from 'ui/components/icon';
import Button from 'ui/components/button';
import Select from 'ui/components/input/select';
import { updateTheme } from 'actions/settings';


/**
 * Theme settings component
 */

class SettingsTheme extends React.PureComponent {
    static propTypes = {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    state = {
        themeName: null,
    }
    render() {

        const { location, history, updateTheme, t } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
        const { themeName } = this.state;

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
                            <div className={classNames(css.menu_box)}>


                                {/* <hr className={classNames(css.ser_bts)}/> */}
                                <a ></a>
                            </div>

                        </div>
                        <div className="col-lg-8">
                            <div className={classNames(css.foo_bxx12)}>
                                <Button type="submit" style={{ marginLeft: '39vw' }} variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} ><span >
                                    <Icon icon="cross" size={14} />
                                </span></Button>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (themeName) {
                                        document.body.style.background = themes[themeName].body.bg;
                                        updateTheme(themeName);
                                    }
                                }}>
                                    <Select
                                        label={t('settings:theme')}
                                        value={themeName || this.props.themeName}
                                        valueLabel={t(`themes:${themeName ? themeName.toLowerCase() : this.props.themeName.toLowerCase()}`,
                                        )}
                                        onChange={(value) => this.setState({ themeName: value })}
                                        options={Object.keys(themes).map((item) => {
                                            return {
                                                value: item,
                                                label: t(`themes:${item.toLowerCase()}`),
                                            };
                                        })}
                                    />
                                    <Button style={{ marginLeft: '14vw', marginTop: '4vw' }} type="submit" disabled={!themeName || themeName === this.props.themeName}>{t('global:save')}</Button>
                                    <div className={classNames(css.spe_bx)}>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(SettingsTheme));