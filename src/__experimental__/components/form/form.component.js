import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import I18n from 'i18n-js';
import Serialize from 'form-serialize';
import { kebabCase } from 'lodash';

import CancelButton from './cancel-button';
import FormSummary from './form-summary';
import SaveButton from './save-button';
import AppWrapper from '../../../components/app-wrapper';

import { validProps } from '../../../utils/ether';
import tagComponent from '../../../utils/helpers/tags';
import Browser from '../../../utils/helpers/browser';

import { withValidations } from '../../../components/validations';
import ElementResize from '../../../utils/helpers/element-resize';
import './form.scss';

class FormWithoutValidations extends React.Component {
  state = {
    /** Tracks if the form is clean or dirty, used by unsavedWarning */
    isDirty: false,
    /** Tracks if the saveButton should be disabled */
    submitted: false,
    /** Stores state of form data */
    formInputs: {}
  }

  /**
   * Returns form object to child components.
   */
  getChildContext = () => {
    return {
      form: {
        getActiveInput: this.getActiveInput,
        setIsDirty: this.setIsDirty,
        resetIsDirty: this.resetIsDirty,
        setActiveInput: this.setActiveInput
      }
    };
  }

  /**
   * Runs once the component has mounted.
   */
  componentDidMount() {
    if (this.props.stickyFooter) {
      this.addStickyFooterListeners();
    }

    if (this.props.validateOnMount && this.props.validate) {
      this.props.validate();
    }

    if (this.props.unsavedWarning) {
      this.addUnsavedWarningListener();
    }

    if (this.props.redirectUrl) this.redirectUrl = this.props.redirectUrl;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stickyFooter && !this.props.stickyFooter) {
      this.addStickyFooterListeners();
    }

    if (!nextProps.stickyFooter && this.props.stickyFooter) {
      this.removeStickyFooterListeners();
    }

    if (nextProps.unsavedWarning && !this.props.unsavedWarning) {
      this.addUnsavedWarningListener();
    }

