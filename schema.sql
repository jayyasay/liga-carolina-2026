-- Liga Stats Recorder Database Schema

-- Custom Types
CREATE TYPE match_status AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELED');
CREATE TYPE player_position AS ENUM ('PG', 'SG', 'SF', 'PF', 'C');

-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Players Table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    jersey_number INTEGER,
    position player_position,
    height_cm INTEGER,
    weight_kg INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(255),
    status match_status DEFAULT 'SCHEDULED',
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    season VARCHAR(50),
    is_playoff BOOLEAN DEFAULT FALSE,
    player_of_the_game_id UUID REFERENCES players(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_different_teams CHECK (home_team_id != away_team_id)
);

-- Player Match Stats Table (Detailed Stats)
CREATE TABLE player_match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Playing Time
    minutes_played INTEGER DEFAULT 0,
    
    -- Scoring
    points INTEGER DEFAULT 0,
    fg_made INTEGER DEFAULT 0,
    fg_attempted INTEGER DEFAULT 0,
    three_pt_made INTEGER DEFAULT 0,
    three_pt_attempted INTEGER DEFAULT 0,
    ft_made INTEGER DEFAULT 0,
    ft_attempted INTEGER DEFAULT 0,
    
    -- Rebounds
    offensive_rebounds INTEGER DEFAULT 0,
    defensive_rebounds INTEGER DEFAULT 0,
    
    -- Playmaking & Defense
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    personal_fouls INTEGER DEFAULT 0,
    
    -- Advanced (can be calculated, but good to store if imported via CSV)
    plus_minus INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(match_id, player_id)
);

-- RLS (Row Level Security) Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_match_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all stats data
CREATE POLICY "Public profiles are viewable by everyone." ON teams FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON players FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON matches FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON player_match_stats FOR SELECT USING (true);

-- Functions
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_modtime BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_players_modtime BEFORE UPDATE ON players FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_matches_modtime BEFORE UPDATE ON matches FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_player_match_stats_modtime BEFORE UPDATE ON player_match_stats FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
