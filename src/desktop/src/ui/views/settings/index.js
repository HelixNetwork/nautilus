import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import Sidebar from '../../components/sidebar';
import Button from 'ui/components/button';
import SettingsLanguage from 'ui/views/settings/language';
import SettingsNode from 'ui/views/settings/node';
import Currency from 'ui/views/settings/currency';
import SettingsTheme from 'ui/views/settings/themesetting';


/**
 * Setting component
 */

class Settings extends React.PureComponent {
    static propTypes = {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    render() {

        const { location, history, t } = this.props;

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

                                <Sidebar
                                    disp={'none'}
                                    history={this.props.history}
                                />
                                {/* <hr className={classNames(css.ser_bts)}/> */}
                                <a ></a>
                            </div>

                        </div>

                    </div>
                </section>
                <Switch>
                    <Route path="/settings/language" component={SettingsLanguage} />
                    <Route path="/settings/node" component={SettingsNode} />
                    <Route path="/settings/currency" component={Currency} />
                    <Route path="/settings/theme" component={SettingsTheme} />
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = {

};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withI18n()(Settings)));