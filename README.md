# Resume

[resume.acote.dev](https://resume.acote.dev/)

## Requirements

- `make`
- `pandoc`
- `node`
- `weasyprint`

## Build

With `RESUME_EMAIL` and `RESUME_PHONE` envionment variables set:

```sh
make
```

Or:

```sh
RESUME_EMAIL='email@example.com' RESUME_PHONE='+1 (555) 999-0000' make {TARGET}
```

**Targets**: `all`, `web`, `pdf`, `markdown`, `test`, `clean`

To build a specific resume file:

```sh
make RESUME_FILE=path/to/resume.md
```
