HOW TO POST A RUN
=================

1. Make a folder in here named with the date of the run:

       2026-09-14-monday-5k

2. Drop that run's photos and videos into it.

3. Right-click  new-run.ps1  (one level up) and choose "Run with PowerShell".

That rebuilds runs.js, which is what the website reads. Refresh the page.


NAMING
------
  2026-09-14                       title guessed from the weekday
  2026-09-14-monday-5k             "Monday 5K"
  2026-10-31-halloween-night-run   "Halloween Night Run", tagged special

Mon / Wed / Sat are tagged automatically. Any other day is tagged "special".


OPTIONAL: info.txt inside a run folder
--------------------------------------
  title = Halloween Night Run
  where = Queen's Park
  type  = special


PHOTO SIZE
----------
Resize the long edge to about 1800px before dropping photos in, or the page
will be slow to load. The sample runs in here are sized that way.


THE FOUR SAMPLE RUNS
--------------------
The dated folders currently in here are PLACEHOLDERS, built from photos in the
2025/26 partnership deck. Those photos are not from those dates. Delete the
four folders and re-run new-run.ps1 to clear them.


runs.js is GENERATED. Don't edit it by hand - it gets overwritten.
