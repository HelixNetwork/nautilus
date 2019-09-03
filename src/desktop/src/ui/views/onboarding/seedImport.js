import React from "react";
import { connect } from "react-redux";
import Logos from "ui/components/logos";
import css from "./index.scss";
import PropTypes from "prop-types";
import classNames from "classnames";
import { setAccountInfoDuringSetup } from "actions/accounts";
import { withI18n, Trans } from "react-i18next";
import Button from "ui/components/button";
import { generateAlert } from "actions/alerts";
import Dropzone from "ui/components/dropzone";
import PasswordInput from "ui/components/input/password";
import { indexToChar, charToIndex } from "libs/hlx/converter";
import { MAX_SEED_LENGTH } from "libs/hlx/utils";
import Modal from "ui/components/modal/Modal";
import SeedStore from "libs/seed";

class SeedImport extends React.PureComponent {
  static propTypes = {
    setAccountInfoDuringSetup: PropTypes.func.isRequired,
    wallet: PropTypes.object.isRequired,
    additionalAccountName: PropTypes.string.isRequired,
    additionalAccountMeta: PropTypes.object.isRequired,
    generateAlert: PropTypes.func.isRequired,
    history: PropTypes.object,
    t: PropTypes.func.isRequired
  };

  state = {
    ledger: false,
    isGenerated: Electron.getOnboardingGenerated(),
    importBuffer: [],
    password: "",
    seedPhrase: "",
    seedIn: "",
    importVisible: false,
    seed: []
  };

  stepForward(route) {
    this.props.setAccountInfoDuringSetup({
      meta: { type: "keychain" }
    });

    this.props.history.push(`/onboarding/${route}`);
  }

  onPaste = e => {
    e.preventDefault();
  };

  onDrop = async buffer => {
    if (!buffer) {
      return this.props.generateAlert(
        "error",
        "Error opening keystore file",
        "There was an error opening keystore file"
      );
    }
    this.setState({
      importVisible: true,
      importBuffer: buffer,
      hidePass: "block"
    });
  };

  onSeedChange(e) {
    // To do
    e.preventDefault();
    const ch = e.target.value;
    if (!/([a-f0-9])$/.test(ch)) {
      return this.props.generateAlert(
        "error",
        "Invalid seed",
        "You have a entered an invalid character in seed.",
        1000
      );
    }
    this.setState({
      seedPhrase: e.target.value
    });
  }
  onSubmit = async () => {
    try {
      const seed = await Electron.importSeed(
        this.state.importBuffer,
        this.state.password
      );
      this.setState({
        importBuffer: null
      });

      if (!seed || !seed.length) {
        throw Error("SeedNotFound");
      }

      let seedSequence = "";
      seed[0].seed.map((txByte, index) => {
        const letter = indexToChar(txByte);
        seedSequence += letter;
      });
      Electron.setOnboardingSeed(seed[0].seed, false);
      Electron.setOnboardingName(seed[0].title);
      this.setState({
        seed: seed[0].seed,
        seedPhrase: seedSequence,
        hidePass: "none",
        importVisible: false
      });
    } catch (err) {
      Electron.setOnboardingSeed(null);
      this.setState({
        seedPhrase: ""
      });
      this.props.generateAlert(
        "error",
        "Wrong password",
        "The password you have entered is incorrect."
      );
    }
  };
  goBack() {
    Electron.setOnboardingSeed(null);
    this.setState({
      importBuffer: null,
      hidePass: "none",
      seedPhrase: ""
    });
  }

  setSeed = async e => {
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
      generateAlert
    } = this.props;
    const { seed, isGenerated, seedPhrase } = this.state;
    if (Electron.getOnboardingSeed() == null && seedPhrase != "") {
      for (let i = 0; i < 64; i++) {
        seed.push(charToIndex(seedPhrase[i]));
      }
    }
    if (
      isGenerated &&
      (seed.length !== Electron.getOnboardingSeed().length ||
        !Electron.getOnboardingSeed().every((v, i) => v % 16 === seed[i] % 16))
    ) {
      generateAlert(
        "error",
        t("seedReentry:incorrectSeed"),
        t("seedReentry:incorrectSeedExplanation")
      );
      return;
    }

