<?php
/**
 * Plugin Name:       A3 Educare Performance & Security
 * Description:       Public REST caching, baseline security hardening and a debounced frontend rebuild trigger for A3 Educare Hub.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            A3 Educare Hub
 * License:           GPL-2.0-or-later
 *
 * Same code as a3-rest-performance.php in the GeneratePress theme (it has been running from there). Plugins load before the
 * theme, so once this plugin is active it wins and the theme copy returns early (see the A3_PERF_LOADED guard); deactivating
 * the plugin hands over to the theme copy again. Nothing is registered twice in either case.
 *
 * 1. REST caching: anonymous GET responses of the public, read-only content routes below get browser + edge cache headers
 *    (Hostinger CDN honours s-maxage) and are stored by LiteSpeed Cache under the tag a3_rest, purged when content changes.
 *    Logged-in, authenticated (Authorization header / nonce), context=edit and password requests are never touched.
 *    Cacheable responses send a fixed Access-Control-Allow-Origin: * and no credentials header, because a shared cache keeps one
 *    copy for every visitor. Everything else keeps WordPress's own origin-specific CORS behaviour.
 * 2. Security: the users REST routes are removed for visitors; baseline security headers; X-Powered-By removed;
 *    the users sitemap and ?author= enumeration are switched off for visitors.
 * 3. Rebuild trigger: when public content changes, ONE debounced request asks GitHub to rebuild the static frontend.
 *    Inactive until A3_REBUILD_REPO and A3_REBUILD_TOKEN are defined in wp-config.php.
 *
 * The Fluent Forms CORS rule for the client preview (allowed_http_origins) lives in the theme's functions.php, not here.
 *
 * @package A3_Educare_Performance
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( defined( 'A3_PERF_LOADED' ) ) {
	return; // Already loaded (plugin or theme): never register anything twice.
}
define( 'A3_PERF_LOADED', true );

/* ------------------------------------------------------------------ 1. REST caching */

/**
 * Only these public content routes (collection or single item) are cacheable.
 *
 * @param string $route REST route, e.g. /wp/v2/college or /wp/v2/college/123.
 * @return bool
 */
function a3_rest_is_cacheable_route( $route ) {
	return 1 === preg_match(
		'#^/wp/v2/(college|courses|States|Districts|study-abroad|Scholarships|testimonials|course_category|college_category|district_category|state_category|study_abroad_category|scholarships_category|media|posts|pages|categories|tags|types)(/[A-Za-z0-9_-]+)?$#',
		(string) $route
	);
}

/**
 * Remembers, for this request, that the response is public and cacheable.
 *
 * @param bool|null $set True to mark the response; null to read the flag.
 * @return bool
 */
function a3_rest_cacheable_response( $set = null ) {
	static $flag = false;
	if ( null !== $set ) {
		$flag = (bool) $set;
	}
	return $flag;
}

add_filter(
	'rest_post_dispatch',
	function ( $result, $server, $request ) {
		if ( ! ( $result instanceof WP_REST_Response ) || 'GET' !== $request->get_method() ) {
			return $result;
		}
		if ( $result->is_error() || 200 !== $result->get_status() || is_user_logged_in() ) {
			return $result;
		}
		// Never cache anything authenticated, personalised or for editing.
		if ( ! empty( $_SERVER['HTTP_AUTHORIZATION'] ) || ! empty( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			return $result;
		}
		if ( 'edit' === $request->get_param( 'context' ) || $request->get_param( '_wpnonce' ) || $request->get_param( 'password' ) ) {
			return $result;
		}
		if ( ! a3_rest_is_cacheable_route( $request->get_route() ) ) {
			return $result;
		}

		// Browser 30 s; shared/edge cache (Hostinger CDN, which this code cannot purge) 45 s, then served stale for up to 15 s
		// while it refreshes: content edits show within about a minute.
		$result->header( 'Cache-Control', 'public, max-age=30, s-maxage=45, stale-while-revalidate=15' );
		a3_rest_cacheable_response( true );

		// LiteSpeed Cache: store this response and tag it so it can be purged on content changes.
		do_action( 'litespeed_control_set_cacheable' );
		do_action( 'litespeed_control_set_ttl', 45 );
		do_action( 'litespeed_tag_add', 'a3_rest' );

		return $result;
	},
	20,
	3
);

/**
 * A shared cache stores ONE copy of a response for every visitor, so a cacheable response must not depend on who asks.
 * WordPress normally echoes the caller's Origin (and sends Allow-Credentials), which a cache would then hand to the
 * wrong origin and the browser would block. Public anonymous read-only data is safe to allow from any origin, so these
 * responses (and only these) send a fixed wildcard and no credentials header. Runs after WordPress's own CORS filter.
 */
add_filter(
	'rest_pre_serve_request',
	function ( $served ) {
		if ( a3_rest_cacheable_response() && ! headers_sent() ) {
			header( 'Access-Control-Allow-Origin: *' );
			header_remove( 'Access-Control-Allow-Credentials' );
		}
		return $served;
	},
	20
);

/**
 * Purge the cached REST responses once per request when content changes, so edits appear immediately at the origin cache,
 * and (if configured) ask for a frontend rebuild.
 */
function a3_rest_purge_cache() {
	static $done = false;
	if ( $done ) {
		return;
	}
	$done = true;
	do_action( 'litespeed_purge', 'a3_rest' );
	a3_rebuild_schedule();
}

foreach ( array(
	'save_post',
	'deleted_post',
	'trashed_post',
	'untrashed_post',
	'created_term',
	'edited_term',
	'delete_term',
	'set_object_terms',
	'add_attachment',
	'edit_attachment',
	'delete_attachment',
	'added_post_meta',
	'updated_post_meta',
	'deleted_post_meta',
	'acf/save_post',
) as $a3_rest_hook ) {
	add_action( $a3_rest_hook, 'a3_rest_purge_cache' );
}
unset( $a3_rest_hook );

/* ------------------------------------------------------------------ 2. Security */

/**
 * Visitors cannot list or read user accounts through the REST API (the site does not use these routes).
 * Logged-in users, including the editor and the admin tools, keep full access.
 */
add_filter(
	'rest_endpoints',
	function ( $endpoints ) {
		if ( is_user_logged_in() ) {
			return $endpoints;
		}
		foreach ( array_keys( $endpoints ) as $route ) {
			if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
				unset( $endpoints[ $route ] );
			}
		}
		return $endpoints;
	}
);

