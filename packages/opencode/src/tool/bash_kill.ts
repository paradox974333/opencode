import { Effect, Schema } from "effect"
import { BackgroundShell } from "@/shell/background"
import * as Tool from "./tool"
import DESCRIPTION from "./bash_kill.txt"

const SignalLiteral = Schema.Literal("SIGTERM", "SIGINT", "SIGKILL")

export const Parameters = Schema.Struct({
  taskID: Schema.String.annotate({ description: "The id of the background task to terminate" }),
  signal: Schema.optional(SignalLiteral).annotate({
    description: "Signal to send. Defaults to SIGTERM. Use SIGKILL only when SIGTERM doesn't work.",
  }),
})

export const BashKillTool = Tool.define(
  "bash_kill",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const result = yield* Effect.sync(() =>
            BackgroundShell.kill(params.taskID, (params.signal ?? "SIGTERM") as NodeJS.Signals),
          )

          if (!result) {
            return yield* Effect.fail(
              new Error(`No background task found with id "${params.taskID}".`),
            )
          }

          const { entry, sent } = result
          const lines: string[] = [
            `taskID: ${entry.id}`,
            `description: ${entry.description}`,
            `status: ${entry.status}`,
            `signalSent: ${sent}`,
          ]
          if (entry.exitCode !== null) lines.push(`exitCode: ${entry.exitCode}`)
          if (entry.signal) lines.push(`signal: ${entry.signal}`)
          if (entry.errorMessage) lines.push(`error: ${entry.errorMessage}`)

          return {
            title: entry.description,
            output: lines.join("\n"),
            metadata: {
              taskID: entry.id,
              status: entry.status,
              signalSent: sent,
              exitCode: entry.exitCode,
            },
          }
        }),
    }
  }),
)
