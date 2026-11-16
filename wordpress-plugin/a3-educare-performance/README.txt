A3 Educare Performance & Security - install / switch-over / rollback

What it is: the same code that already runs from the GeneratePress theme (a3-rest-performance.php), packaged as a plugin so a
theme update cannot remove it. The A3_PERF_LOADED guard means only one copy ever registers anything.

Install (WordPress admin on staging first):
 1. Plugins > Add New > Upload Plugin > choose a3-educare-performance.zip > Install > Activate.
 2. Verify: curl -sI https://<site>/wp-json/wp/v2/Districts?per_page=1 shows Cache-Control: public, max-age=30, s-maxage=45 ...
    and https://<site>/wp-json/wp/v2/users returns 404 for visitors. Nothing should change versus before activation.
 3. Optional clean-up: remove the require_once line for a3-rest-performance.php from the theme's functions.php (the Fluent
    Forms CORS block above it stays). Until you do, the theme copy simply returns early.

Rollback: Plugins > Deactivate. The theme copy takes over immediately (same behaviour). To remove everything, also delete the
require_once line and the file a3-rest-performance.php from the theme, or restore a theme backup.

Rebuild trigger (optional): add to wp-config.php
   define( 'A3_REBUILD_REPO',  'owner/private-source-repo' );
   define( 'A3_REBUILD_TOKEN', '<fine-grained GitHub token for that repository only, Contents: read & write>' );
Without both constants nothing is sent. With them, public content changes trigger one debounced (90 s) repository_dispatch
event 'wordpress-content-updated', which .github/workflows/deploy-pages.yml listens for.
