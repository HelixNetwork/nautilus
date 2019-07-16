import React from 'react';
import { connect } from 'react-redux';
import Logos from 'ui/components/logos';
import css from './index.scss';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import { withI18n, Trans } from 'react-i18next';
import Button from 'ui/components/button';
import Dropzone from 'ui/components/dropzone';
import { indexToChar } from 'libs/hlx/converter';
class SeedImport extends React.PureComponent {

    static propTypes = {
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        wallet: PropTypes.object.isRequired,
        additionalAccountName: PropTypes.string.isRequired,
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };

    state = {
        ledger: false,
        hidePass: 'none',
        isGenerated: Electron.getOnboardingGenerated(),
        importBuffer: [],
        password: '',
        hidePass: 'none',
        seedPhrase: ''
    };

    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    onPaste = (e) => {
        e.preventDefault();
    };

    onDrop = async (buffer) => {
        if (!buffer) {
            return this.props.generateAlert(
                'error',
                'Error opening keystore file',
                'There was an error opening keystore file',
            );
        }
        this.setState({
            importBuffer: buffer,
            hidePass: 'block'
        });
    };
    onChange(e) {
        this.setState({
            password: e.target.value
        });
    }
    onSubmit = async () => {
        try {
            const seed = await Electron.importSeed(this.state.importBuffer, this.state.password);
            console.log(seed[0]);
            let seedSequence = "";
            seed[0].seed.map((byte, index) => {
                const letter = indexToChar(byte);
                seedSequence += letter
            });
            Electron.setOnboardingSeed(seed[0].seed, false);
            Electron.setOnboardingName(seed[0].title)
            console.log(Electron.getOnboardingName());
            this.setState({
                seedPhrase: seedSequence,
                hidePass: 'none'
            })

        }
        catch (err) {
            Electron.setOnboardingSeed(null);
            this.setState({
                seedPhrase: ""
            });
        }

    }
    goBack() {
        Electron.setOnboardingSeed(null);
        this.setState({
            importBuffer: null,
            hidePass: 'none',
            seedPhrase: ""
        });
    }

    setSeed = async (e) => {
        if (e) {
            e.preventDefault();
        }
        const { setAccountInfoDuringSetup, wallet, additionalAccountName, history, t } = this.props;
        const { seed, isGenerated } = this.state;

        if (!isGenerated) {
            Electron.setOnboardingSeed(seed, false);
            history.push('/onboarding/account-name');
        } else {
            if (wallet.ready) {
                setAccountInfoDuringSetup({
                    completed: true,
                });

                const seedStore = await new SeedStore.keychain(wallet.password);
                await seedStore.addAccount(additionalAccountName, Electron.getOnboardingSeed());

                Electron.setOnboardingSeed(null);

                history.push('/onboarding/login');
            } else {
                history.push('/onboarding/account-password');
            }
        }
    }
    render() {
        const { history, t } = this.props;
        const { importBuffer, seedPhrase, hidePass, seed, isGenerated, } = this.state;
        return (
            <div>
                <Logos />
                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{t('seedReentry:enterYourSeed')}<span className={classNames(css.text_color)}>.</span></h1>
                                {isGenerated ? (
                                    <span>{t('seedReentry:enterSeedBelow')}</span>
                                ) : (
                                        <p>
                                            {t('enterSeed:seedExplanation', { maxLength: MAX_SEED_LENGTH })}{' '}
                                            <strong>{t('enterSeed:neverShare')}</strong>
                                        </p>
                                    )}
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs, css.hlx_box)}>
                                <label>Seed</label>
                                <input type="text" className={classNames(css.sseed_textline)} value={seedPhrase}></input><br /><br />
                                <Dropzone onDrop={this.onDrop} />
                                <br />
                                {importBuffer && (
                                    <form className={classNames(css.sseed_box, css.cre_pgs)} onSubmit={() => this.onSubmit()} style={{ top: '-30px', left: '350px', display: hidePass }}>
                                        <input type="password" name="password" className={classNames(css.sseed_textline)} onChange={this.onChange.bind(this)} style={{ marginTop: '55px' }}></input><br /><br />
                                        <Button onClick={this.goBack.bind(this)}>Cancel</Button>&nbsp;&nbsp;&nbsp;<Button type="submit">Import Seed</Button>
                                    </form>
                                )}
                                {/* <input type="password" className={classNames(css.sseed_textline)} placeholder="Enter key" style={{ position: 'relative', top: '60px' }} onChange={this.onChange}></input><br /><br /> */}
                            </div>
                            <div className={css.onboard_btn}>
                                <Button className="navleft" variant="backgroundNone" to={`/onboarding/seed-${isGenerated ? 'backup' : 'intro'}`}>{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" onClick={this.setSeed}>{t('global:confirm')} <span>></span></Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    wallet: state.wallet,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
});
const mapDispatchToProps = {
    setAccountInfoDuringSetup,
    additionalAccountName: Electron.getOnboardingName()
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(SeedImport));