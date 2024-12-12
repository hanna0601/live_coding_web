import React, { useEffect, useRef } from 'react';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { getLanguageCompletions } from './languageCompletion';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { StreamLanguage } from '@codemirror/language';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { swift } from '@codemirror/legacy-modes/mode/swift';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

const languageExtensions: { [key: string]: () => Extension } = {
  node: javascript,
  typescript: () => javascript({ typescript: true }),
  python3: python,
  java: java,
  c: cpp,
  cpp: cpp,
  csharp: cpp,
  ruby: () => StreamLanguage.define(ruby),
  php: php,
  swift: () => StreamLanguage.define(swift),
  rust: rust,
  scala: java,
};

const customHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--editor-keyword)" },
  { tag: tags.comment, color: "var(--editor-comment)", fontStyle: "italic" },
  { tag: tags.string, color: "var(--editor-string)" },
  { tag: tags.function(tags.variableName), color: "var(--editor-function)" },
  { tag: tags.number, color: "var(--editor-number)" },
  { tag: tags.operator, color: "var(--editor-operator)" },
  { tag: tags.bracket, color: "var(--editor-foreground)" },
  { tag: tags.propertyName, color: "var(--editor-property)" },
  { tag: tags.typeName, color: "var(--editor-type)" },
  { tag: tags.className, color: "var(--editor-class)" },
  { tag: tags.definition(tags.variableName), color: "var(--editor-definition)" },
  { tag: tags.variableName, color: "var(--editor-variable)" },
]);

// Custom theme configuration
const customTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, monospace',
    backgroundColor: 'var(--editor-background)',
  },
  '.cm-content': {
    caretColor: 'var(--editor-foreground)',
    color: 'var(--editor-foreground)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--editor-foreground)',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--editor-foreground)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--editor-background)',
    color: 'var(--editor-gutter)',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--editor-activeLine)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--editor-activeLine)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'var(--editor-selectionMatch)',
  },
  // 补全提示框样式
  '.cm-tooltip': {
    backgroundColor: 'var(--completion-background)',
    border: '1px solid var(--tooltip-border)',
    borderRadius: '4px',
  },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    '& > ul': {
      fontFamily: 'JetBrains Mono, monospace',
      maxHeight: '300px',
      color: 'var(--completion-foreground)',
    },
    '& > ul > li': {
      padding: '2px 1em 2px 3px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: 'var(--completion-selected-background)',
      color: 'var(--completion-foreground)',
    },
  },
  '.cm-tooltip.cm-completionInfo': {
    backgroundColor: 'var(--tooltip-background)',
    color: 'var(--tooltip-foreground)',
    border: '1px solid var(--tooltip-border)',
    padding: '8px',
  },
});

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language }) => {
  const editor = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView>();

  useEffect(() => {
    const langExtension = languageExtensions[language] ? languageExtensions[language]() : [];
  const completionSource = getLanguageCompletions(language);
  
  const state = EditorState.create({
    doc: value,
    extensions: [
      basicSetup,
      langExtension,
      customTheme,
      syntaxHighlighting(customHighlightStyle),
      keymap.of([indentWithTab]),
      autocompletion({
        override: completionSource ? [completionSource] : undefined,
        defaultKeymap: true,
        maxRenderedOptions: 50,
        activateOnTyping: true,
      }),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange(v.state.doc.toString());
        }
      }),
    ],
  });

    if (editor.current) {
      if (editorView.current) {
        editorView.current.setState(state);
      } else {
        editorView.current = new EditorView({
          state,
          parent: editor.current,
        });
      }
    }

    return () => {
      if (editorView.current) {
        editorView.current.destroy();
        editorView.current = undefined;
      }
    };
  }, [language]);

  useEffect(() => {
    if (editorView.current) {
      const currentValue = editorView.current.state.doc.toString();
      if (value !== currentValue) {
        editorView.current.dispatch({
          changes: { from: 0, to: currentValue.length, insert: value },
        });
      }
    }
  }, [value]);

  return <div ref={editor} className="h-full" />;
};

export default CodeEditor;