    if (!nextProps.unsavedWarning && this.props.unsavedWarning) {
      this.removeUnsavedWarningListener();
    }
  }

  componentWillUnmount() {
    if (this.props.stickyFooter) {
      this.removeStickyFooterListeners();
    }

    if (this.props.unsavedWarning) {
      this.removeUnsavedWarningListener();
    }
  }

  /**
   * Gets the current active input.
   */
  getActiveInput = () => {
    return this.activeInput;
  }

  /**
   * Sets the active input, calling the hide method if the input is
   * different from the last (so as to instantly) switch.
   */
  setActiveInput = (input) => {
    this.activeInput = input;
  }

  /**
   * Sets the form to Dirty
   */
  setIsDirty = () => {
    if (!this.state.isDirty) {
      this.setState({ isDirty: true });
    }
  }

  /**
   * Sets the form to Clean
   */
  resetIsDirty = () => {
    if (this.state.isDirty) {
      this.setState({ isDirty: false });
    }
  }

  addStickyFooterListeners = () => {
    this.checkStickyFooter();
    ElementResize.addListener(this._form, this.checkStickyFooter);
    this._window.addEventListener('resize', this.checkStickyFooter);
    this._window.addEventListener('scroll', this.checkStickyFooter);
  }

  removeStickyFooterListeners = () => {
    ElementResize.removeListener(this._form, this.checkStickyFooter);
    this._window.removeEventListener('resize', this.checkStickyFooter);
    this._window.removeEventListener('scroll', this.checkStickyFooter);
  }

  checkStickyFooter = () => {
    if (!this._form) { return; }

    let offsetTop = 0,
        element = this._form;

    while (element) {
      offsetTop += element.offsetTop;
      element = element.offsetParent;
    }

    const formHeight = (offsetTop + this._form.offsetHeight) - this._window.pageYOffset;

    if (!this.state.stickyFooter && formHeight > this._window.innerHeight) {
      this.setState({ stickyFooter: true });
    } else if (this.state.stickyFooter && formHeight < this._window.innerHeight) {
      this.setState({ stickyFooter: false });
    }
  }

  addUnsavedWarningListener = () => {
    this._window.addEventListener('beforeunload', this.checkIsFormDirty);
  }

  removeUnsavedWarningListener = () => {
    this._window.removeEventListener('beforeunload', this.checkIsFormDirty);
  }

  // This must return undefined for IE and Safari if we don't want a warning
  /* eslint-disable consistent-return */
  checkIsFormDirty = (ev) => {
    if (this.state.isDirty) {
      // Confirmation message is usually overridden by browsers with a similar message
      const confirmationMessage = I18n.t('form.save_prompt',
        { defaultValue: 'Do you want to leave this page? Changes that you made may not be saved.' });
      ev.returnValue = confirmationMessage; // Gecko + IE
      return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
    }
  }
  /* eslint-enable consistent-return */

  /**
   * stores the document - allows us to override it different contexts, such as  when running tests.
   */
  _document = Browser.getDocument();

  /**
   * stores the window - allows us to override it different contexts, such as when running tests.
   */
  _window = Browser.getWindow();

  /**
   * Sets the page to load on submit of form.
   */
  redirectUrl = this._window.location.href;

  /**
   * Handles submit and runs validation.
   */
  handleOnSubmit = async (ev) => {
    ev.preventDefault();

    if (this.props.autoDisable) {
      this.setState({ submitted: true });
    }

    if (this.props.beforeFormValidation) {
      this.props.beforeFormValidation(ev);
    }

    const valid = await this.props.validate();

    if (this.props.afterFormValidation) {
      this.props.afterFormValidation(ev, valid, this.enableForm);
    }

    if (valid) {
      this.resetIsDirty();
      this.triggerSubmit(ev, valid);
    } else {
      this.setState({ submitted: false });
    }
  }

  triggerSubmit(ev, valid) {
    if (this.props.onSubmit) {
      this.props.onSubmit(ev, valid, this.enableForm);
    } else if (this.state.formInputs) {
      this.addOtherInputsToState();
    } else {
      this._form.submit();
    }
  }

  /**
   * Add all inputs to state so that all are submitted.
   */
  addOtherInputsToState() {
    Object.keys(this._form.elements).forEach((id) => {
      const { name, value, type } = this._form.elements[id];
      const inputName = type === 'hidden' && id === '0' ? 'csrf-token' : name;

      if (!this.state.formInputs[inputName] && !['button', 'submit'].includes(type)) {
        this.addInputDataToState(inputName, value);
      }
    });
    this.submitForm();
  }

  submitForm() {
    fetch(this.props.formAction, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify(this.state.formInputs)
    }).then((response) => {
      if (![200, 201, 202].includes(response.status)) {
        throw new Error(response.statusText);
      }
      return response.json();
    }).then(() => this.clearFormData())
      .catch(error => Promise.reject(error));
  }

  clearFormData() {
    this._window.location.href = this.redirectUrl;
    this.setState({ formInputs: {}, submitted: true });
  }

  /**
   * enables a form which has been disabled after being submitted.
   */
  enableForm = () => {
    this.setState({ submitted: false });
  }

  /**
   * Serializes the inputs in the form ready for submission via AJAX
   * https://www.npmjs.com/package/form-serialize
   *
   */
  serialize = (opts) => {
    return Serialize(this._form, opts);
  }

  /**
   * Separates and returns HTML specific props
   *
   */
  htmlProps = () => {
    const { onSubmit, ...props } = validProps(this);
    props.className = this.mainClasses;
    return props;
  }

  /**
   * Redirects to the previous page; uses React Router history, or uses modalcancel handler.
   */
  cancelForm = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    } else if (this.context.modal) {
      this.context.modal.onCancel();
    } else {
      // history comes from react router
      if (!this._window.history) {
        throw new Error('History is not defined. This is normally configured by the react router');
      }
      this._window.history.back();
    }
  }

  /**
   * Gets the cancel button for the form
   */
  cancelButton = () => {
    if (!this.props.cancel) { return null; }

    const cancelProps = {
      cancelText: this.props.cancelText,
      cancelClick: this.cancelForm,
      ...this.props.cancelButtonProps
    };

    return (
      <CancelButton
        data-element='cancel'
        { ...cancelProps }
      />
    );
  }

  /**
   * Gets any additional actions passed into the form
   */
  additionalActions = (type) => {
    if (!this.props[type]) { return null; }

    return (
      <div className={ `carbon-form__${kebabCase(type)}` }>
        { this.props[type] }
      </div>
    );
  }

  /**
   * The default Save button for the form
   */
  defaultSaveButton = () => {
    return (
      <SaveButton
        saveButtonProps={ this.props.saveButtonProps }
        saveText={ this.props.saveText }
        saving={ this.props.isValidating || this.props.saving || this.state.submitted }
      />
    );
  }

  /**
   * Returns a custom save button if passed in
   * the default if not
   */
  saveButton = () => {
    if (!this.props.save) { return null; }

    return this.props.customSaveButton ? this.props.customSaveButton : this.defaultSaveButton();
  }

  /**
   * Returns a form summary
   */
  saveButtonWithSummary = () => {
    return (
      <FormSummary
        className='carbon-form__summary'
        errors={ this.props.errorCount }
        warnings={ this.props.warningCount }
      >
        { this.saveButton() }
      </FormSummary>
    );
  }

  /**
   * Returns the footer for the form
   */
  formFooter = () => {
    const save = this.props.showSummary ? this.saveButtonWithSummary() : this.saveButton();
    let padding = this.props.stickyFooterPadding;

    if (padding && !padding.match(/px$/)) {
      padding = `${padding}px`;
    }

    return (
      <div className='carbon-form__footer-wrapper'>
        <AppWrapper className={ this.footerClasses } style={ { borderWidth: padding } }>
          { this.additionalActions('leftAlignedActions') }
          { this.additionalActions('rightAlignedActions') }
          { save }
          { this.cancelButton() }
          { this.additionalActions('additionalActions') }
        </AppWrapper>
      </div>
    );
  }

  /**
   * Main class getter
   */
  get mainClasses() {
    return classNames(
      'carbon-form',
      this.props.className, {
        'carbon-form--sticky-footer': this.state.stickyFooter
      }
    );
  }

  /**
   * Button class getter
   */
  get footerClasses() {
    return classNames(
      'carbon-form__buttons',
      `carbon-form__buttons--${this.props.buttonAlign}`
    );
  }

  /**
   * Store children controlled data in state
   */
  addInputDataToState = (name, value) => {
    this.setState(prevState => ({
      formInputs: {
        ...prevState.formInputs,
        [name]: value
      }
    }));
  }

  /**
   * Clone the children, pass in callback to allow form to store controlled data
   */
  renderChildren() {
    const { children } = this.props;

    if (!children) return null;

    const childrenArray = Array.isArray(children) ? children : [children];

    return childrenArray.map((child) => {
      return React.cloneElement(child, { ...child.props, addInputToFormState: this.addInputDataToState });
    });
  }

  /**
   * Renders the component.
   */
  render() {
    return (
      <form
        onSubmit={ this.handleOnSubmit }
        { ...this.htmlProps() }
        ref={ (form) => { this._form = form; } }
        { ...tagComponent('form', this.props) }
      >
        { generateCSRFToken(this._document) }

        { this.renderChildren() }

        { this.formFooter() }
      </form>
    );
  }
}

