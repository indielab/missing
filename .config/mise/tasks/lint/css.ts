#!/usr/bin/env -S deno run -A --no-lock --node-modules-dir=none

import stylelint from 'npm:stylelint';
import standardConfig from 'npm:stylelint-config-standard';
import stylistic from 'npm:@stylistic/stylelint-plugin';
import logicalPlugin from 'npm:stylelint-use-logical';
import browserCompat from 'npm:stylelint-browser-compat';
import { resolve } from 'jsr:@std/path/resolve'

const result = await stylelint.lint({
  cwd: resolve(import.meta.dirname, '../../../..'),
  files: 'src/**/*.css',
  formatter: 'string',
  fix: true,
  config: {
    plugins: [
      stylistic,
      logicalPlugin,
      browserCompat,
    ],
    rules: {
      // ...standardConfig.rules,
      'selector-attribute-quotes': 'never',
      'selector-class-pattern': '^(\\<|-|[a-z])([a-z0-9]|\\:|@|-|\\%)*(\\>)?$',

      '@stylistic/indentation': 2,
      '@stylistic/declaration-colon-space-after': null,
      '@stylistic/no-eol-whitespace': true,
      '@stylistic/block-closing-brace-empty-line-before': 'never',

      'declaration-block-no-redundant-longhand-properties': [true, { disableFix: true }],
      'declaration-block-no-duplicate-properties': [true, { disableFix: true }],
      'declaration-block-no-duplicate-custom-properties': [true, { disableFix: true }],
      'no-duplicate-selectors': [true, { disableFix: true }],
      'csstools/use-logical': [true, { disableFix: true }],

      'plugin/browser-compat': [
        true,
        {
          allow: {
            features: [
              'at-rules.supports',
              'properties.scrollbar-color',  // Safari 26.2 DOES support this
            ],
            flagged: false,
            partialImplementation: false,
            prefix: true,
          },
          browserslist: [Deno.env.get("BROWSERSLIST")],
        },
      ],
    },
  },
});

if (result.errored) {
  console.log(result.report);
  Deno.exit(1);
}
