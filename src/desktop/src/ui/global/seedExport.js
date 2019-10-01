/* global Electron */
import React, { PureComponent } from "react";
import classNames from "classnames";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withI18n } from "react-i18next";
import { zxcvbn } from "libs/exports";

import { generateAlert } from "actions/alerts";
import { MAX_SEED_LENGTH } from "libs/hlx/utils";

import { passwordReasons } from "libs/password";
import PasswordInput from "ui/components/input/password";
import Button from "ui/components/button";

import css from "./seedExport.scss";
import Lottie from "react-lottie";
import * as animationData from "animations/export.json";
import { Row } from 'react-bootstrap';
/**
 * SeedVault export component
 */
export class SeedExportComponent extends PureComponent {
  static propTypes = {
    /** Target Seed */
    seed: PropTypes.array.isRequired,
    /** Seed title */
    title: PropTypes.string,
    /** On close event callback
     * @returns {undefined}
     */
    onClose: PropTypes.func.isRequired,
    /** @ignore */
    t: PropTypes.func.isRequired,
    /** @ignore */
    generateAlert: PropTypes.func.isRequired
  };

  state = {
    step: 1,
    password: "",
    passwordConfirm: ""
  };

  onClose = e => {
    e.preventDefault();
    this.props.onClose();
  };

  onBackStep = e => {
    e.preventDefault();
    if (this.state.step !== 1) {
      return this.setState({ step: this.state.step - 1 });
    }
    this.onClose(e);
  };

  onStep = e => {
    e.preventDefault();
    this.setState(prevState => ({ step: prevState.step + 1 }));
  };

  /**
   * Check for valid password, trigger SeedVault file export, reset and close the tutorial
   * @param {Event} event - Form submit event
   * @returns {undefined}
   */
  exportSeed = async event => {
    const { seed, title, generateAlert, onClose, t } = this.props;
    const { password, passwordConfirm } = this.state;

    if (event) {
      event.preventDefault();
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

    if (password !== passwordConfirm) {
      return generateAlert(
        "error",
        t("changePassword:passwordsDoNotMatch"),
        t("changePassword:passwordsDoNotMatchExplanation"),
        1000
      );
    }

    if (seed.length !== MAX_SEED_LENGTH) {
      return this.props.generateAlert(
        "error",
        t("global:somethingWentWrong"),
        t("global:somethingWentWrongTryAgain"),
        1000
      );
    }

    const error = await Electron.exportSeeds(
      [
        {
          title: Electron.getOnboardingName(),
          seed: seed
        }
      ],
      password
    );

    this.setState({
      step: 1,
      password: "",
      passwordConfirm: ""
    });

    if (error) {
      if (error !== "Export cancelled") {
        return generateAlert(
          "error",
          t("seedVault:exportFail"),
          t("seedVault:exportFailExplanation"),
          1000,
          error
        );
      }
    } else {
      generateAlert(
        "success",
        t("seedVault:exportSuccess"),
        t("seedVault:exportSuccessExplanation"),
        1000
      );
    }

    Electron.garbageCollect();

    onClose();
  };

  render() {
    const { loop, t } = this.props;
    const { step } = this.state;
    const defaultOptions = {
      loop: loop,
      autoplay: true,
      animationData: animationData.default,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };

    if (step < 4) {
      return (
        <Row>
        <form
          className={classNames(css.step1)}
          onSubmit={this.onStep}
        >
          <Row>
            <h1>
              <div className={css.backup}>
                <Lottie
                  options={defaultOptions}
                  eventListeners={[
                    {
                      eventName: "complete",
                      callback: () => {
                        if (typeof onEnd === "function") {
                          onEnd();
                        }
                      }
                    }
                  ]}
                />
                {/* <Icon icon="seedVault" size={120} /> */}
              </div>
              {t("seedVault:exportSeedVault")}
            </h1>
            {step === 1 && <h4 className={css.modal_h4}>{t("seedVault:seedVaultExplanation")}</h4>}
            {step === 2 && <h4 className={css.modal_h4}>{t("seedVault:seedVaultWarning")}</h4>}
            {step === 3 && <h4 className={css.modal_h4}>{t("seedVault:seedVaultKeyExplanation")}</h4>}
          </Row>
          <Row>
            <Button
              onClick={this.onBackStep}
              variant="backgroundNone"
              className="modal_navleft"
            >
           <span>&lt;</span> {t("goBack")} 
            </Button>
            <Button
              type="submit"
              variant="backgroundNone"
              className="modal_navright"
            >
              {t("continue")} <span>></span>
            </Button>
          </Row>


        </form>
        </Row>
      );
    }

    const score = zxcvbn(this.state.password);

    return (
      <Row>
      <form
        className={classNames(css.step2)}
        onSubmit={this.exportSeed}
      >
        <Row>
          <h1>
            <div className={css.backup}>
              <Lottie
                options={defaultOptions}
                eventListeners={[
                  {
                    eventName: "complete",
                    callback: () => {
                      if (typeof onEnd === "function") {
                        onEnd();
                      }
                    }
                  }
                ]}
              />
              {/* <Icon icon="seedVault" size={120} /> */}
            </div>
            {t("seedVault:exportSeedVault")}
          </h1>

          <div>
            <PasswordInput
              focus
              value={this.state.password}
              label="SeedVault Password"
              showScore
              showValid
              onChange={value => this.setState({ password: value })}
            />
            <PasswordInput
              value={this.state.passwordConfirm}
              label="Confirm SeedVault Password"
              showValid
              disabled={score.score < 4}
              match={this.state.password}
              onChange={value => this.setState({ passwordConfirm: value })}
            />
          </div>
        </Row>
        <Row>
          <Button
            onClick={this.onBackStep}
            variant="backgroundNone"
            className="modal_navleft"
          >
           <span>&lt;</span> {t("goBack")} 
          </Button>
          <Button
            type="submit"
            variant="backgroundNone"
            className="modal_navright"
          >
            {t("export")} <span>></span>
          </Button>
        </Row>
      </form>
      </Row>
    );
  }
}

const mapDispatchToProps = {
  generateAlert
};

export default connect(
  null,
  mapDispatchToProps
)(withI18n()(SeedExportComponent));
