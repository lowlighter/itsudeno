//Imports
import {os} from "@core/setup"
import {run} from "@tools/run"
import {assertEquals, assertThrowsAsync, ItsudenoError, Suite} from "@testing"

//Tests
await new Suite(import.meta.url)
  .group("run", test => {
    test("command", async () =>
      assertEquals(
        await run(
          {
            windows: `powershell -command "Write-Host -NoNewline 'itsudeno'"`,
            darwin: "echo -n 'itsudeno'",
            linux: "echo -n 'itsudeno'",
          }[os],
        ),
        {
          success: true,
          code: 0,
          stdout: "itsudeno",
          stderr: "",
        },
      ), {
      ignore: true,
    })
    test("error, unknown executable", () => assertThrowsAsync(() => run("itsudeno-run-test"), ItsudenoError.Run, "could not find executable"), {ignore: true})
  })
  .conclude()
