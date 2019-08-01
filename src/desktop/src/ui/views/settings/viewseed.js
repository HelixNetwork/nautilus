import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Icon from 'ui/components/icon';
import Top from '../../components/topbar';
import Sidebar from '../../components/sidebar';
import Button from 'ui/components/button';
/**
 * View seed component
 */

class Viewseed extends React.PureComponent {
    static propTypes = {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,


    }
    state = {
        step: 'language',
        scrollEnd: false,
    };


    render() {

        const { t } = this.props;
        return (
            <div className={classNames(css.foo_bxx12)}>
                <div cllassname={classNames(css.set_bxac)}>
                    <h5 style={{ marginLeft: '3vw' }}>{t('accountManagement:viewSeed')}</h5>
                    <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br />
                    <div style={{ marginLeft: "8%" }}>
                        <Button className="modal_navLeft" style={{ margin: '10vw 0vw 1vw' }}>{t('viewSeed:viewSeed')}</Button>
                        <Button className="modal_navRight" style={{ margin: '10vw 1vw 0vw' }} onClick={() => this.stepForward('done')}>{t('export')}</Button>
                    </div>

                </div>
            </div>
        );
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(withI18n()(Viewseed));