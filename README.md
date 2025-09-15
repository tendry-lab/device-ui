[![Build Web-GUI](https://github.com/tendry-lab/bonsai-zero-a-1-k-web-gui/actions/workflows/build.yml/badge.svg)](https://github.com/tendry-lab/bonsai-zero-a-1-k-web-gui/actions/workflows/build.yml)

## Introduction

`device-ui` is a set of components used to build a Web GUI for the embedded devices. It is designed to be very tiny, up to 50KB gzipped.

## Development

**Install dependencies**

All dependencies should be installed locally, use `npm install --save-dev`.

```sh
npm install
```

**Build Web GUI**

Before writing Web GUI to the device, make sure it's been built.

```sh
npm run build
```

**Run tests**

Cover your code with unit test, both logic and UI components. We use [vitest](https://vitest.dev/).

```
npm run test
npm run test:coverage
npm run test:watch
```

**Format code**

Make sure your code is properly formatted. We use [eslint](https://eslint.org/).

```sh
npm run fmt
```

**Compress assets**

- By default everything that is inside HTML, CSS, JS are compressed during the build process, see vite.config.js for more details.
- SVG files should be pre-compressed with [SVGO](https://github.com/svg/svgo) as `npx svgo example.svg -o example.compressed.svg`, `SVGO` is available after running `npm install`. After SVG is pre-compressed it should be inlined in the source code directly or as JSX component.

## Contribution

- [Preact JS Framework](https://preactjs.com/) is used for development, please refer to its official documentation for more details.
- `master` - stable and ready-to-use branch. [Semver](https://semver.org/) is used for versioning.
- Try to keep PR small.
- New code should be similar to existing code. Use the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html).

## License

This project is licensed under the MPL 2.0 License - see the LICENSE file for details.
