<?php
/**
 * Plugin Name: L'Economie — GraphQL Journal/Magazine
 * Description: Réexpose les CPT ACF "journal" et "magazine" à l'API GraphQL (WPGraphQL + WPGraphQL for ACF), avec les champs numero/datePublication/pdfUrl/extrait/sommaire à plat. Nécessaire pour le site Next.js (leconomie-front). Vit ici (mu-plugins) et non dans functions.php du thème SmartMag pour survivre aux mises à jour du thème.
 * Version: 1.0
 * Author: L'Economie
 *
 * À installer dans wp-content/mu-plugins/ (chargé automatiquement, ne peut pas être désactivé par erreur).
 * Source versionnée : leconomie-front/wordpress/mu-plugins/leconomie-graphql-journal-magazine.php
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('acf/post_type/registration_args', function ($args, $post_type) {
    if (!empty($post_type['post_type']) && $post_type['post_type'] === 'journal') {
        $args['show_in_graphql']     = true;
        $args['graphql_single_name'] = 'journal';
        $args['graphql_plural_name'] = 'journaux';
    }

    if (!empty($post_type['post_type']) && $post_type['post_type'] === 'magazine') {
        $args['show_in_graphql']     = true;
        $args['graphql_single_name'] = 'magazine';
        $args['graphql_plural_name'] = 'magazines';
    }

    return $args;
}, 10, 2);

add_action('graphql_register_types', function () {
    foreach (['Journal', 'Magazine'] as $graphql_type) {
        register_graphql_field($graphql_type, 'numero', [
            'type'    => 'String',
            'resolve' => function ($post) {
                return get_field('numero', $post->ID) ?: null;
            },
        ]);
        register_graphql_field($graphql_type, 'datePublication', [
            'type'    => 'String',
            'resolve' => function ($post) {
                return get_field('date_publication', $post->ID) ?: null;
            },
        ]);
        register_graphql_field($graphql_type, 'pdfUrl', [
            'type'    => 'String',
            'resolve' => function ($post) {
                return get_field('pdf_url', $post->ID) ?: null;
            },
        ]);
    }
});

add_action('graphql_register_types', function () {
    foreach (['Journal', 'Magazine'] as $graphql_type) {
        register_graphql_field($graphql_type, 'extrait', [
            'type'    => 'String',
            'resolve' => function ($post) {
                $acf_value = get_field('extrait', $post->ID);
                if (!empty($acf_value)) {
                    return $acf_value;
                }
                $excerpt = get_the_excerpt($post->ID);
                return $excerpt ?: null;
            },
        ]);
    }

    register_graphql_field('Magazine', 'sommaire', [
        'type'    => 'String',
        'resolve' => function ($post) {
            return get_field('sommaire', $post->ID) ?: null;
        },
    ]);
});
