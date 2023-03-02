# I18next with ability to download missing keys

![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/weareinreach/i18next-keys-ondemand?style=plastic) ![npm (scoped with tag)](https://img.shields.io/npm/v/@weareinreach/i18next-keys-ondemand/latest?style=plastic)

![Twitter Follow](https://img.shields.io/twitter/follow/weareinreach?style=social)

Existing [i18next](https://github.com/i18next/i18next) backend plugins request keys by namespaces and not the granularity of an individual key.
The goal of this module is to be able to fetch missing keys individually, taking in consideration performance by debouncing requests to an individual request.

## Installation

```bash
# using pnpm
$ pnpm add @weareinreach/i18next-keys-ondemand

# using npm
$ npm install @weareinreach/i18next-keys-ondemand

# using yarn
$ yarn add @weareinreach/i18next-keys-ondemand

```

## Usage

- Use the module when initializing i18next:

```TypeScript
import i18n from 'i18next'
import { I18nextKeysOnDemand, TranslationMap } from 'i18next-keys-ondemand'



const getterFunction = async (
        keys: string[], 
        language: string, 
        namespace: string, 
        defaultValues: Record<string,string>
    ) => {

    /** This function should ultimately return an object in the format of:
     *
     * {'key-name': 'Translated string value'}
     *
     */

    const result: Record<string,string> = await someFunctionThatHandlesThings(
        keys,
        language,
        namespace,
        defaultValues // pass defaultValues if you want to save new strings to your i18n store
        )

  return result
}

i18n
  .use(new I18nextKeysOnDemand({ translationGetter: getterFunction })) // init i18next here
  .init({
    fallbackLng: 'en',
    ns: ['yourNamespace'],
    defaultNS: 'yourNamespace',
    // saveMissing must be set to `true`!
    saveMissing: true,
  })
```

- Options:

| Field  | Mandatory? | Default value | Comment |
| ------ | ------ | ------ | ------ |
| `translationGetter` | yes |  | Translation service function to use |
| `missingKeyValue` | no | '' | Value to return for missing keys |
| `debounceDelay` | no | 100 | Delay in ms used to debounce the translation requests |
