import React from "react";
import PropTypes from "prop-types";
import Box from "../box";
import Help from "../help";
import Link from "../link";
import Typography from "../typography";
import tagComponent from "../../utils/helpers/tags";
import {
  StyledHeading,
  StyledHeadingIcon,
  StyledSubHeader,
  StyledHeader,
  StyledSeparator,
  StyledDivider,
  StyledHeaders,
  StyledHeaderLink,
  StyledHeaderHelp,
} from "./heading.style";

class Heading extends React.Component {
  static propTypes = {
    /**
     * Children elements
     */
    children: PropTypes.node,

    /**
     * Custom className
     */
    className: PropTypes.string,

    /**
     * Defines the title for the heading.
     */
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /**
     * Defines the title id for the heading.
     */
    titleId: PropTypes.string,

    /**
     * Defines the subheader for the heading.
     */
    subheader: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /**
     * Defines the subtitle id for the heading.
     */
    subtitleId: PropTypes.string,

    /**
     * Defines the help text for the heading.
     */
    help: PropTypes.string,

    /**
     * Defines the help link for the heading.
     */
    helpLink: PropTypes.string,

    /**
     * Defines the a href for the back link.
     */
    backLink: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /**
     * Adds a divider below the heading and the content.
     */
    divider: PropTypes.bool,

    /**
     * Adds a separator between the title and the subheader.
     */
    separator: PropTypes.bool,
  };

  static defaultProps = {
    divider: true,
    separator: false,
  };

  /**
   * Returns the help component.
   *
   * @method help
   * @return {Object} JSX
   */
  get help() {
    if (!this.props.help && !this.props.helpLink) {
      return null;
    }

    return (
      <StyledHeaderHelp>
        <Help
          data-element="help"
          tooltipPosition="right"
          href={this.props.helpLink}
        >
          {this.props.help}
        </Help>
      </StyledHeaderHelp>
    );
  }

  /**
   * Returns the back button.
   *
   * @method back
   * @return {Object} JSX
   */
  get back() {
    if (!this.props.backLink) {
      return null;
    }

    let props;

    if (typeof this.props.backLink === "string") {
      props = { href: this.props.backLink };
    } else {
      props = { onClick: this.props.backLink };
    }

    return (
      <StyledHeaderLink>
        <Link
          // this event allows an element to be focusable on click event on IE
          onMouseDown={(e) => e.currentTarget.focus()}
          data-element="back"
          {...props}
        >
          <StyledHeadingIcon type="chevron_left" divider={this.props.divider} />
        </Link>
      </StyledHeaderLink>
    );
  }

  /**
   * Returns the subheader.
   *
   * @method subheader
   * @return {Object} JSX
   */
  get subheader() {
    if (!this.props.subheader) {
      return null;
    }

    return (
      <StyledSubHeader data-element="subtitle" id={this.props.subtitleId}>
        {this.props.subheader}
      </StyledSubHeader>
    );
  }

  /**
   * Returns the separator if enabled and needed.
   *
   * @method separator
   * @return {Object} JSX
   */
  get separator() {
    return this.props.separator ? <StyledSeparator /> : null;
  }

  /**
   * Returns the separator if enabled and needed.
   *
   * @method divider
   * @return {Object} JSX
   */
  get divider() {
    return this.props.divider ? <StyledDivider /> : null;
  }

  /**
   * @method render
   * @return {Object} JSX
   */
  render() {
    if (!this.props.title) {
      return null;
    }

    return (
      <StyledHeading
        divider={this.props.divider}
        subheader={this.props.subheader}
        {...tagComponent("heading", this.props)}
      >
        <StyledHeader>
          {this.back}

          <StyledHeaders back={this.props.backLink}>
            <Box>
              <Typography
                variant="h1"
                as="span"
                lineHeight="32px"
                data-element="title"
                id={this.props.titleId}
              >
                {this.props.title}
              </Typography>
              {this.help}
            </Box>
            {this.separator}
            {this.subheader}
          </StyledHeaders>
        </StyledHeader>
        {this.divider}
        {this.props.children}
      </StyledHeading>
    );
  }
}

export default Heading;
