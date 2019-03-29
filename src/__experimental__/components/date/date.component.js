import React from 'react';
import I18n from 'i18n-js';
import PropTypes from 'prop-types';
import 'react-day-picker/lib/style.css';
import 'components/date/date.scss';
import Events from 'utils/helpers/events';
import DateHelper from 'utils/helpers/date';
import DateValidator from 'utils/validations/date';
import chainFunctions from 'utils/helpers/chain-functions';
import { validProps } from 'utils/ether';
import tagComponent from 'utils/helpers/tags';
import DatePicker from './datePicker.component';
import Textbox from '../textbox';

/**
 * Stores a reference to the current date in the given format,
 * which can be used for default values.
 *
 * @property _today
 * @type {string}
 */
const today = DateHelper.todayFormatted('YYYY-MM-DD');
/**
 * A Date widget.
 *
 * == How to use a Date in a component:
 *
 * In your file
 *
 *   import Date from 'carbon-react/lib/components/Date';
 *
 * To render the Date:
 *
 *   <Date name="myDate" />
 *
 * @class Date
 * @constructor
 * @decorators {Input,InputIcon,InputLabel,InputValidation}
 */
class Date extends React.Component {
  static propTypes = {
    /** Automatically focus on component mount */
    autoFocus: PropTypes.bool,
    /** Disable all user interaction */
    disabled: PropTypes.bool,
    /** Used to provide additional validations on composed components */
    internalValidations: PropTypes.array,
    /** Minimum possible date */
    minDate: PropTypes.string,
    /** Maximum possible date */
    maxDate: PropTypes.string,
    /** Specify a callback triggered on blur */
    onBlur: PropTypes.func,
    /** Display the currently selected value without displaying the input */
    readOnly: PropTypes.bool,
    /** The current date */
    value: PropTypes.string
  };

  static defaultProps = {
    value: today,
    internalValidations: [new DateValidator()]
  };

  /**
   * Stores the document - allows us to override it different contexts, such as
   * when running tests.
   *
   * @property _document
   * @type {document}
   */
  _document = document;

  blurBlocked = false; // stops the blur callback from triggering (closing the list) when we don't want it to

  state = {
    /** Sets open state of the datepicker */
    open: false,
    /** Keeps track of hidden value */
    datePickerValue: null,
    /** Sets the default value of the decimal field */
    visibleValue: this.formatVisibleValue(this.props.value)
  };

  /**
   * Manually focus if autoFocus is applied - allows us to prevent the list from opening.
   *
   * @method componentDidMount
   */
  componentDidMount() {
    if (this.props.autoFocus) {
      this.blockFocus = true;
      this._input.focus();
    }
  }

  /**
   * A lifecycle method to update the visible value with a formatted version,
   * only when the field is not the active element.
   *
   * @method componentWillReceiveProps
   * @param {Object} nextProps The new props passed down to the component
   * @return {void}
   */
  componentWillReceiveProps(nextProps) {
    if (this._document.activeElement !== this._input) {
      const date = this.formatVisibleValue(nextProps.value);
      this.setState({ visibleValue: date });
    }
  }

  /**
   * A lifecycle method to check whether the component has been updated
   *
   * @method componentDidUpdate
   * @param {Object} prevProps The previous props passed down to the component
   * @return {void}
   */
  componentDidUpdate(prevProps) {
    if (this.datePickerValueChanged(prevProps)) {
      this.unblockBlur();
      this.handleBlur(); // TODO validate
    }
  }

  assignInput = (input) => {
    this._input = input.current;
  };

  blockBlur() {
    this.blurBlocked = true;
  }

  unblockBlur() {
    this.blurBlocked = false;
  }

  handleBlur = (ev) => {
    if (this.blurBlocked) return;

    this.updateVisibleValue();

    if (this.props.onBlur) {
      this.props.onBlur(ev);
    }
  };

  /**
   *  Checks that the datepicker selected value has changed
   *
   * @method datePickerValueChanged
   * @param {Object} prevProps The previous props passed down to the component
   * @return {Boolean}
   */
  datePickerValueChanged = (prevProps) => {
    return this.blurBlocked && this.props.value && prevProps.value !== this.props.value;
  };

  updateDatePickerValue = (newValue) => {
    this.setState({ datePickerValue: DateHelper.stringToDate(newValue) });
  };

  /**
   * Opens the date picker.
   *
   * @method openDatePicker
   * @return {void}
   */
  openDatePicker = () => {
    this.blockBlur();
    this._document.addEventListener('click', this.closeDatePicker);
    this.setState({ open: true });

    if (DateHelper.isValidDate(this.props.value)) {
      this.updateDatePickerValue(this.props.value);
    }
  };

