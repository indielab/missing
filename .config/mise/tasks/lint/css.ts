#!/usr/bin/env -S deno run -A --no-lock --node-modules-dir=none

import stylelint from 'npm:stylelint';
import standardConfig from 'npm:stylelint-config-standard';
import stylistic from 'npm:@stylistic/stylelint-plugin';
import logicalPlugin from 'npm:stylelint-use-logical';
import browserCompat from 'npm:stylelint-browser-compat';
import orderPlugin from 'npm:stylelint-order';
import propertyGroups from 'npm:stylelint-config-recess-order/groups';
import { resolve } from 'jsr:@std/path/resolve'

const cssFiles = Deno.env.has('STAGED')
  ? Deno.env.get('STAGED').split(' ').filter(fn => fn.endsWith('.css'))
  : ['src/**/*.css']
if (cssFiles.length === 0) Deno.exit()

const result = await stylelint.lint({
  cwd: resolve(import.meta.dirname, '../../../..'),
  files: cssFiles,
  formatter: 'string',
  fix: true,
  config: {
    plugins: [
      stylistic,
      logicalPlugin,
      browserCompat,
      orderPlugin,
    ],
    rules: {
      // ...standardConfig.rules,
      'selector-attribute-quotes': 'never',
      'selector-class-pattern': '^(\\<|-|[a-z])([a-z0-9]|\\:|@|-|\\%)*(\\>)?$',
      'block-no-empty': null,
      '@stylistic/indentation': 2,
      '@stylistic/declaration-colon-space-after': null,
      '@stylistic/no-eol-whitespace': true,
      '@stylistic/block-closing-brace-empty-line-before': 'never',

      // Disable auto-fix for the following:
      'declaration-block-no-redundant-longhand-properties': [true, { disableFix: true }],
      'declaration-block-no-duplicate-properties': [true, { disableFix: true }],
      'declaration-block-no-duplicate-custom-properties': [true, { disableFix: true }],
      'no-duplicate-selectors': [true, { disableFix: true }],
      'csstools/use-logical': [true, { disableFix: true }],

      /** WIP: Use recess ordering
      'declaration-empty-line-before': 'never',
      'custom-property-empty-line-before': 'never',
      'order/properties-order': propertyGroups,
      */

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