    if (wallet.password.length) {
      const seedStore = await new SeedStore[additionalAccountMeta.type](
        wallet.password
      );
      const isUniqueSeed = await seedStore.isUniqueSeed(seed);
      if (!isUniqueSeed) {
        generateAlert(
          "error",
          t("addAdditionalSeed:seedInUse"),
          t("addAdditionalSeed:seedInUseExplanation")
        );
        return;
      }
    }
    if (seed.length !== MAX_SEED_LENGTH) {
      generateAlert(
        "error",
        seed.length < MAX_SEED_LENGTH
          ? t("enterSeed:seedTooShort")
          : t("enterSeed:seedTooLong"),
        t("enterSeed:seedTooShortExplanation", {
          maxLength: MAX_SEED_LENGTH,
          currentLength: seed.length
        })
      );
      return;
    }

    if (!isGenerated) {
      Electron.setOnboardingSeed(seed, false);
      history.push("/onboarding/account-name");
    } else {
      if (wallet.ready) {
        setAccountInfoDuringSetup({
          completed: true
        });

        const seedStore = await new SeedStore[additionalAccountMeta.type](
          wallet.password
        );
        await seedStore.addAccount(
          additionalAccountName,
          Electron.getOnboardingSeed()
        );

        Electron.setOnboardingSeed(null);

        history.push("/onboarding/login");
      } else {
        history.push("/onboarding/account-password");
      }
    }
  };
  render() {
    const { history, t } = this.props;
    const {
      importBuffer,
      seedPhrase,
      seed,
      isGenerated,
      importVisible
    } = this.state;
    return (
      <div>
        <Logos history={history}/>
        <section className="spage_1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <h1>
                  {t("seedReentry:enterYourSeed")}
                  <span className={classNames(css.text_color)}>.</span>
                </h1>
              </div>
              <div
                className={classNames(css.sseed_box, css.cre_pgs, css.hlx_box)}
              >
                <label>Seed</label>
                <input
                  type="text"
                  className={classNames(css.sseed_textline)}
                  value={seedPhrase}
                  onChange={this.onSeedChange.bind(this)}
                ></input>
                <br />
                <br />
                <Dropzone style={{ marginTop: "2vw" }} onDrop={this.onDrop} />
                {importBuffer && (
                  <Modal
                    variant="confirm"
                    isOpen={importVisible}
                    onClose={() => this.setState({ importVisible: false })}
                  >
                    <form style={{ top: "-30px", left: "350px" }}>
                      <PasswordInput
                        focus
                        value={this.state.password}
                        label="Password"
                        showValid
                        onChange={value => {
                          this.setState({ password: value });
                        }}
                      />
                      <Button
                        onClick={this.goBack.bind(this)}
                        variant="backgroundNone"
                        className="modal_navleft"
                      >
                        Cancel <span>></span>
                      </Button>
                      <Button
                        onClick={this.onSubmit.bind(this)}
                        variant="backgroundNone"
                        className="modal_navright"
                      >
                        Import Seed <span>></span>
                      </Button>
                    </form>
                  </Modal>
                )}
                <br />
                <p style={{ marginTop: "13vw", marginLeft: "2vw" }}>
                  <strong>{t("enterSeed:neverShare")}</strong>
                </p>
              </div>
              <div className={css.onboard_btn}>
                <Button
                  className="navleft"
                  variant="backgroundNone"
                  to={`/onboarding/seed-${isGenerated ? "backup" : "intro"}`}
                >
                  {t("global:goBack")} <span>></span>
                </Button>
                <Button
                  className="navright"
                  variant="backgroundNone"
                  disabled={seedPhrase == ""}
                  onClick={this.setSeed}
                >
                  {t("global:confirm")} <span>></span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  wallet: state.wallet,
  additionalAccountName: state.accounts.accountInfoDuringSetup.name,
  additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta
});
const mapDispatchToProps = {
  setAccountInfoDuringSetup,
  generateAlert,
  additionalAccountName: Electron.getOnboardingName()
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(SeedImport));
