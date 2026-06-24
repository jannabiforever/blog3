---
title: "The Ultimate Zed Configuration"
date: "2026-06-22"
category: "Engineering"
excerpt: "Introduction to my personal zed configuration"
---

# Ultimate Zed Setup

I've configured a lot of editors. This is the one I stopped fighting.

What follows isn't a tour of Zed's features — the docs do that fine. It's a record of the specific things that annoyed me and the specific lines of config that fixed them. If you already live in Vim and know what an LSP is, you're the audience. Everything here is in my actual `settings.json` and `keymap.json`, linked at the bottom, so you can read the source instead of trusting my prose.

## Why Zed at all

I came from Neovim. I'm not here to dunk on it — a well-tuned Neovim config is a genuinely good place to work, and for years it was mine. I left for two reasons, and they're worth stating plainly before any of the config makes sense, because the config is downstream of them.

**The first was speed, and I mean it literally, not as a vibe.** Two things I actually measured rather than felt. Memory footprint: Zed sits noticeably lower than my Neovim setup did. I won't pretend to know exactly why — the convenient story is "Lua is heavy," but Lua itself is famously lightweight and I don't believe the runtime was the culprit. My honest guess is the plugin surface: every LSP client, every Treesitter parser, every background process those plugins spin up, summed across a config that had quietly grown for years. The editor wasn't heavy; what I'd bolted onto it was. The second, and the one that actually pushed me: a single file past ~5,000 lines would stutter. Scrolling, redraw, cursor movement — perceptibly behind my input. On an M4 Max with 64GB of RAM. When a maxed-out machine can't scroll a large file smoothly, the bottleneck isn't the hardware, and no amount of plugin pruning was going to fix what was fundamentally a rendering-architecture problem. Zed is built in Rust on its own GPU-accelerated framework (GPUI), and the difference on exactly that workload — big generated files, several language servers attached — is the kind of thing you stop noticing only because it stops getting in your way.

**The second was the pace of AI development, and this is the structural one.** In Neovim, AI support is plugin-mediated: every new capability — inline assist, agentic editing, MCP, the next model — arrives only once someone wraps it in a plugin you then install, configure, and maintain. You're perpetually one community release behind the frontier, and the maintenance is yours. Zed ships this first-party and iterates fast; the agent, the inline assistant, MCP server support, model selection are _the editor_, not an ecosystem you assemble and babysit. That's the whole point. **In Neovim, AI is a plugin you maintain. In Zed, AI is the editor.** Given how fast this entire area is moving in 2026, I'd rather be on the thing that ships the capability than on the thing waiting to wrap it. (For the record, this is also the reason this article's AI section is the way it is — see below.)

What did it cost me? The honest answer is real, not rhetorical. I gave up a mature plugin ecosystem and the precise, bottomless configurability that comes with it — there are things a determined Neovim user can build that Zed simply won't let me. I gave up Vim's full Ex command line, which I'll get to. And I gave up the sunk years of muscle memory and config I'd accumulated. None of that is nothing. I made the trade anyway, because speed and AI cadence were the axes I actually cared about, and on those two Zed wins outright for me. Your axes might differ — if bottomless configurability is the thing you optimize for, you may reasonably make the opposite call.

There's one idea underneath almost every choice below, so I'll state it up front: **I want the editor to show me meaning, not text.** Vim treats a buffer as a flat string. Zed treats it as a parsed tree with a language server attached, and it turns out most of my configuration is just me leaning into that distinction wherever it pays off — and working around the few places where it doesn't behave like Vim and I wish it did. Once you see that thread, the rest of this is predictable.

---

## Vim mode: what's actually different

If you're coming from Neovim, the first thing worth internalizing is that Zed did **not** embed Neovim. It's a reimplementation of modal editing on top of Zed's own primitives — its text data structures, its CRDTs, its render pipeline. The official line is that it tries to copy Vim exactly but uses Zed-native functionality where that's better, so it'll never be 100% Vim-compatible but should be 100% Vim-familiar. In practice that's the right framing. Most divergences are upgrades; one is a genuine regression; one is just retraining.

Here's the honest accounting.

### Motions are semantic, not character-wise

Standard Vim walks the buffer character by character. Zed routes motions through its Tree-sitter parse, so the _same keystroke_ behaves differently per language. In Rust, `%` jumps matching brackets and treats the pipe `|` as a delimiter. In JavaScript, `w` counts `$` as a word character. This is almost always what you want — it's the editor knowing what a "word" or a "bracket" means in _this_ language rather than guessing from punctuation. The cost is that if your muscle memory depends on Vim's flat-string behavior in some edge case, it can surprise you. I've hit this maybe twice in months. Worth it.

### The Ex command line is the real gap

