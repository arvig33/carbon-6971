import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { dlsThemeSelector, classicThemeSelector } from '../../../../.storybook/theme-selectors';
import OptionsHelper from '../../../utils/helpers/options-helper';
import PresenceValidation from '../../../utils/validations/presence';
import notes from './documentation/notes.md';
import Info from './documentation/Info';
import Form, { FormWithoutValidations } from '.';
import Textbox from '../textbox';
import Button from '../../../components/button';
import Link from '../../../components/link';
import getDocGenInfo from '../../../utils/helpers/docgen-info';
import Fieldset from '../fieldset/fieldset.component';

const DeprecationWarning = () => (
  <div style={ {
    backgroundColor: 'red', textAlign: 'center', color: 'white', padding: 20, fontWeight: 'bold', marginBottom: 10
  } }
  >
    Form and validations have been deprecated please see <a href='https://github.com/Sage/carbon/pull/2481'>#2481</a>
  </div>
);
Form.__docgenInfo = getDocGenInfo(
  require('./docgenInfo.json'),
  /form\.component(?!spec)/
);

const additionalFormActions = (innerText) => {
  return {
    Button: <Button onClick={ ev => action(`${innerText} Button`)(ev) }>{ innerText }</Button>,
    Link: (
      <Link
        onClick={ ev => action(`${innerText} Link`)(ev) }
        href='./?path=/story/experimental-form--default'
      >
        { innerText }
      </Link>
    )
  };
};

function makeStory(name, themeSelector, disableChromatic = false) {
  const component = () => {
    const formActionOptions = ['', ...OptionsHelper.actionOptions];
    const unsavedWarning = boolean('unsavedWarning', true);
    const save = boolean('save', true);
    const cancel = boolean('cancel', true);
    const buttonAlign = select(
      'buttonAlign',
      OptionsHelper.alignBinary,
      FormWithoutValidations.defaultProps.buttonAlign
    );
    const saving = boolean('saving', false);
    const cancelText = text('cancelText', '');
    const stickyFooter = boolean('stickyFooter', false);
    const stickyFooterPadding = text('stickyFooterPadding', '');
    const autoDisable = boolean('autoDisable', false);
    const saveText = text('saveText', '');
    const additionalActions = select('additionalActions', formActionOptions, formActionOptions[0]);
    const leftAlignedActions = select('leftAlignedActions', formActionOptions, formActionOptions[0]);
    const rightAlignedActions = select('rightAlignedActions', formActionOptions, formActionOptions[0]);
    const showSummary = boolean('showSummary', FormWithoutValidations.defaultProps.showSummary);
    const inLineLabels = boolean('inLineLabels', false);
    const isLabelRightAligned = inLineLabels ? boolean('isLabelRightAligned', false) : undefined;

    return (
      <>
        <DeprecationWarning />
        <Form
          unsavedWarning={ unsavedWarning }
          cancel={ cancel }
          buttonAlign={ buttonAlign }
          saving={ saving }
          stickyFooter={ stickyFooter }
          stickyFooterPadding={ stickyFooterPadding }
          autoDisable={ autoDisable }
          cancelText={ cancelText }
          saveText={ saveText }
          save={ save }
          additionalActions={ additionalFormActions('Additional Action')[additionalActions] }
          leftAlignedActions={ additionalFormActions('Left Action')[leftAlignedActions] }
          rightAlignedActions={ additionalFormActions('Right Action')[rightAlignedActions] }
          showSummary={ showSummary }
          onSubmit={ (ev) => {
            action('submit')(ev);
            window.location.href = window.location.href;
          } }
          isLabelRightAligned={ isLabelRightAligned }
        >
          <Textbox
            key='0'
            label='Full Name'
            labelInline={ inLineLabels }
            labelAlign='right'
            validations={ [new PresenceValidation()] }
          />
          <Textbox
            key='1'
            label='Role'
            labelInline={ inLineLabels }
            labelAlign='right'
            isOptional
          />
        </Form>
      </>
    );
  };

  const metadata = {
    themeSelector,
    chromatic: {
      disable: disableChromatic
    }
  };

  return [name, component, metadata];
}

function makeFieldsetTextboxStory(name, themeSelector, disableChromatic = false) {
  const component = () => {
    const stickyFooter = boolean('stickyFooter', false);
    const legend = text('legend', '');

    return (
      <>
        <DeprecationWarning />
        <Form
          stickyFooter={ stickyFooter }
          onSubmit={ () => {
            window.location.href = window.location.href;
          } }
        >
          <Fieldset
            legend={ legend }
          >
            <Textbox
              label='First Name'
              labelInline
              labelAlign='right'
              inputWidth={ 70 }
            />
            <Textbox
              label='Last Name'
              labelInline
              labelAlign='right'
              inputWidth={ 70 }
            />
            <Textbox
              label='Address'
              labelInline
              labelAlign='right'
              inputWidth={ 70 }
            />
            <Textbox
              label='City'
              labelInline
              labelAlign='right'
              inputWidth={ 70 }
            />
            <Textbox
              label='Country'
              labelInline
              labelAlign='right'
              inputWidth={ 70 }
            />
            <Textbox
              label='Telephone'
              labelInline
              labelAlign='right'
              inputWidth={ 70 }
            />
          </Fieldset>
        </Form>
      </>
    );
  };

  const metadata = {
    themeSelector,
    chromatic: {
      disable: disableChromatic
    }
  };

  return [name, component, metadata];
}

storiesOf('Experimental/Form', module)
  .addParameters({
    info: {
      text: Info,
      propTablesExclude: [Textbox],
      includePropTables: [Form]
    },
    notes: { markdown: notes },
    knobs: { escapeHTML: false }
  })
  .add(...makeStory('default', dlsThemeSelector))
  .add(...makeStory('classic', classicThemeSelector, true))
  .add(...makeFieldsetTextboxStory('fieldset > textbox', dlsThemeSelector))
  .add(...makeFieldsetTextboxStory('fieldset > textbox classic', classicThemeSelector, true));
