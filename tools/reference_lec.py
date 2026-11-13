"""Chiffres de référence de la LEC, tirés d'Oracle's Elixir, pour calibrer le moteur.

Usage : python3 tools/reference_lec.py <dossier des CSV> <année> > data/reference/lec-<année>.json
Seules les parties complètes (datacompleteness = complete) de la LEC sont comptées.
Chaque mesure : [moyenne, écart-type, nombre de valeurs].
"""
import csv
import json
import statistics as st
import sys
from collections import defaultdict

ROLES = {"top": "top", "jng": "jungle", "mid": "mid", "bot": "bot", "sup": "support"}
PER_ROLE = [
    "csat10", "goldat10", "xpat10", "csat15", "goldat15", "xpat15",
    "killsat10", "deathsat10", "killsat15", "deathsat15",
    "csat20", "goldat20", "killsat20", "deathsat20",
    "csat25", "goldat25", "killsat25", "deathsat25",
    "earned gpm",
]


def summary(values):
    return [round(st.mean(values), 2), round(st.pstdev(values), 2), len(values)]


def main(folder, year):
    path = f"{folder}/{year}_LoL_esports_match_data_from_OraclesElixir.csv"
    per_role = defaultdict(lambda: defaultdict(list))
    games = defaultdict(list)
    with open(path, newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            if r["league"] != "LEC" or r["datacompleteness"] != "complete":
                continue
            if r["position"] == "team":
                games[r["gameid"]].append(r)
                continue
            for k in PER_ROLE:
                if r[k] != "":
                    per_role[ROLES[r["position"]]][k].append(float(r[k]))
    pairs = [g for g in games.values() if len(g) == 2]
    # Somme des deux équipes ; les parties trop courtes n'ont pas de valeur à 25 min.
    both = lambda k: summary([float(g[0][k]) + float(g[1][k]) for g in pairs if g[0][k] != ""])
    out = {
        "source": f"Oracle's Elixir {year}, LEC, parties complètes",
        "games": len(pairs),
        "roles": {role: {k: summary(v) for k, v in ks.items()} for role, ks in per_role.items()},
        "duration_min": summary([float(g[0]["gamelength"]) / 60 for g in pairs]),
        "kills": both("kills"),
        "kills_at10": both("killsat10"),
        "kills_at15": both("killsat15"),
        "kills_at20": both("killsat20"),
        "kills_at25": both("killsat25"),
        "kills_per_min": summary([float(g[0]["ckpm"]) for g in pairs]),
        "team_gold_at15": summary([float(r["goldat15"]) for g in pairs for r in g]),
        "team_gold_at25": summary([float(r["goldat25"]) for g in pairs for r in g if r["goldat25"] != ""]),
        "damage_per_min": summary([float(r["dpm"]) for g in pairs for r in g]),
        "dragons": both("dragons"),
        "barons": both("barons"),
        "towers": both("towers"),
        "turret_plates": both("turretplates"),
        "inhibitors": both("inhibitors"),
        "blue_win": round(st.mean(float(r["result"]) for g in pairs for r in g if r["side"] == "Blue"), 3),
    }
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
    print()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