This is the one to know before you switch. Zed does not emulate the full power of Vim's command line — **commands don't take arguments.** The concrete consequence: you can't `:e path/to/file` or `:w newname`. Zed special-cases specific command patterns instead of implementing Vim's range and argument grammar, and provides aliases (`:w`, `:write`, etc.) so muscle memory for the common cases survives. But it's a curated alias table, not a real Ex interpreter. If your workflow leans on `:r !cmd`, ranged `:g`, or saving-as from the command line, that's the muscle you'll have to relocate elsewhere. Everything else on this list I'd call a wash or a win. This one is a loss, and you should go in knowing it.

### Regex is Rust's engine, not Vim's

Search and substitute forward to Zed's own search subsystem, backed by Rust's `regex` crate. So the syntax is Rust's, not Vim's — different escapes, different character-class behavior. The specifics that'll trip you:

- Capture backreferences are `$1`, not `\1`. Zed's palette will actually rewrite a Vim-style `%s:/\(a\)(b)/\1/` into a search for `(a)(b)` with replacement `$1`, which is a kind gesture toward your old habits.
- Case-insensitivity is `(?i)` at the start of the pattern, or the `cmd-option-c` toggle, rather than a trailing `/i`.

There's a documentation discrepancy floating around about whether `:%s` replaces all matches by default or just the first on the line — the behavior has shifted across versions. Don't trust me or an old blog post on this; run one substitution in your install and see what happens. (This is generally good practice for anything in a config article, including this one.)

### Visual block is multi-cursor underneath

Visual block selections are emulated with Zed's actual multiple cursors. That makes them _more_ flexible than Vim's: insert after a block selection and every line updates in real time, and you can add or drop cursors mid-operation. It's strictly more powerful. It is not bit-identical to Vim's block model, so the rare workflow that depends on Vim's exact block semantics will feel different.

### Macros record actions, not keystrokes

Vim records keystrokes. Zed records _actions_, replayed through its own recording system — which means a macro can replay things Vim macros structurally can't, like invoking the AI assistant or accepting a completion. Conceptually different, practically an upgrade.

**The pattern across all five:** these aren't losses, they're substitutions where Zed's primitive is more capable but not a perfect Vim clone. The single real regression is the Ex command line. Everything else is either free power or a couple of evenings of retraining. That's a trade I'll take, and it's the same trade — semantic engine over textual emulation — that shows up everywhere else in this config.

---

## Making the keymap mine

Zed doesn't read your `.vimrc`. There's no Vimscript, no `init.lua`. Every Vim command is exposed as a remappable action, configured in `keymap.json` as JSON objects gated by a `context` expression. Bindings only fire when their context matches where you are in the editor. Once that clicks, the system is genuinely good — more legible than Vimscript, if less terse.

### Space as leader, done the two-step way

The non-obvious part of setting up a leader key in Zed is that you have to **free the key before you can rebind it.** Space does something in normal mode by default, so step one is to null it out:

```jsonc
{
  "context": "Editor && vim_mode == normal",
  "bindings": {
    "ctrl-w": null,
    "space": null,
  },
}
```

I null `ctrl-w` in the same breath because I've moved window/pane navigation onto `ctrl-h/j/k/l` (below) and don't want Vim's window-prefix fighting me for it.

_Then_ you build your `space …` sequences in a separate block — and this is where the context string earns its keep:

```jsonc
{
  "context": "ProjectPanel || EmptyPane || (Editor && VimControl && !VimWaiting && !menu)",
  "bindings": {
    "space ,": "tab_switcher::OpenInActivePane",
    "space G": "git_panel::ToggleFocus",
    "space e": "workspace::ToggleLeftDock",
    "space s d": "diagnostics::Deploy",
    "space f p": "projects::OpenRecent",
    "space u n": "workspace::ClearAllNotifications",
  },
}
```

The `!VimWaiting` guard is the detail that took me too long to discover and will save you an evening: it stops your leader sequences from firing while you're mid-operator-pending. Without it, `space` bindings collide with operators in ways that feel like the editor is possessed. With it, everything is clean.

### Vim-style pane navigation, everywhere

I want `ctrl-h/j/k/l` to move between panes regardless of what's focused — editor, terminal, project panel, the agent panel, whatever. That means one binding block with a deliberately enormous context union:

```jsonc
{
  "context": "Dock || Terminal || Editor || ProjectPanel || AssistantPanel || CollabPanel || OutlinePanel || ChatPanel || VimControl || EmptyPane || SharedScreen || MarkdownPreview || KeyContextView || Diagnostics",
  "bindings": {
    "ctrl-h": "workspace::ActivatePaneLeft",
    "ctrl-l": "workspace::ActivatePaneRight",
    "ctrl-k": "workspace::ActivatePaneUp",
    "ctrl-j": "workspace::ActivatePaneDown",
    "ctrl-right": "vim::ResizePaneRight",
    "ctrl-left": "vim::ResizePaneLeft",
    "ctrl-down": "vim::ResizePaneDown",
    "ctrl-up": "vim::ResizePaneUp",
    "alt-right": "pane::ActivateNextItem",
    "alt-left": "pane::ActivatePreviousItem",
    "alt-,": "pane::SwapItemLeft",
    "alt-.": "pane::SwapItemRight",
    "alt-p": "pane::TogglePinTab",
  },
}
```

