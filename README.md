# @x-titan/koa-error-handler

🧩 A minimal, composable error handler middleware for **Koa**, designed for **pure REST APIs**.

It provides a small, flexible structure for handling errors — without hiding logic from developers.  
You control *how errors are prepared and formatted*, while the middleware handles the basic flow.

---

## ✨ Features

- ⚙️ Minimal: no dependencies beyond Koa  
- 🧽 Flexible: developer controls how errors are formatted  
- 🔒 Safe: prevents double responses  
- 🤓 Developer-friendly with optional debug logging  
- 🌐 REST-only (JSON output)

---

## 📦 Installation

```bash
npm install @x-titan/koa-error-handler
```

---

## 🚀 Usage

```ts
import Koa from "koa"
import createHttpError, { type HttpError } from "http-errors"
import error, { ErrorState } from "@x-titan/koa-error-handler"

const app = new Koa()

app.use(error({
  prepare(error) {
    // Normalize to HttpError
    return createHttpError(
      error.status || 500,
      error.message || "Internal Server Error"
    )
  },

  formatter(errorState: ErrorState<HttpError>) {
    const err = errorState.error

    // Format final JSON response
    errorState.body = {
      success: false,
      message: err.expose ? err.message : "Internal Server Error",
      status: err.status,
      timestamp: new Date().toISOString(),
    }

    errorState.status = err.status
  }
}))

app.use(async ctx => {
  ctx.throw(400, "Invalid input")
})

app.listen(3000, () => console.log("Server running on http://localhost:3000"))
```

---

## ⚙️ API

### `error(options?: errorHandlerOptions | Formatter)`

Creates a Koa middleware for centralized error handling.

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `prepare` | `(error: any) => any` | Optional. Normalize or wrap any thrown error before formatting. |
| `formatter` | `(errorState: ErrorState) => void` | Required. Define how the final JSON response should look. |
| `finalize` | `(errorState: ErrorState) => void` | Optional. Mutate the response before sending (e.g., for logging). |
| `debug` | `boolean` | Optional. Logs caught errors to console when `true`. Defaults to `process.env.NODE_ENV === "development"`. |

---

### `ErrorState`

Each formatter receives an `ErrorState` object:

```ts
type ErrorState<Err = any> = {
  error: Err
  status: number
  body: any
  type: string
  meta: {
    accepts: string[] | string | false
    method: string
    path: string
  }
}
```

---

## 💡 Design Philosophy

- This package **does not** automatically normalize errors.  
  → Developers decide how to shape their own responses.  
- No magic defaults, no HTML responses, no stack traces unless you add them.

---

## 🧠 Example: Production vs Development

```ts
import error from "@x-titan/koa-error-handler"
import createHttpError from "http-errors"

app.use(error({
  prepare(error) {
    return createHttpError(error.status || 500, error.message)
  },
  formatter(errorState) {
    const err = errorState.error
    const isDev = process.env.NODE_ENV === "development"

    errorState.body = {
      success: false,
      message: err.expose ? err.message : "Internal Server Error",
      ...(isDev && { stack: err.stack }),
    }

    errorState.status = err.status
  }
}))
```

---

## 🧺 Default Behavior

If no `formatter` is provided:

```json
{
  "error": "Internal Server Error"
}
```

---

## 📝 License

MIT © 2025 [Aset Telmanov](https://github.com/X-Titan)
