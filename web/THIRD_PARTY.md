# Web 0.12.0 components

- INTERVAL judgement, curves and geometry: ported from this project's Android 0.12.0 Engine.java.
- fflate 0.8.2 (MIT), Copyright Arjun Barrett. Vendored browser ES module, [license](vendor/fflate-LICENSE.txt), [source](https://github.com/101arrowz/fflate/tree/v0.8.2).
- @wasm-audio-decoders/ogg-vorbis 0.1.20, Copyright Ethan Halsall. The bundled WebAssembly decoder is based on libvorbis and codec-parser. The unmodified distribution retains its copyright header; the MIT license and libvorbis BSD license are included. [Source and licensing](https://github.com/eshaz/wasm-audio-decoders), [MIT license](vendor/vorbis-LICENSE.txt), [libvorbis license](vendor/libvorbis-LICENSE.txt).
- Desultory Signals music: technoplanet. Included from the existing 0.12.0 demonstration assets; copyright remains with the original author.

Libraries and audio are served from this site; imported files are decoded locally and are not uploaded. No analytics or API keys are used.

Safari 18.4 added native Ogg support on corresponding Apple OS versions: [WebKit release notes](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/). A local WebAssembly Vorbis decoder is used when native decoding fails.
