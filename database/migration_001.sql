-- ============================================================
-- OMNITRIX — Migration 001
-- À exécuter si le schéma initial a déjà été appliqué
-- Ajoute les types medecin/pompier/police + la fonction RPC
-- ============================================================

-- Mettre à jour la contrainte CHECK de type_alerte
ALTER TABLE public.alertes
  DROP CONSTRAINT IF EXISTS alertes_type_alerte_check;

ALTER TABLE public.alertes
  ADD CONSTRAINT alertes_type_alerte_check
  CHECK (type_alerte IN (
    'medecin', 'pompier', 'police',
    'sos_manuel', 'chute', 'malaise', 'agression',
    'batterie_faible', 'bracelet_deconnecte', 'sortie_zone'
  ));

-- Index sur numero_serie pour accélérer les lookups de l'ESP8266
CREATE INDEX IF NOT EXISTS idx_bracelets_serie ON public.bracelets(numero_serie);

-- Fonction RPC pour recevoir les alertes des bracelets
CREATE OR REPLACE FUNCTION public.envoyer_alerte(
  p_numero_serie TEXT,
  p_type         TEXT,
  p_lat          DOUBLE PRECISION DEFAULT NULL,
  p_lng          DOUBLE PRECISION DEFAULT NULL,
  p_batterie     INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bracelet_id    UUID;
  v_utilisateur_id UUID;
  v_alerte_id      UUID;
  v_urgence        TEXT;
BEGIN
  SELECT id, utilisateur_id
  INTO v_bracelet_id, v_utilisateur_id
  FROM public.bracelets
  WHERE numero_serie = p_numero_serie;

  IF v_bracelet_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Bracelet inconnu: ' || p_numero_serie);
  END IF;

  v_urgence := CASE p_type
    WHEN 'medecin'    THEN 'critique'
    WHEN 'pompier'    THEN 'critique'
    WHEN 'police'     THEN 'critique'
    WHEN 'sos_manuel' THEN 'critique'
    WHEN 'agression'  THEN 'critique'
    WHEN 'chute'      THEN 'eleve'
    WHEN 'malaise'    THEN 'eleve'
    WHEN 'sortie_zone'         THEN 'moyen'
    WHEN 'batterie_faible'     THEN 'faible'
    WHEN 'bracelet_deconnecte' THEN 'faible'
    ELSE 'moyen'
  END;

  INSERT INTO public.alertes (
    type_alerte, latitude, longitude,
    niveau_urgence, statut,
    bracelet_id, utilisateur_id
  )
  VALUES (
    p_type, p_lat, p_lng,
    v_urgence, 'nouvelle',
    v_bracelet_id, v_utilisateur_id
  )
  RETURNING id INTO v_alerte_id;

  UPDATE public.bracelets SET
    statut_connexion  = 'connecte',
    derniere_sync     = NOW(),
    batterie          = COALESCE(p_batterie, batterie),
    derniere_position = CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL
      THEN jsonb_build_object('lat', p_lat, 'lng', p_lng)
      ELSE derniere_position
    END
  WHERE id = v_bracelet_id;

  RETURN json_build_object('success', true, 'alerte_id', v_alerte_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.envoyer_alerte TO anon;
