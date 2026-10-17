# Committing to GitHub yourself

For working on this repo from a terminal on Windows. The remote is
<https://github.com/uoftrunclub/utrc_website> and the only branch is `main`.

## The loop

Four commands, in this order, run from the repo root:

```powershell
git status                      # what changed?
git add -A                      # stage all of it
git commit -m "What you did"    # save it locally
git push                        # send it to GitHub
```

`git status` first, every time. It is the one command that cannot break
anything, and it tells you whether you are about to commit what you think you
are.

## PowerShell will not let you chain these

This is Windows PowerShell 5.1, where `&&` is a **parser error**, not a
slow path:

```powershell
git add -A && git commit -m "oops"      # The token '&&' is not a valid statement separator
```

Run them on separate lines. If you really want one line, `;` separates
statements — but it runs the next command even if the previous one failed, so
for `add`/`commit`/`push` prefer separate lines and read each result.

## The CRLF warning is normal

Every commit touching a text file prints something like:

```
warning: in the working copy of '01_main/join.html', LF will be replaced by CRLF
```

Nothing is wrong. `.gitattributes` sets `* text=auto`, so git stores Unix line
endings and hands Windows back Windows ones. That is what stops your checkout
and a Linux host from showing phantom whole-file diffs. Ignore it.

## Commit messages

A short summary line in the imperative — "Fix the countdown on Safari", not
"fixed" or "changes". If it needs detail, pass `-m` twice and the second
becomes the body:

```powershell
git commit -m "Rewrite the join page steps" -m "Groups split at the start now, and Saturday ends at food rather than a photo."
```

## Committing only some of your changes

`git add -A` takes everything. To commit one thing at a time, name the files:

```powershell
git add 01_main/join.html 01_main/assets/css/style.css
git commit -m "Rewrite the join page steps"
```

Smaller commits are easier to undo later. Worth the extra typing when you have
been working on two unrelated things.

## What you cannot accidentally commit

`.gitignore` already keeps the generated and bulky things out, so `git add -A`
is safe. It excludes `_deploy/`, `_drive-upload/`, `node_modules/`, the dated
`01_main/gallery/2026-*/` photo folders, `reference/`, and anything that looks
like a credential (`.env`, `service-account*.json`). If `git status` ever shows
one of those, stop and ask — something has changed about the setup.

## Pushing is not publishing

`git push` updates GitHub. It does **not** update the live site — there is no
CI in this repo. Publishing is still the manual step from the main README:

```powershell
node make-deploy.js
```

Then drag the `_deploy` folder onto <https://app.netlify.com/drop>.

## When it goes wrong

```powershell
git diff                         # see unstaged changes before you add them
git diff --staged                # see what you are about to commit
git restore <file>               # throw away uncommitted edits to one file
git reset --soft HEAD~1          # undo the last commit, keep the changes staged
git log --oneline -10            # the last ten commits
```

`git restore` and `git reset --soft` differ in an important way: `restore`
**discards your edits permanently**, while `reset --soft` only unwinds the
commit and leaves the work sitting there. Reach for `reset --soft` when you
committed too early; reach for `restore` only when you are certain you want
the edits gone.

If you have already pushed and need to undo it, make a new commit that fixes
the problem rather than rewriting history — `git push --force` on a shared
branch will overwrite work anyone else has pushed.

## If push is rejected

Someone else pushed first. Pull their work in, then push again:

```powershell
git pull --rebase
git push
```

If that reports a conflict, the files it names have edits from both sides. Open
them, look for the `<<<<<<<` markers, keep what should survive, delete the
markers, then:

```powershell
git add -A
git rebase --continue
```
