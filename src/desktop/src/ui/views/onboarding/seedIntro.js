import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import image from 'ui/images/danger.svg';

import { setAccountInfoDuringSetup } from 'actions/accounts';
import Button from 'ui/components/button';
import css from './index.scss';
import { Row } from 'react-bootstrap';
class SeedIntro extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
    };

    state = {
        ledger: false,
    };

    componentDidMount() {
        // eslint-disable-next-line no-undef
        Electron.setOnboardingSeed(null);
    }

    stepForward(route, existingSeed) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
            usedExistingSeed: existingSeed,
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    render() {
        const { t } = this.props;

        return (
            <div>
                <Row className={css.row_intro}>
                    <h1>
                        {t('walletSetup:doYouNeedASeed')}
                        <span className={classNames(css.text_color)}> {t('walletSetup:seed')} </span>?
                    </h1>
                </Row>

                <Row className={css.centerBox}>
                    <img src={image} alt="" />
                    <h5>{t('walletSetup:helixSeedIsAccess')}</h5>
                    <h6 className={css.centerBox_h6}>{t('walletSetup:explanation')}</h6>
                </Row>
                <Row>
                    <Button
                        id="to-seed-intro"
                        className="navleft"
                        variant="backgroundNone"
                        onClick={() => this.stepForward('seed-import', true)}
                    >
                        {t('newSeedSetup:loginWithYourSeed')} <span>></span>
                    </Button>
                    <Button
                        className="navright"
                        variant="backgroundNone"
                        onClick={() => this.stepForward('seed-generate', false)}
                    >
                        {t('newSeedSetup:createSeed')} <span>></span>
                    </Button>
                </Row>
            </div>
        );
    }
}

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(
    null,
    mapDispatchToProps,
)(withI18n()(SeedIntro));
