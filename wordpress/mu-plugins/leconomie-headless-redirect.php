<?php
/**
 * Plugin Name: L'Economie — redirection du front WordPress vers leconomie.info
 * Description: WordPress ne sert que d'API (headless). Les pages publiques du domaine
 *              technique sont redirigées (301) vers leconomie.info pour éviter le contenu
 *              dupliqué dans Bing / les moteurs des IA et la lecture gratuite des articles premium.
 *
 * À installer dans wp-content/mu-plugins/ (chargé automatiquement, insensible aux mises à jour du thème).
 * Source versionnée : leconomie-front/wordpress/mu-plugins/leconomie-headless-redirect.php
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('template_redirect', function () {
    // Administration, rédacteurs connectés, aperçus, AJAX, cron, REST et GraphQL : on ne touche à rien
    if (is_admin() || is_user_logged_in() || is_preview() || wp_doing_ajax() || wp_doing_cron()) {
        return;
    }
    if (defined('REST_REQUEST') || (function_exists('is_graphql_http_request') && is_graphql_http_request())) {
        return;
    }
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET' || !empty($_SERVER['QUERY_STRING'])) {
        return; // formulaires, plugins (newsletter…) et URL techniques à paramètres
    }

    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    // Sitemaps Rank Math et robots.txt : lus par le frontend Next (/sitemaps/…)
    if (preg_match('#(sitemap|\.xml$|\.xsl$|robots\.txt$)#i', $path)) {
        return;
    }

    $site = 'https://leconomie.info';
    if (is_singular('post')) {
        $target = $site . '/article/' . get_post_field('post_name', get_queried_object_id());
    } elseif (is_category()) {
        // Catégories dont l'adresse diffère côté Next (cf. src/lib/categories.ts et pages pays)
        $slug = get_queried_object()->slug;
        $special = [
            'cameroun-2'                => '/cemac/cameroun',
            'republique-centrafricaine' => '/rca',
            'uemoa'                     => '/uemoa',
            'articles-premium'          => '/articles-premium',
            'uncategorized'             => '/',
        ];
        $uemoa = ['senegal', 'cote-d-ivoire', 'mali', 'burkina-faso', 'niger', 'benin', 'togo', 'guinee-bissau'];
        if (isset($special[$slug])) {
            $target = $site . $special[$slug];
        } elseif (in_array($slug, $uemoa, true)) {
            $target = $site . '/uemoa/' . $slug;
        } else {
            $target = $site . '/' . $slug;
        }
    } else {
        $target = $site . '/';
    }

    wp_redirect($target, 301, "L'Economie");
    exit;
}, 0);
