import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import themes from 'themes/themes';
import Button from 'ui/components/button';
import Select from 'ui/components/input/select';
import { updateTheme } from 'actions/settings';

/**
 * Theme settings component
 */

class SettingsTheme extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };
    state = {
        themeName: null,
    };
    render() {
        const { updateTheme, t } = this.props;
        const { themeName } = this.state;

        return (
            <div className={classNames(css.foo_bxx12)}>
                <form
                    className={css.margin_form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (themeName) {
                            document.body.style.background = themes[themeName].body.bg;
                            updateTheme(themeName);
                        }
                    }}
                >
                    <Select
                        label={t('settings:theme')}
                        value={themeName || this.props.themeName}
                        valueLabel={t(
                            `themes:${themeName ? themeName.toLowerCase() : this.props.themeName.toLowerCase()}`,
                        )}
                        onChange={(value) => this.setState({ themeName: value })}
                        options={Object.keys(themes).map((item) => {
                            return {
                                value: item,
                                label: t(`themes:${item.toLowerCase()}`),
                            };
                        })}
                    />
                    <Button
                        style={{ marginLeft: '31vw', marginTop: '4vw' }}
                        type="submit"
                        disabled={!themeName || themeName === this.props.themeName}
                    >
                        {t('global:save')}
                    </Button>
                    <div className={classNames(css.spe_bx)}></div>
                </form>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(SettingsTheme));
