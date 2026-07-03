[acote.dev/resume](https://acote.dev/resume)

## Requirements

- `make`
- `pandoc`
- `node`
- `weasyprint`

## Build

Full:

```sh
make RESUME_EMAIL="me@example.com" RESUME_PHONE="+1 (555) 000-0000"
```

Web Only:

```sh
make web RESUME_EMAIL="me@example.com" RESUME_PHONE="+1 (555) 000-0000"
```