  /**
   * Closes the date picker.
   *
   * @method closeDatePicker
   * @return {void}
   */
  closeDatePicker = () => {
    this._document.removeEventListener('click', this.closeDatePicker);
    this.setState({
      open: false
    });
  };

  /**
   * Updates field with the formatted date value.
   *
   * @method updateVisibleValue
   * @return {void}
   */
  updateVisibleValue = (val) => {
    const date = this.formatVisibleValue(val);
    this.emitOnChangeCallback({ target: { value: date } });
  };

  emitOnChangeCallback = (ev) => {
    this.props.onChange(ev);
  };

  /**
   * Handles user input and updates date picker appropriately.
   *
   * @method handleVisibleInputChange
   * @param {Object} ev Event
   * @return {void}
   */
  handleVisibleInputChange = (ev) => {
    const sanitizedInputValue = DateHelper.sanitizeDateInput(ev.target.value),
        isValidDate = DateHelper.isValidDate(sanitizedInputValue),
        newState = { visibleValue: ev.target.value };

    // Updates the hidden value after first formatting to default hidden format
    if (isValidDate) {
      const formattedValue = DateHelper.formatValue(sanitizedInputValue, this.hiddenInputDateFormat);
      const dateObject = DateHelper.stringToDate(formattedValue);

      newState.datePickerValue = dateObject;
    }

    this.emitOnChangeCallback(ev);
    this.setState(newState);
  };

  /**
   * Sets the value of the input from the date picker.
   *
   * @method handleDateSelect
   * @param {String} val User selected value
   * @return {void}
   */
  handleDateSelect = (val, modifiers) => {
    if (modifiers.disabled) return;
    this.blockBlur();
    this.closeDatePicker();
    this.updateVisibleValue(val);
  };

  /**
   * Opens the datepicker on focus
   *
   * @method handleFocus
   * @return {void}
   */
  handleFocus = () => {
    if (this.blockFocus) {
      this.blockFocus = false;
    } else {
      this.openDatePicker();
    }
  };

  /**
   * Handles specific key down events
   *
   * @method handleKeyDown
   * @param {Object} ev Event
   * @return {void}
   */
  handleKeyDown = (ev) => {
    if (Events.isTabKey(ev)) {
      this.closeDatePicker();
    }
  };

  /**
   * A getter that combines props passed down from the input decorator with
   * date specific props.
   *
   * @method inputProps
   * @return {Object} props for the visible input
   */
  get inputProps() {
    const { ...props } = validProps(this);
    props.className = this.inputClasses;
    props.value = this.props.value;

    delete props.autoFocus;
    delete props.internalValidations;

    return props;
  }

  /**
   * Uses the mainClasses method provided by the decorator to add additional classes
   *
   * @method mainClasses
   * @return {String} Main className
   */
  get mainClasses() {
    return 'carbon-date';
  }

  /**
   * Uses the inputClasses method provided by the decorator to add additional classes.
   *
   * @method inputClasses
   * @return {String} input className
   */
  get inputClasses() {
    return 'carbon-date__input';
  }

  get datePickerProps() {
    return {
      open: this.state.open,
      input: this._input,
      datePickerValue: this.state.datePickerValue
    };
  }

  /**
   * Formats the visible date using i18n
   *
   * @method visibleFormat
   * @return {String} formatted date string
   */
  visibleFormat() {
    return I18n.t('date.formats.javascript', { defaultValue: 'DD/MM/YYYY' }).toUpperCase();
  }

  /**
   * Adds delimiters to the value
   *
   * @method formatVisibleValue
   * @param {String} value Unformatted Value
   * @return {String} formatted visible value
   */
  formatVisibleValue(value) {
    // Don't sanitize so it accepts the hidden format (with dash separators)
    return DateHelper.formatValue(value || today, this.visibleFormat(), {
      formats: this.hiddenInputDateFormat,
      sanitize: false
    });
  }

  /**
   * Renders the component.
   *
   * @method render
   * @return {Object} JSX
   */
  render() {
    const isComponentActive = !this.props.disabled && !this.props.readOnly;
    let events = {};

    if (isComponentActive) {
      events = {
        onBlur: this.handleBlur,
        //onChange: this.handleVisibleInputChange,
        onFocus: chainFunctions(this.handleFocus, this.props.onFocus),
        onKeyDown: this.handleKeyDown,
        onClick: this.handleWidgetClick
      };
    }

    return (
      <Textbox
        className={ this.mainClasses }
        inputRef={ this.assignInput }
        inputIcon='calendar'
        { ...this.inputProps }
        { ...tagComponent('date', this.props) }
        { ...events }
      >
        {this.state.open && <DatePicker { ...this.datePickerProps } />}
      </Textbox>
    );
  }
}

export default Date;
