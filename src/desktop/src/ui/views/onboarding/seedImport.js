/* global Electron */

import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import { withI18n } from 'react-i18next';
import Button from 'ui/components/button';
import { generateAlert } from 'actions/alerts';
import Dropzone from 'ui/components/dropzone';
import PasswordInput from 'ui/components/input/password';
import { indexToChar, charToIndex } from 'libs/hlx/converter';
import { MAX_SEED_LENGTH } from 'libs/hlx/utils';
import Modal from 'ui/components/modal/Modal';
import SeedStore from 'libs/seed';
import Icon from 'ui/components/icon';
import { Row } from 'react-bootstrap';

/**
 * Onboarding, Seed import component
 */
class SeedImport extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        ledger: false,
        // eslint-disable-next-line no-undef
        isGenerated: Electron.getOnboardingGenerated(),
        importBuffer: [],
        password: '',
        seedPhrase: '',
        seedIn: '',
        importVisible: false,
        seed: [],
        hidden: true,
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
            importVisible: true,
            importBuffer: buffer,
            hidePass: 'block',
        });
    };

    onSeedChange(e) {
        // To do
        e.preventDefault();
        this.setState({
            seedPhrase: e.target.value,
        });
    }
    onSubmit = async () => {
        try {
            // eslint-disable-next-line no-undef
            const seed = await Electron.importSeed(this.state.importBuffer, this.state.password);
            this.setState({
                importBuffer: null,
            });

            if (!seed || !seed.length) {
                throw Error('SeedNotFound');
            }

            let seedSequence = '';
            seed[0].seed.map((txByte, index) => {
                const letter = indexToChar(txByte);
                seedSequence += letter;
                return true;
            });
            // eslint-disable-next-line no-undef
            Electron.setOnboardingSeed(seed[0].seed, false);
            // eslint-disable-next-line no-undef
            Electron.setOnboardingName(seed[0].title);
            this.setState({
                seed: seed[0].seed,
                seedPhrase: seedSequence,
                hidePass: 'none',
                importVisible: false,
                password: '',
            });
        } catch (err) {
            // eslint-disable-next-line no-undef
            Electron.setOnboardingSeed(null);
            this.setState({
                seedPhrase: '',
            });
            this.props.generateAlert('error', 'Wrong password', 'The password you have entered is incorrect.');
        }
    };
    goBack() {
        // eslint-disable-next-line no-undef
        Electron.setOnboardingSeed(null);
        this.setState({
            importBuffer: null,
            hidePass: 'none',
            seedPhrase: '',
            password: '',
        });
    }

    setSeed = async (e) => {
        if (e) {
            e.preventDefault();
        }
        const {
            setAccountInfoDuringSetup,
            wallet,
            additionalAccountName,
            additionalAccountMeta,
            history,
            t,
            generateAlert,
        } = this.props;
        const { seed, isGenerated, seedPhrase } = this.state;
        if (!/([a-f0-9])$/.test(seedPhrase)) {
            return this.props.generateAlert(
                'error',
                'Invalid seed',
                'You have a entered an invalid character in seed.',
                1000,
            );
        }
        // eslint-disable-next-line no-undef
        if (Electron.getOnboardingSeed() == null && seedPhrase !== '') {
            for (let i = 0; i < 64; i++) {
                seed.push(charToIndex(seedPhrase[i]));
            }
        }
        if (
            isGenerated &&
            // eslint-disable-next-line no-undef
            (seed.length !== Electron.getOnboardingSeed().length ||
                // eslint-disable-next-line no-undef
                !Electron.getOnboardingSeed().every((v, i) => v % 16 === seed[i] % 16))
        ) {
            generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
            return;
        }

        if (wallet.password.length) {
            const seedStore = await new SeedStore[additionalAccountMeta.type](wallet.password);
            const isUniqueSeed = await seedStore.isUniqueSeed(seed);
            if (!isUniqueSeed) {
                generateAlert('error', t('addAdditionalSeed:seedInUse'), t('addAdditionalSeed:seedInUseExplanation'));
                return;
            }
        }
        if (seed.length !== MAX_SEED_LENGTH) {
            generateAlert(
                'error',
                seed.length < MAX_SEED_LENGTH ? t('enterSeed:seedTooShort') : t('enterSeed:seedTooLong'),
                t('enterSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: seed.length,
                }),
            );
            return;
        }

        if (!isGenerated) {
            // eslint-disable-next-line no-undef
            Electron.setOnboardingSeed(seed, false);
            history.push('/onboarding/account-name');
        } else {
            if (wallet.ready) {
                setAccountInfoDuringSetup({
                    completed: true,
                });

                const seedStore = await new SeedStore[additionalAccountMeta.type](wallet.password);
                await seedStore.addAccount(
                    additionalAccountName,
                    // eslint-disable-next-line no-undef
                    Electron.getOnboardingSeed(),
                );

                // eslint-disable-next-line no-undef
                Electron.setOnboardingSeed(null);

                history.push('/onboarding/login');
            } else {
                history.push('/onboarding/account-password');
            }
        }
    };

    setVisibility = () => {
        this.setState((prevState) => ({
            hidden: !prevState.hidden,
        }));
    };

    render() {
        const { t } = this.props;
        const { importBuffer, seedPhrase, isGenerated, importVisible, hidden } = this.state;
        return (
            <div>
                <Row className={css.done_row}>
                    <h1>
                        {t('seedReentry:enterYourSeed')}
                        <span className={classNames(css.text_color)}>.</span>
                    </h1>
                </Row>

                <Row className={css.centerBox1}>
                    <input
                        type={hidden ? 'password' : 'text'}
                        value={seedPhrase}
                        onChange={this.onSeedChange.bind(this)}
                        placeholder="Seed"
                        className={css.seedInput}
                    ></input>
                    <a href=" " className={hidden ? css.strike : null} onClick={this.setVisibility}>
                        <Icon icon="eye" size={16} />
                    </a>
                    <br />
                    <br />
                    <Dropzone onDrop={this.onDrop} />
                    {importBuffer && (
                        <Modal
                            variant="confirm"
                            isOpen={importVisible}
                            onClose={() => this.setState({ importVisible: false })}
                        >
                            <form className={css.import_form}>
                                <PasswordInput
                                    focus
                                    value={this.state.password}
                                    label="SeedVault Password"
                                    showValid
                                    onChange={(value) => {
                                        this.setState({ password: value });
                                    }}
                                />
                                <Button
                                    onClick={this.goBack.bind(this)}
                                    variant="backgroundNone"
                                    className="modal_navleft"
                                >
                                    <span>&lt;</span> {t('global:cancel')}
                                </Button>
                                <Button
                                    onClick={this.onSubmit.bind(this)}
                                    variant="backgroundNone"
                                    className="modal_navright"
                                >
                                    {t('seedVault:importSeedVault')}
                                    <span>></span>
                                </Button>
                            </form>
                        </Modal>
                    )}
                    <br />
                    <h3>
                        <strong>{t('enterSeed:neverShare')}</strong>
                    </h3>
                </Row>
                <Row>
                    <Button
                        className="navleft"
                        variant="backgroundNone"
                        to={`/onboarding/seed-${isGenerated ? 'backup' : 'intro'}`}
                    >
                        <span>&lt;</span> {t('global:goBack')}
                    </Button>
                    <Button
                        className="navright"
                        variant="backgroundNone"
                        disabled={seedPhrase === ''}
                        onClick={this.setSeed}
                    >
                        {t('global:confirm')} <span>></span>
                    </Button>
                </Row>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    wallet: state.wallet,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
});
const mapDispatchToProps = {
    setAccountInfoDuringSetup,
    generateAlert,
    // eslint-disable-next-line no-undef
    additionalAccountName: Electron.getOnboardingName(),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(SeedImport));
