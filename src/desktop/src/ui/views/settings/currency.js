import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import Button from 'ui/components/button';
import Select from 'ui/components/input/select';

import { getCurrencyData } from 'actions/settings';
import { getThemeFromState } from 'selectors/global';

/**
 * Currency settings component
 */

class Currency extends React.PureComponent {
    static propTypes = {
        /**@ignore */
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        /**@ignore */
        hasErrorFetchingCurrencyData: PropTypes.bool.isRequired,
        /**@ignore */
        currency: PropTypes.string.isRequired,
        /**@ignore */
        currencies: PropTypes.arrayOf(PropTypes.string).isRequired,
        /**@ignore */
        getCurrencyData: PropTypes.func.isRequired,
        /**@ignore */
        backPress: PropTypes.func,
        /**@ignore */
        t: PropTypes.func.isRequired,
    };

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
            <div className={classNames(css.foo_bxx12)}>
                <form
                    className={css.margin_form}
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

                    <Button
                        style={{ marginLeft: '31vw', marginTop: '4vw' }}
                        loading={isFetchingCurrencyData}
                        type="submit"
                    >
                        {t('global:save')}
                    </Button>
                </form>
                <div className={classNames(css.spe_bx)}></div>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
    hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
    currency: state.settings.currency,
    currencies: state.settings.availableCurrencies,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    getCurrencyData,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Currency));