Arrows resize, `alt`+arrows move between tabs, `alt-,`/`alt-.` reorder them. The verbosity of that context string is the price of "this works no matter where I am," and I'll pay it.

### One binding I have to warn you about

```jsonc
"cmd-d": "pane::SplitRight"
```

In most editors `cmd-d` adds the next occurrence to a multi-cursor selection, and in a Vim-mode editor `d` is _delete_, so binding `cmd-d` to split-the-pane is, objectively, a footgun. I did it on purpose — I split panes constantly and almost never use `cmd-d`'s default — but if you lift my keymap wholesale, this is the line that'll bite you first. Decide deliberately.

### A few small ones

```jsonc
"cmd-k cmd-r": "editor::RestartLanguageServer",   // global, no context
"cmd-k p":     "workspace::CopyPath",             // Editor context
"cmd-ctrl-b":  "git::Branch"                       // Workspace context
```

The LSP restart is bound globally and unscoped on purpose — when a language server wedges, I don't want to think about what's focused. Be deliberate about which of your bindings are global versus context-scoped; it's easy to leave one unscoped by accident and wonder why it fires in the terminal.

---

## Showing meaning instead of text

This is the section the whole config is really about. Every setting here is me asking the editor to surface what the compiler or language server already knows, instead of making me hold it in my head.

### Inlay hints, on demand

Inlay hints are noise most of the time and oxygen the rest. The fix isn't on-or-off, it's _on-when-I-ask_:

```jsonc
"inlay_hints": {
  "enabled": true,
  "toggle_on_modifiers_press": {
    "control": true,
    "alt": true
  }
}
```

Hints render, but the full overlay surfaces only while I'm holding `control-alt`. Invisible when I'm reading flow, instantly there when I need a type. This is my favorite small thing in the entire setup and the one I'd port to any editor that allowed it.

### rust-analyzer, pushed hard

hwpxer — the Rust service half of my stack — is where I spend real time, so rust-analyzer gets configured like I mean it:

```jsonc
"lsp": {
  "rust-analyzer": {
    "initialization_options": {
      "check": { "command": "clippy" },
      "cargo": {
        "allFeatures": true,
        "loadOutDirsFromCheck": true,
        "buildScripts": { "enable": true }
      },
      "procMacro": {
        "enable": true,
        "ignored": {
          "async-trait": ["async_trait"],
          "napi-derive": ["napi"],
          "async-recursion": ["async_recursion"]
        }
      },
      "rust": { "analyzerTargetDir": true },
      "inlayHints": {
        "lifetimeElisionHints": {
          "enable": "skip_trivial",
          "useParameterNames": true
        },
        "closureReturnTypeHints": { "enable": "always" }
      }
    }
  }
}
```

The decisions worth calling out: **clippy on save**, not plain `check` — if the compiler can tell me something's non-idiomatic, I want it inline, not at review. **Proc-macro expansion on**, with the noisy attribute macros (`async_trait`, `napi`, `async_recursion`) explicitly ignored so they don't drown the useful expansions. **Lifetime-elision hints at `skip_trivial`** — show me the lifetimes that are actually load-bearing, hide the ones I'd elide anyway. And on the Rust language side:

```jsonc
"Rust": {
  "semantic_tokens": "combined",
  "document_folding_ranges": "on"
}
```

`semantic_tokens: "combined"` is the same philosophy at the syntax-highlighting layer — color from the language server's understanding merged with the Tree-sitter grammar, not grammar alone.

### Diagnostics and lenses inline

```jsonc
"code_lens": "on",
"diagnostics": { "inline": { "enabled": true } }
```

Errors at the point of error, lenses where the code is. I don't want to walk to a panel to learn something the editor could put under my cursor.

---

## Formatting: code actions, per language

I deliberately don't set a global `format_on_save`. I drive formatting through per-language code actions instead, because Python and TypeScript don't want the same thing:

```jsonc
"languages": {
  "Python": {
    "code_actions_on_format": {
      "source.fixAll.ruff": true
    }
  },
  "TypeScript": {
    "code_actions_on_format": {
      "source.organizeImports": true
    }
  }
}
```

Python runs ruff's lint-autofix; TypeScript organizes imports.

