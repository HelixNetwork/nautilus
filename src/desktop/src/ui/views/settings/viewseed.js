import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

import {
    selectAccountInfo,
    getSelectedAccountName,
    getSelectedAccountMeta
} from 'selectors/accounts';
import { MAX_SEED_LENGTH } from 'libs/hlx/utils';
import { indexToChar, capitalize } from 'libs/hlx/converter';
import SeedStore from 'libs/seed';
import { connect } from 'react-redux';

import Modal from 'ui/components/modal/Modal';
import ModalPassword from 'ui/components/modal/Password';
import Button from 'ui/components/button';
import Icon from 'ui/components/icon';
import SeedExport from 'ui/global/seedExport';

import css from './settings.scss';
import classNames from 'classnames';


/**
 * View seed component
 */

class Viewseed extends React.PureComponent {
    static propTypes = {
        accountName: PropTypes.string.isRequired,
        accountMeta: PropTypes.object.isRequired,
        password: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,


    }
    state = {
        action: null,
        seed: false,
        checksum: ''
    };
    componentDidMount() {
        this.seed = [];
    }

    componentWillUnmount() {
        for (let i = 0; i < this.seed.length * 8; i++) {
            this.seed[i % this.seed.length] = 0;
        }

        Electron.garbageCollect();
    }

    /**
     * Retrieve seed and set to state
     */
    setSeed = async () => {
        const { accountName, accountMeta, password } = this.props;


        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        this.seed = await seedStore.getSeed();
        const checksum = this.seed ? await Electron.getChecksum(this.seed) : '';
        this.setState({
            seed: true,
            checksum: checksum
        });
    };

    render() {

        const { location, history, t } = this.props;
        const { accountMeta, accountName } = this.props;
        const { seed, action } = this.state;

        const currentKey = location.pathname.split('/')[2] || '/';

        if (accountMeta && !SeedStore[accountMeta.type].isSeedAvailable) {
            return (

                <div className={classNames(css.foo_bxx12)}>
                    <div className={classNames(css.set_bxac)}>
                        <Button type="submit" style={{ marginLeft: '39vw' }} variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} ><span >
                            <Icon icon="cross" size={14} />
                        </span></Button>
                        <h5 style={{ marginLeft: '3vw' }}>{t('accountManagement:viewSeed')}</h5>
                        {/* <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br /> */}



                        {typeof accountMeta.index === 'number' && (
                            <Fragment>
                                <hr />
                                <p>
                                    {t('viewSeed:accountIndex')}: <strong>{accountMeta.index = null ? ' ' : accountMeta}</strong>
                                </p>
                            </Fragment>
                        )}
                        {typeof accountMeta.page === 'number' && accountMeta.page > 0 && (
                            <Fragment>
                                <hr />
                                <p>
                                    <hr />
                                    {t('viewSeed:accountPage')}: <strong>{accountMeta.page}</strong>
                                </p>
                            </Fragment>
                        )}

                    </div>
                </div>



            );
        }


        if (action && !seed) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={this.setSeed}
                    onClose={() => this.setState({ action: null })}
                    seedName={accountName}
                    content={{
                        title: action === 'view' ? t('viewSeed:enterPassword') : t('login:enterPassword'),
                        confirm:
                            action === 'view'
                                ? t('accountManagement:viewSeed')
                                : t('seedVault:exportSeedVault')
                    }}
                />
            );

        }

        const checksum = this.state.checksum;
        return (
            <React.Fragment>
                <div className={classNames(css.foo_bxx12)}>
                        <h5 style={{ marginLeft: '3vw' }}>{t('accountManagement:viewSeed')}</h5>
                    <form>
                        <div>
                            <p className={css.seed}>
                                <span>
                                    {seed && action === 'view'
                                        ? this.seed.map((byte, index) => {
                                            if (index % 2 !== 0) {
                                                return null;
                                            }
                                            const letter = indexToChar(byte);
                                            return (
                                                <React.Fragment key={`${index}${letter}`}>
                                                    {letter}
                                                    {indexToChar(this.seed[index + 1])}{' '}
                                                </React.Fragment>
                                            );
                                        })
                                        : new Array(MAX_SEED_LENGTH / 2).join('.. ')}
                                </span>
                                {seed && action === 'view' && (
                                    <small>
                                        {t('checksum')}: <strong>{checksum}</strong>
                                    </small>
                                )}
                            </p>
                        </div>
                        <div style={{ "marginTop": "12vw" }}>
                            <Button
                                className="navleft"
                                onClick={() => this.setState({ action: action !== 'view' ? 'view' : null })}
                            >
                                {action === 'view' ? t('settings:hide') : t('settings:show')}
                            </Button>
                            {/* <Button
                            className="small"
                            onClick={() => (!seed ? this.setState({ action: 'print' }) : window.print())}
                        >
                            {t('paperWallet')}
                        </Button> */}
                            <Button className="navright" onClick={() => this.setState({ action: 'export' })}>
                                {t('seedVault:exportSeedVault')}
                            </Button>
                        </div>

                    </form>
                </div>
                <Modal
                    variant="confirm"
                    isOpen={seed && action === 'export'}
                    onClose={() => this.setState({ action: null })}
                >
                    <SeedExport
                        seed={this.seed || []}
                        title={accountName}
                        onClose={() => this.setState({ action: null })}
                    />
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    account: selectAccountInfo(state),
    password: state.wallet.password
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Viewseed));