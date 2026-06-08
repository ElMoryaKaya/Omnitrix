-- ============================================================
-- OMNITRIX — Schéma PostgreSQL (Supabase)
-- Coller dans l'éditeur SQL de Supabase
-- ============================================================

-- ── Table des utilisateurs (étend auth.users) ──────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  telephone   TEXT,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger : création automatique du profil public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, nom, prenom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Table des bracelets ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bracelets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_serie      TEXT NOT NULL UNIQUE,
  batterie          INTEGER NOT NULL DEFAULT 100 CHECK (batterie BETWEEN 0 AND 100),
  statut_connexion  TEXT NOT NULL DEFAULT 'deconnecte'
                    CHECK (statut_connexion IN ('connecte', 'deconnecte')),
  derniere_position JSONB,            -- { "lat": 48.8566, "lng": 2.3522 }
  utilisateur_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  derniere_sync     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table des alertes ───────────────────────────────────────
-- Types boutons bracelet : medecin / pompier / police
-- Types capteurs automatiques : chute / batterie_faible / bracelet_deconnecte / sortie_zone / sos_manuel
CREATE TABLE IF NOT EXISTS public.alertes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_alerte    TEXT NOT NULL CHECK (type_alerte IN (
                   'medecin', 'pompier', 'police',
                   'sos_manuel', 'chute', 'malaise', 'agression',
                   'batterie_faible', 'bracelet_deconnecte', 'sortie_zone'
                 )),
  description    TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  niveau_urgence TEXT NOT NULL DEFAULT 'moyen'
                 CHECK (niveau_urgence IN ('faible', 'moyen', 'eleve', 'critique')),
  statut         TEXT NOT NULL DEFAULT 'nouvelle'
                 CHECK (statut IN (
                   'nouvelle', 'prise_en_charge', 'en_cours',
                   'resolue', 'archivee', 'annulee'
                 )),
  date_creation  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  utilisateur_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  bracelet_id    UUID REFERENCES public.bracelets(id) ON DELETE SET NULL
);

-- ── Table de l'historique des statuts ──────────────────────
CREATE TABLE IF NOT EXISTS public.historique_alertes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alerte_id           UUID NOT NULL REFERENCES public.alertes(id) ON DELETE CASCADE,
  ancien_statut       TEXT CHECK (ancien_statut IN (
                        'nouvelle', 'prise_en_charge', 'en_cours',
                        'resolue', 'archivee', 'annulee'
                      )),
  nouveau_statut      TEXT NOT NULL CHECK (nouveau_statut IN (
                        'nouvelle', 'prise_en_charge', 'en_cours',
                        'resolue', 'archivee', 'annulee'
                      )),
  date_modification   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  utilisateur_action  UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ── Index ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alertes_statut         ON public.alertes(statut);
CREATE INDEX IF NOT EXISTS idx_alertes_date           ON public.alertes(date_creation DESC);
CREATE INDEX IF NOT EXISTS idx_alertes_utilisateur    ON public.alertes(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_historique_alerte      ON public.historique_alertes(alerte_id);
CREATE INDEX IF NOT EXISTS idx_bracelets_utilisateur  ON public.bracelets(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_bracelets_serie        ON public.bracelets(numero_serie);

-- ── Fonction RPC : reçoit l'alerte de l'ESP8266 ─────────────
-- L'ESP8266 envoie : numero_serie + type + lat/lng + batterie
-- La fonction résout le bracelet_id et insère l'alerte
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
  -- Résoudre le bracelet par son numéro de série
  SELECT id, utilisateur_id
  INTO v_bracelet_id, v_utilisateur_id
  FROM public.bracelets
  WHERE numero_serie = p_numero_serie;

  IF v_bracelet_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Bracelet inconnu: ' || p_numero_serie);
  END IF;

  -- Niveau d'urgence automatique selon le type
  v_urgence := CASE p_type
    WHEN 'medecin'    THEN 'critique'
    WHEN 'pompier'    THEN 'critique'
    WHEN 'police'     THEN 'critique'
    WHEN 'sos_manuel' THEN 'critique'
    WHEN 'agression'  THEN 'critique'
    WHEN 'chute'      THEN 'eleve'
    WHEN 'malaise'    THEN 'eleve'
    WHEN 'sortie_zone'        THEN 'moyen'
    WHEN 'batterie_faible'    THEN 'faible'
    WHEN 'bracelet_deconnecte' THEN 'faible'
    ELSE 'moyen'
  END;

  -- Insérer l'alerte
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

  -- Mettre à jour le bracelet (connexion + batterie + position)
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

-- Autoriser l'utilisateur anonyme (ESP8266) à appeler cette fonction
GRANT EXECUTE ON FUNCTION public.envoyer_alerte TO anon;

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracelets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_alertes ENABLE ROW LEVEL SECURITY;

-- Admins : accès total
CREATE POLICY "admin_all_users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_bracelets" ON public.bracelets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_alertes" ON public.alertes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_historique" ON public.historique_alertes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Utilisateurs : voient leur propre profil et leurs alertes
CREATE POLICY "user_own_profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "user_own_alertes" ON public.alertes
  FOR SELECT USING (utilisateur_id = auth.uid());

-- ── Realtime ────────────────────────────────────────────────
-- Activer dans Supabase Dashboard > Database > Replication
-- Tables à activer : alertes, bracelets
