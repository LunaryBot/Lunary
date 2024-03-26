import {
	RuleConfigCondition,
	RuleConfigSeverity,
	RulesConfig,
	TargetCaseType,
} from '@commitlint/types';

export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			RuleConfigSeverity.Error,
			'always',
			[
				'build',
				'chore',
				'ci',
				'docs',
				'feat',
				'fix',
				'package',
				'perf',
				'refactor',
				'revert',
				'style',
				'test',
			],
		],
	},
};