> **A note to my future self, and to you:** `source.fixAll.ruff` runs ruff's lint _fixes_ — it is not the same as running `ruff format`. If you want the formatter proper, you also need ruff wired as the formatter (or `format_on_save` enabled for Python). Audit your own setup here and decide whether you want lint-fix only or lint-fix _plus_ format on every save; the asymmetry between my Python and TypeScript blocks above is the kind of thing that's easy to leave half-finished. 

This is the one corner of my config I'd tell you to copy _thoughtfully_ rather than wholesale, because the right answer depends on your toolchain and your taste for how much happens silently on `:w`.

---

## Theme, fonts, and the small stuff

### A theme that follows the sun

I don't pick a side in the dark-mode war:

```jsonc
"theme": {
  "mode": "light",
  "light": "Catppuccin Latte",
  "dark": "Catppuccin Mocha"
}
```

Catppuccin flips Latte by day, Mocha by night, tracking the OS appearance. (One honest inconsistency: my `icon_theme` is pinned to the Light variant, so in dark mode the icons don't follow. On the to-fix list. Mentioning it because pretending the setup is seamless when it isn't would defeat the point of the article.)

### Search, line numbers, and momentary hints

```jsonc
"search": { "regex": true },
"seed_search_query_from_cursor": "selection",
"vim": {
  "toggle_relative_line_numbers": true,
  "show_edit_predictions_in_normal_mode": true
},
"close_on_file_delete": true,
"minimap": { "show": "auto", "display_in": "all_editors" }
```

Regex search on by default (I rarely want literal). Search seeds from the selection, not the word under the cursor — more predictable when I've deliberately selected something. Relative line numbers toggle with mode, which is the hybrid behavior you want for `{count}j/k` without losing the absolute number on the current line.

### which-key, instant

```jsonc
"which_key": {
  "enabled": true,
  "delay_ms": 0
}
```

It behaves like Neovim's which-key — the popup of available continuations after a prefix. Two notes. First, you won't find this in the settings reference I could dig up, but it works in my install regardless; "not in the docs" isn't "not real." Second, `delay_ms: 0` is the actual opinion: no penalty for pausing, the menu is just _there_. Plenty of people leave a delay so it only appears when they hesitate. I'd rather it never make me wait.

### Keeping the file tree honest

```jsonc
"file_scan_exclusions": [
  "**/.git", "**/node_modules", "**/dist", "**/build",
  "**/.venv", "**/__pycache__", "**/.pytest_cache",
  "**/.ruff_cache", "**/coverage", "**/.idea", "**/.vscode"
  // …and the usual suspects
]
```

Nothing clever, but worth doing deliberately — every path you exclude is noise removed from fuzzy-find and search results. The `.ruff_cache`/`.pytest_cache`/`__pycache__` trio in particular keeps Python projects from burying real files under tooling detritus.

---

## The AI agent

This is the section the whole article was quietly building toward, so I'll be precise about it.

Remember the second reason I left Neovim: in that world, AI is plugin-mediated. Every new capability — a new model, agentic editing, and above all MCP — only reaches you once someone wraps it in a plugin you then install, configure, and maintain. That gap is exactly what pushed me out. MCP servers were landing faster than the plugin ecosystem could keep up; I kept finding a server I wanted to wire in and discovering I'd have to wait for — or write — the glue myself. Being perpetually one community release behind the frontier, on the one axis moving fastest in 2026, was the thing I wasn't willing to accept.

So here's the payoff, and it's almost paradoxical: **my agent config is nearly empty, and that's the point**. Because Zed ships this first-party, there's very little to assemble. The committed config is essentially one line --

```jsonc
"agent": {
  "notify_when_agent_waiting": "all_screens"
}
```

— a notification so I know when the agent is waiting on me across monitors. The model selection, tool-action permissions, default profiles, and MCP server wiring (I run an HWPX document-operations server, among others) aren't a pile of plugin glue I maintain; they're editor surface I configure. In Neovim that list would have been a stack of plugins each with its own lifecycle. Here it's settings.


I'm deliberately not pasting my full `context_servers` / `model` block yet, because the honest version of this section is verified config, not config reconstructed from memory — and that's a short follow-up rather than something I'll guess at here. But the shape of the lesson is already the whole thesis: the editor that makes AI the editor is the one where this section gets shorter every release instead of longer.

---

## The config

The full `settings.json` and `keymap.json` are [here](https://github.com/jannabiforever/zed-config). Read those as the source of truth; the snippets above are excerpts chosen to explain a decision, not the complete files.

If you take one thing from this, take the thesis rather than my keybindings: **configure the editor to show you meaning, not text.** Semantic motions, language-server inlay hints, clippy-on-save, semantic tokens — every one of those is the editor surfacing structure it already understands so you don't have to keep it in your head. The specific keys are mine and yours will differ. The principle is the part worth stealing.
