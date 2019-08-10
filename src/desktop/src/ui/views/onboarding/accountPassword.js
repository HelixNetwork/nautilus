/* global Electron */
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withI18n, Trans } from "react-i18next";
import { zxcvbn } from "libs/exports";

import { setAccountInfoDuringSetup } from "actions/accounts";
import { setPassword } from "actions/wallet";
import { generateAlert } from "actions/alerts";

import SeedStore from "libs/seed";
import { hash, initKeychain, initVault } from "../../../libs/crypto";
import { passwordReasons } from "libs/password";

import Logos from "ui/components/logos";
import PasswordInput from "ui/components/input/password";
import css from "./index.scss";
import classNames from "classnames";
import Button from "ui/components/button";

class AccountPassword extends React.PureComponent {
  static propTypes = {
    setPassword: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    t: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    additionalAccountName: PropTypes.string.isRequired,
    additionalAccountMeta: PropTypes.object.isRequired,
    setAccountInfoDuringSetup: PropTypes.func.isRequired
  };

  state = {
    isGenerated: Electron.getOnboardingGenerated(),
    password: "",
    passwordConfirm: "",
    loading: false
  };

  createAccount = async e => {
    const {
      additionalAccountMeta,
      additionalAccountName,
      setPassword,
      history,
      t,
      generateAlert
    } = this.props;
    const { password, passwordConfirm } = this.state;
    if (e) {
      e.preventDefault();
    }

    if (this.state.loading) {
      return;
    }

    const score = zxcvbn(password);

    if (score.score < 4) {
      const reason = score.feedback.warning
        ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
        : t("changePassword:passwordTooWeakReason");

      return generateAlert(
        "error",
        t("changePassword:passwordTooWeak"),
        reason,
        1000
      );
    }

    if (password != passwordConfirm) {
      return generateAlert(
        "error",
        t("changePassword:passwordsDoNotMatch"),
        t("changePassword:passwordsDoNotMatchExplanation"),
        1000
      );
    }

    this.setState({
      loading: true
    });

    try {
      await initKeychain();
    } catch (err) {
      return generateAlert(
        "error",
        t("global:errorAccessingKeychain"),
        t("global:errorAccessingKeychainExplanation"),
        1000
      );
    }

    const passwordHash = await hash(password);
    await initVault(passwordHash);
    setPassword(passwordHash);
    this.props.setAccountInfoDuringSetup({
      completed: true
    });

    const seedStore = await new SeedStore[additionalAccountMeta.type](
      passwordHash
    );
    await seedStore.addAccount(
      additionalAccountName,
      Electron.getOnboardingSeed()
    );
    Electron.setOnboardingSeed(null);

    history.push("/onboarding/done");
  };

  stepBack = e => {
    if (e) {
      e.preventDefault();
    }

    const { history } = this.props;

    if (Electron.getOnboardingGenerated()) {
      history.push("/onboarding/seed-import");
    } else {
      history.push("/onboarding/account-name");
    }
  };

  render() {
    const { t } = this.props;
    const { isGenerated } = this.state;
    const score = zxcvbn(this.state.password);

    return (
      <section>
        <Logos size={20} />
        <form onSubmit={e => this.createAccount(e)}>
          <section>
            <h1>{t("setPassword:choosePassword")}</h1>
            <span>{t("setPassword:anEncryptedCopy")}</span>
            <div
              className={classNames(css.sseed_box, css.cre_pgs, css.hlx_box)}
            >
              <PasswordInput
                style={{ marginTop: "3vw" }}
                focus
                value={this.state.password}
                label={t("password")}
                showScore
                showValid
                onChange={value => this.setState({ password: value })}
              />
              <PasswordInput
                value={this.state.passwordConfirm}
                label={t("setPassword:retypePassword")}
                showValid
                disabled={score.score < 4}
                match={this.state.password}
                onChange={value => this.setState({ passwordConfirm: value })}
              />
            </div>
            <div className={css.onboard_btn}>
              <Button
                className="navleft"
                variant="backgroundNone"
                to={`/onboarding/${
                  isGenerated ? "seed-import" : "account-name"
                }`}
              >
                {t("global:goBack")} <span>></span>
              </Button>
              <Button
                type="submit"
                className="navright"
                variant="backgroundNone"
              >
                {t("global:confirm")} <span>></span>
              </Button>
            </div>
          </section>
        </form>
      </section>
    );
  }
}

const mapStateToProps = state => ({
  additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
  additionalAccountName: state.accounts.accountInfoDuringSetup.name
});

const mapDispatchToProps = {
  setPassword,
  setAccountInfoDuringSetup,
  generateAlert
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(AccountPassword));