/**
 * Creates and returns CSRF token for input field
 */
function generateCSRFToken(doc) {
  const csrfParam = doc.querySelector('meta[name="csrf-param"]');
  const csrfToken = doc.querySelector('meta[name="csrf-token"]');

  const csrfAttr = csrfParam ? csrfParam.getAttribute('content') : '';
  const csrfValue = csrfToken ? csrfToken.getAttribute('content') : '';

  return (
    <input
      type='hidden' name={ csrfAttr }
      value={ csrfValue } readOnly
    />
  );
}

FormWithoutValidations.propTypes = {

  /** Warning popup shown when trying to navigate away from an edited form if true */
  unsavedWarning: PropTypes.bool,

  /** Cancel button is shown if true */
  cancel: PropTypes.bool,

  /** Custom function that is called immediately
   * after the form validates */
  afterFormValidation: PropTypes.func,

  /** Custom function that is called immediately
   * before the form validates */
  beforeFormValidation: PropTypes.func,

  /** Alignment of submit button */
  buttonAlign: PropTypes.string,

  /** Determines if the form is in a saving state */
  saving: PropTypes.bool,

  /** Enables the sticky footer. */
  stickyFooter: PropTypes.bool,

  /** Applies additional padding to the sticky footer, useful to align buttons. */
  stickyFooterPadding: PropTypes.string,

  /** If true, will validate the form on mount */
  validateOnMount: PropTypes.bool,

  /** If true, will disable the savebutton when clicked */
  autoDisable: PropTypes.bool,

  /** Text for the cancel button */
  cancelText: PropTypes.string,

  /** Properties for the cancel button */
  cancelButtonProps: PropTypes.object,

  /** Text for the save button */
  saveText: PropTypes.string,

  /** Properties for the save button */
  saveButtonProps: PropTypes.object,

  /** Custom function for Cancel button onClick */
  onCancel: PropTypes.func,

  /** Hide or show the save button */
  save: PropTypes.bool,

  /** Additional actions rendered next to the save and cancel buttons */
  additionalActions: PropTypes.node, // eslint-disable-line react/no-unused-prop-types

  /** Additional actions rendered and aligned left to the save and cancel buttons */
  leftAlignedActions: PropTypes.node, // eslint-disable-line react/no-unused-prop-types

  /** Additional actions rendered and aligned right to the save and cancel buttons */
  rightAlignedActions: PropTypes.node, // eslint-disable-line react/no-unused-prop-types

  /** Custom callback for when form will submit */
  onSubmit: PropTypes.func,

  /** Override Save Button */
  customSaveButton: PropTypes.node,

  /** A custom class name for the component. */
  className: PropTypes.string,

  /** Child elements */
  children: PropTypes.node,

  /** Hide or show the summary */
  showSummary: PropTypes.bool,

  /** A function used to handle form validation */
  validate: PropTypes.func,

  /** Determines if the form is a validating state and should be disabled from submiting */
  isValidating: PropTypes.bool,

  /** The total number of errors present in the form */
  errorCount: PropTypes.number,

  /** The total number of warnings present in the form */
  warningCount: PropTypes.number,

  /** The total number of infos present in the form */
  infoCount: PropTypes.number,

  /** Strores the state of controlled inputs */
  formInputs: PropTypes.shape({
    value: PropTypes.string,
    name: PropTypes.string
  }),

  /** The action for the default form submission of controlled inputs */
  formAction(props, propName) {
    if ((!props.onSubmit && (props[propName] === undefined || typeof (props[propName]) !== 'string'))) {
      throw new Error('A form action is required if no onSubmit prop is passed');
    }
  },

  redirectUrl: PropTypes.string
};

FormWithoutValidations.defaultProps = {
  buttonAlign: 'right',
  cancel: true,
  unsavedWarning: true,
  save: true,
  saving: false,
  validateOnMount: false,
  customSaveButton: null,
  showSummary: true
};

FormWithoutValidations.childContextTypes = {
  /**
   * Defines a context object for child components of the form component.
   * https://facebook.github.io/react/docs/context.html
   *
   * @property form
   * @type {Object}
   */
  form: PropTypes.object
};

FormWithoutValidations.contextTypes = {
  modal: PropTypes.object
};

const Form = withValidations(FormWithoutValidations);

export { FormWithoutValidations }; // export version without hoc if required
export default Form;