/**
 * Baseline security headers for pages and REST responses. No Content-Security-Policy is added here: the host already sends
 * upgrade-insecure-requests, and a stricter policy would need testing against Elementor and Fluent Forms first.
 * Strict-Transport-Security is for this host only (no includeSubDomains / preload) and lasts 6 months.
 */
function a3_send_security_headers() {
	if ( headers_sent() ) {
		return;
	}
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=()' );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=15552000' );
	}
	if ( ! is_admin() ) {
		header( 'X-Frame-Options: SAMEORIGIN' );
	}
	header_remove( 'X-Powered-By' );
}
add_action( 'send_headers', 'a3_send_security_headers' );
add_filter(
	'rest_pre_serve_request',
	function ( $served ) {
		a3_send_security_headers();
		return $served;
	},
	30
);

// No user list in the sitemap, and no ?author=N username lookup for visitors.
add_filter(
	'wp_sitemaps_add_provider',
	function ( $provider, $name ) {
		return 'users' === $name ? false : $provider;
	},
	10,
	2
);
add_action(
	'template_redirect',
	function () {
		if ( ! is_user_logged_in() && isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	},
	1
);

/* ------------------------------------------------------------------ 3. Frontend rebuild trigger */

/**
 * Schedules ONE rebuild request 90 s from now (further changes in that window join it).
 * Needs, in wp-config.php:  define( 'A3_REBUILD_REPO', 'owner/private-source-repo' );  define( 'A3_REBUILD_TOKEN', '...' );
 * where the token is a GitHub fine-grained token limited to that repository with Contents: read and write (the permission
 * repository_dispatch needs). Without both constants nothing is scheduled or sent.
 */
function a3_rebuild_schedule() {
	if ( ! defined( 'A3_REBUILD_REPO' ) || ! defined( 'A3_REBUILD_TOKEN' ) || wp_installing() ) {
		return;
	}
	if ( ! wp_next_scheduled( 'a3_rebuild_dispatch' ) ) {
		wp_schedule_single_event( time() + 90, 'a3_rebuild_dispatch' );
	}
}

add_action(
	'a3_rebuild_dispatch',
	function () {
		if ( ! defined( 'A3_REBUILD_REPO' ) || ! defined( 'A3_REBUILD_TOKEN' ) ) {
			return;
		}
		wp_remote_post(
			'https://api.github.com/repos/' . A3_REBUILD_REPO . '/dispatches',
			array(
				'timeout' => 10,
				'headers' => array(
					'Accept'               => 'application/vnd.github+json',
					'Authorization'        => 'Bearer ' . A3_REBUILD_TOKEN,
					'X-GitHub-Api-Version' => '2022-11-28',
					'User-Agent'           => 'a3-educare-wordpress',
				),
				'body'    => wp_json_encode( array( 'event_type' => 'wordpress-content-updated' ) ),
			)
		);
	}
);
