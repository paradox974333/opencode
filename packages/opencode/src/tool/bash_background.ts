import path from "path"
import { Effect, Schema } from "effect"
import { Config } from "@/config/config"
import { Shell } from "@/shell/shell"
import { BackgroundShell } from "@/shell/background"
import { InstanceState } from "@/effect/instance-state"
import { BashArity } from "@/permission/arity"
import * as Tool from "./tool"
import DESCRIPTION from "./bash_background.txt"

export const Parameters = Schema.Struct({
  command: Schema.String.annotate({ description: "The shell command to run in the background" }),
  description: Schema.String.annotate({
    description: "Clear, concise description of what this command does in 5-10 words",
  }),
  workdir: Schema.optional(Schema.String).annotate({
    description: "Working directory for the command. Defaults to the project root.",
  }),
})

export const BashBackgroundTool = Tool.define(
  "bash_background",
  Effect.gen(function* () {
    const config = yield* Config.Service

    return () =>
      Effect.gen(function* () {
        const cfg = yield* config.get()
        const shell = Shell.acceptable(cfg.shell)

        return {
          description: DESCRIPTION,
          parameters: Parameters,
          execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
            Effect.gen(function* () {
              const instance = yield* InstanceState.context
              const cwd = params.workdir
                ? path.isAbsolute(params.workdir)
                  ? params.workdir
                  : path.resolve(instance.directory, params.workdir)
                : instance.directory

              const tokens = params.command.trim().split(/\s+/).filter(Boolean)
              const alwaysPattern = tokens.length ? BashArity.prefix(tokens).join(" ") + " *" : "*"
              yield* ctx.ask({
                permission: "bash_background",
                patterns: [params.command],
                always: [alwaysPattern],
                metadata: { description: params.description },
              })

              const entry = yield* Effect.sync(() =>
                BackgroundShell.start({
                  shell,
                  command: params.command,
                  cwd,
                  env: process.env,
                  description: params.description,
                }),
              )

              const lines = [
                `Background task started.`,
                ``,
                `taskID: ${entry.id}`,
                `description: ${entry.description}`,
                `status: ${entry.status}`,
                `cwd: ${entry.cwd}`,
                ``,
                `Use bash_output with taskID="${entry.id}" to read stdout/stderr.`,
                `Use bash_kill with taskID="${entry.id}" to stop it.`,
              ]

              return {
                title: params.description,
                output: lines.join("\n"),
                metadata: {
                  taskID: entry.id,
                  description: params.description,
                  status: entry.status,
                },
              }
            }),
        }
      })
  }),
)
