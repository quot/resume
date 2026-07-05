[acote.dev/resume](https://acote.dev/resume)

## Requirements

- `make`
- `pandoc`
- `node`
- `weasyprint`

## Build

Full:

Set `RESUME_EMAIL` and `RESUME_PHONE` in your shell or CI environment, then run:

```sh
make
```

Web Only:

Set `RESUME_EMAIL` and `RESUME_PHONE` in your shell or CI environment, then run:

```sh
make web
```

## Artifacts

Only publish `build/web` for the web resume. Other files under `build/` may
temporarily contain plaintext contact values during pdf and markdown builds.
