import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import Top from '../../components/topbar';
import Button from 'ui/components/button';
import Icon from 'ui/components/icon';
import Select from 'ui/components/input/select';


import { getCurrencyData } from 'actions/settings';
import { getThemeFromState } from 'selectors/global';

/**
 * currency settings component
 */

class Currency extends React.PureComponent {
    static propTypes = {
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        hasErrorFetchingCurrencyData: PropTypes.bool.isRequired,
        currency: PropTypes.string.isRequired,
        currencies: PropTypes.arrayOf(PropTypes.string).isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        backPress: PropTypes.func,
        t: PropTypes.func.isRequired
    }

    state = {
        selection: null,
    };


    setCurrency = (currency) => {
        this.props.getCurrencyData(currency, true);
    };

    render() {

        const { currency, currencies, isFetchingCurrencyData, t } = this.props;
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
                            <div className={classNames(css.menu_box)}>

                            </div>

                        </div>
                        <div className="col-lg-8">
                            <div className={classNames(css.foo_bxx12)}>
                                <Button type="submit" style={{ marginLeft: '39vw' }} variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} >
                                    <span >
                                        <Icon icon="cross" size={14} />
                                    </span>
                                </Button>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        this.setCurrency(this.state.selection);
                                    }}
                                >
                                    <Select
                                        value={selection || currency}
                                        label={t('currencySelection:currency')}
                                        onChange={(value) => this.setState({ selection: value })}
                                        options={currencies
                                            .slice()
                                            .sort()
                                            .map((item) => {
                                                return { value: item, label: item };
                                            })}
                                    />
                                </form>
                                <Button
                                    style={{ marginLeft: '14vw', marginTop: '4vw' }}
                                    loading={isFetchingCurrencyData}
                                    type="submit">
                                    {t('global:save')}
                                </Button>
                                <div className={classNames(css.spe_bx)}></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
    hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
    currency: state.settings.currency,
    currencies: state.settings.availableCurrencies,
    theme: getThemeFromState(state)
});

const mapDispatchToProps = {
    getCurrencyData,
};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Currency));