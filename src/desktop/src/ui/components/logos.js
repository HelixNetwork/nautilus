import React from 'react';
import css from 'ui/components/logos.scss';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';
import logo from 'ui/images/logo.png';
import Icon from 'ui/components/icon';
class Logos extends React.PureComponent {
    render() {
        return (
            <div className={classNames(css.top_sec1)}>
                <div className={classNames(css.lg_logos)}>
                    <img src={logo} alt="" />
                </div>
                {this.props.wallet.ready && (
                    <React.Fragment>
                        <span className={css.logos_span} onClick={() => this.props.history.push('/wallet/')}>
                            <Icon icon="cross" size={18} />
                        </span>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    wallet: state.wallet,
});

export default connect(mapStateToProps)(withI18n()(Logos));
