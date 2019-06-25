import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import Button from 'ui/components/button';
import Logos from 'ui/components/logos';
import css from './index.scss';

class Login extends React.PureComponent {

    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };

    stepForward(route) {
        // this.handleClick=this.handleClick.bind(this);

        this.props.history.push(`/onboarding/${route}`);
    }

    /**
     * Verify password and trigger account setup
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */
    handleSubmit = async (e) => {
        console.log("Handle Submit");

        if (e) {
            e.preventDefault();
        }
        const { history } = this.props;
        history.push('/wallet');
    }
    render() {
        const { t } = this.props;
        return (
            <section className="spage_1">
                <Logos />
                <div className="container">
                    <div className="row">
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <form onSubmit={(e) => this.handleSubmit(e)}>
                                <h5>{t('login:enterPassword')}<span className={classNames(css.text_color)}>.</span> </h5>
                                <input type="text" className={classNames(css.sseed_textline)}></input><br /><br />
                                <Button type="submit" >{t('login:login')}</Button>
                            </form>
                        </div>
                        {/* <div className={css.onboard_nav}> */}
                            <Button style={{top:'440px',left:'550px'}} className="navleft" variant="backgroundNone" onClick={() => this.stepForward('done')} >{t('global:goBack')} <span>></span></Button>                            </div>
                    {/* </div> */}
                </div>
            </section>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(Login));