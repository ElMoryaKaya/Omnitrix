-- ============================================================
-- OMNITRIX — Données de test (seed)
-- À exécuter APRÈS schema.sql
-- Note : les UUIDs des users doivent être créés via Supabase Auth
--        puis les IDs insérés ici manuellement.
-- ============================================================

-- Exemple d'insertion d'un admin (remplacer l'UUID par le vrai)
-- INSERT INTO public.users (id, nom, prenom, email, role)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Admin', 'Super', 'admin@omnitrix.fr', 'admin');

-- Bracelets de test
INSERT INTO public.bracelets (numero_serie, batterie, statut_connexion, derniere_sync)
VALUES
  ('BR-001', 87, 'connecte',   NOW() - INTERVAL '5 minutes'),
  ('BR-002', 42, 'connecte',   NOW() - INTERVAL '2 minutes'),
  ('BR-003', 15, 'deconnecte', NOW() - INTERVAL '3 hours'),
  ('BR-004', 93, 'connecte',   NOW() - INTERVAL '1 minute'),
  ('BR-005',  8, 'deconnecte', NOW() - INTERVAL '6 hours');

-- Alertes de test (sans utilisateur ni bracelet pour simplifier)
INSERT INTO public.alertes (type_alerte, description, latitude, longitude, niveau_urgence, statut, date_creation)
VALUES
  ('sos_manuel',  'Appui long sur le bouton SOS',  48.8566,  2.3522,  'critique', 'nouvelle',        NOW() - INTERVAL '10 minutes'),
  ('chute',       'Chute détectée par accéléromètre', 48.862,   2.345,   'eleve',    'prise_en_charge', NOW() - INTERVAL '45 minutes'),
  ('malaise',     NULL,                             48.851,   2.362,   'eleve',    'en_cours',        NOW() - INTERVAL '2 hours'),
  ('batterie_faible', 'Batterie à 8%',             NULL,     NULL,    'faible',   'resolue',         NOW() - INTERVAL '5 hours'),
  ('agression',   'Signal d'agression déclenché',  48.870,   2.340,   'critique', 'archivee',        NOW() - INTERVAL '1 day'),
  ('sortie_zone', 'Sortie du périmètre défini',    48.880,   2.380,   'moyen',    'annulee',         NOW() - INTERVAL '2 days');
