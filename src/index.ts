import { i18n } from 'i18next'
import debounce from 'just-debounce'

export interface TranslationMap {
	[key: string]: string
}

export type TranslationGetter = (
	/** Array of keys passed to `t()` */
	keys: string[],
	/** Language/locale code */
	language: string,
	/** Translation namespace */
	namespace: string,
	/** Values passed to the `defaultValue` option of `t('some-key', {defaultValue: 'Default value for string'})
	 *
	 *
	 * Object would be:
	 *
	 * ```ts
	 * {'some-key': 'Default value for string'}
	 * ```
	 */
	defaultValues: Record<string, string>
) => Promise<TranslationMap>

interface KeyQueue {
	[path: string]: KeysSet
}
interface KeysSet {
	/** value passed as `defaultValue` */
	[key: string]: string
}

export interface Options {
	/**
	 * The resource key translator
	 *
	 * @type {TranslationGetter}
	 * @memberof Options
	 */
	translationGetter: TranslationGetter

	/**
	 * Value to return for missing keys (default: empty string)
	 *
	 * @type {string}
	 * @memberof Options
	 */
	missingKeyValue?: string

	/**
	 * Delay in ms used to debounce the translation requests (default: 100ms)
	 *
	 * @type {number}
	 * @memberof Options
	 */
	debounceDelay?: number
}

export class I18nextKeysOnDemand {
	type = '3rdParty'
	options: Options

	constructor(options: Options) {
		this.options = { debounceDelay: 100, missingKeyValue: '', ...options }
	}

	public init(instance: i18n) {
		const missingKeysQueue: KeyQueue = {}
		const options = this.options

		function requestResources(lng: string, ns: string) {
			const path = `${lng}.${ns}`
			options
				.translationGetter(
					Object.keys(missingKeysQueue[path]),
					lng,
					ns,
					missingKeysQueue[path]
				)
				.then((result) => {
					missingKeysQueue[path] = {}
					instance.addResources(lng, ns, result)
				})
		}

		const debouncedRequestResources: { [path: string]: () => void } = {}
		function requestKey(key: string, lng: string, ns: string, res: string) {
			const path = `${lng}.${ns}`
			missingKeysQueue[path] = missingKeysQueue[path] || {}
			missingKeysQueue[path][key] = res

			debouncedRequestResources[path] =
				debouncedRequestResources[path] ||
				debounce(() => requestResources(lng, ns), options.debounceDelay ?? 100)
			debouncedRequestResources[path]()
		}

		instance.on(
			'missingKey',
			(lngs: string | string[], ns: string, key: string, res: string) => {
				instance.options.parseMissingKeyHandler = () => {
					return options.missingKeyValue
				}

				const languages = typeof lngs === 'string' ? [lngs] : lngs
				languages.map((l) => requestKey(key, l, ns, res))
			}
		)
	}
}
