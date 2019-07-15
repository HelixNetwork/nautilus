import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';

import classNames from 'classnames';
import Button from 'ui/components/button';
import Input from 'ui/components/input/text';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import css from './index.scss';
import Logos from 'ui/components/logos';

class AccountPassword extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
        accountNames: PropTypes.array.isRequired,
        additionalAccountMeta: PropTypes.object.isRequired,
        additionalAccountName: PropTypes.string.isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired
    };
    state={
        password:'',
        confirm_password:''
    }
    render() {
        const { t } = this.props;
        const { password,confirm_password } = this.state;
        
        return (
            
            <section className="spage_1">
                <Logos size={20} />
                <div className="container">
                    <div className="row">
                        <form onSubmit={this.setName}>
                            <div className="col-lg-12">
                                {/* <h1>{t('walletSetup:Seed Verify')}<span> {t('walletSetup:seed')}</span></h1> */}
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <h4>{t('setSeedName:letsAddName')}</h4>
                                <h5>{t('setSeedName:setAccountName')}</h5>
                                <Input
                                    value={password}
                                    focus
                                    label={t('changePassword:newPassword')}
                                    onChange={(value) => this.setState({ password: value })}
                                />
                                <br />
                                <Input
                                    value={confirm_password}
                                    focus
                                    label={t('changePassword:confirmPassword')}
                                    onChange={(value) => this.setState({ confirm_password: value })}
                                />
                                <br/>
                                {/* <img src={images} alt="send" className={(classNames(css.img))} /> */}
                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-generate')}>{t('global:goBack')} <span>></span></Button>
                                <Button type="submit" className="navright" variant="backgroundNone">{t('global:confirm')} <span>></span></Button>
                            </div>
                        </form>
                    </div>
                </div>
                <footer className={classNames(css.footer)}>

                </footer>
            </section>

        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(AccountPassword);