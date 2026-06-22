---
title: I rewrote my dotfiles and learned to stop tinkering
date: "2026-03-30"
category: Tooling
excerpt: On the diminishing returns of configuration, and the surprising calm of a setup you no longer touch.
coverCaption: figure — a setup you stop touching
---

I have rewritten my dotfiles more times than I have finished side projects. Each rewrite promised to be the last. This one actually was — not because it is perfect, but because I finally noticed what I was really optimizing.

## The tinkering trap

Configuration has a seductive property: every change produces a visible result instantly. That tight feedback loop feels like productivity while reliably costing you an afternoon. The work is real; the _value_ plateaus fast.

```bash
# the entire bootstrap, now
git clone https://github.com/jannabiforever/dotfiles ~/.dotfiles
cd ~/.dotfiles && ./install.sh
```

That is the whole thing. No framework, no plugin manager with its own plugin manager. Two commands and the machine is mine.

## Rules that stuck

- **If I can't explain a line, it goes.** Inherited config is just cargo cult with good intentions.
- **Defaults win ties.** Every override is a small maintenance debt I pay forever.
- **Boring is a feature.** The best compliment my setup gets now is that I forget it exists.

The surprising part was emotional, not technical. A setup you have decided to stop touching is quietly restful. The cursor blinks, the tools work, and the urge to optimize finally has nowhere to go but the actual work.
