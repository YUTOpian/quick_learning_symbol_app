const SDK_VERSION = "3.3.0";
const sdk = await import(`https://www.unpkg.com/symbol-sdk@${SDK_VERSION}/dist/bundle.web.js`);
const sdkCore = sdk.core;
const sdkSymbol = sdk.symbol;

// Buffer を読み込んでおく
(script = document.createElement('script')).src = 'https://bundle.run/buffer@6.0.3';
document.getElementsByTagName('head')[0].appendChild(script);
