import React, {useEffect} from 'react';
import {AccentButton} from '../../../../inputs/accent-button';
import {getMacroValidator} from 'src/utils/macro-api';
import {ControlRow, Label, Detail} from '../../../grid';
import {AccentSlider} from '../../../../inputs/accent-slider';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import {
  AutocompleteItem,
  AutocompleteLoading,
  findKeycodes,
} from '../../../../../components/inputs/autocomplete-keycode';
import {ErrorMessage} from '../../../../styled';
import styled from 'styled-components';

const TextArea = styled.textarea`
  box-sizing: border-box;
  background: var(--bg_control);
  padding: 5px 10px;
  border-color: var(--border_color_icon);
  color: var(--color_label);
  width: 100%;
  height: 200px;
  font-size: 16px;
  line-height: 18px;
  resize: none;
  font-family: 'Source Code Pro';
  font-weight: 500;
  &::placeholder {
    color: var(--color_label);
  }
  &:focus {
    color: var(--color_accent);
    outline-color: var(--color_accent);
  }
`;

const ToastErrorMessage = styled(ErrorMessage)`
  margin: 0;
  width: 100%;
  font-size: 14px;
  display: block;
  &:empty {
    display: none;
  }
`;

const Message = styled.div`
  color: var(--color_accent);
`;

const Link = styled.a`
  font-size: 18x !important;
  color: var(--color_accent);
  text-decoration: underline;
`;

const DescriptionLabel = styled(Label)`
  margin: 1em 0;
  font-size: 14px;
  line-height: 18px;
  font-style: oblique;
  padding-left: 5px;
`;

const AutoHeightRow = styled(ControlRow)`
  height: auto;
`;

export const ScriptMode: React.FC<{
  macro: string;
  protocol: number;
  setUnsavedMacro: (macro: string) => void;
  saveMacros: (val: string) => void;
  macroIndex: number;
  isDelaySupported: boolean;
}> = ({
  macro,
  protocol,
  setUnsavedMacro,
  saveMacros,
  macroIndex,
  isDelaySupported,
}) => {
  const trimmedMacro = macro.trimEnd();
  const [currentValue, setCurrentValue] = React.useState(trimmedMacro);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setUnsavedMacro(currentValue);
  }, [currentValue]);

  const saveMacro = () => {
    const validate = getMacroValidator(protocol);
    const validationResult = validate(currentValue);
    if (validationResult.isValid) {
      saveMacros(currentValue);
      setErrorMessage(undefined);
    } else {
      setErrorMessage(validationResult.errorMessage);
    }
  };
  const hasError = errorMessage !== undefined;
  return (
    <>
      <AutoHeightRow>
        <ReactTextareaAutocomplete
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          loadingComponent={AutocompleteLoading}
          style={{
            fontSize: '16px',
            lineHeight: '18px',
            width: '100%',
            height: '140px',
            fontFamily: 'monospace',
            resize: 'none',
            borderColor: hasError
              ? 'var(--color_error)'
              : 'var(--border_color_icon)',
          }}
          containerStyle={{
            border: 'none',
            lineHeight: '20px',
          }}
          itemStyle={{
            borderColor: 'var(--border_color_cell)',
            backgroundColor: 'var(--bg_menu)',
          }}
          dropdownStyle={{
            zIndex: 999,
            backgroundColor: 'var(--bg_menu)',
          }}
          listStyle={{
            position: 'fixed',
            backgroundColor: 'var(--bg_menu)',
            maxHeight: '210px',
            overflow: 'auto',
            border: '1px solid var(--border_color_cell)',
          }}
          minChar={0}
          textAreaComponent={TextArea as any}
          movePopupAsYouType={true}
          placeholder={`在这里输入宏 M${macroIndex}...`}
          trigger={{
            '?': {
              dataProvider: findKeycodes,
              component: AutocompleteItem,
              output: (item: any) => ({
                text: item.code,
                caretPosition: 'end',
              }),
            },
            '{': {
              dataProvider: findKeycodes,
              component: AutocompleteItem,
              output: (item: any) => ({
                text: `{${item.code},`,
                caretPosition: 'end',
              }),
            },
            ',': {
              dataProvider: findKeycodes,
              component: AutocompleteItem,
              output: (item: any) => {
                return {
                  text: `,${item.code},`,
                  caretPosition: 'end',
                };
              },
            },
          }}
        />
      </AutoHeightRow>
      <AutoHeightRow>
        <DescriptionLabel>
          <ToastErrorMessage>{errorMessage}</ToastErrorMessage>
          <Message>
            直接输入文本，或者键码{' '}
            <Link href="https://docs.qmk.fm/#/keycodes_basic" target="_blank">
                基础键码
            </Link>{' '}
            在 {'{}'}内
          </Message>
          <Message>单击: {'{KC_XXX}'}</Message>
          <Message>组合键: {'{KC_XXX, KC_YYY, KC_ZZZ}'}</Message>
          <Message>按键按下: {`{+KC_XXX}`}</Message>
          <Message>按键弹起: {`{-KC_XXX}`}</Message>
          {isDelaySupported ? (
            <Message>延时 (ms): {'{NNNN}'} </Message>
          ) : (
            '升级固件才可以使用延迟'
          )}
          <Message>输入 ? 搜索键码</Message>
        </DescriptionLabel>
        <Detail>
          <AccentButton disabled={macro === currentValue} onClick={saveMacro}>
          保存
          </AccentButton>
        </Detail>
      </AutoHeightRow>
    </>
  );
};
