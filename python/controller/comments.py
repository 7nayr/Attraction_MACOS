import request.request as req
from flask import jsonify

def add_critique(data):
  print(data, flush=True)
  if not "note" in data or data["note"] is None:
    print("Erreur: 'note' manquant ou None", flush=True)
    return False
  
  if not "commentaire" in data or data["commentaire"] == "":
    print("Erreur: 'commentaire' manquant ou vide", flush=True)
    return False

  if not "attraction_id" in data or data["attraction_id"] is None:
    print("Erreur: 'attraction_id' manquant ou None", flush=True)
    return False

  if not "user_id" in data or data["user_id"] is None:
    print("Erreur: 'user_id' manquant ou None", flush=True)
    return False

  try:
    if "critique_id" in data and data["critique_id"]:
      requete = f"""
        UPDATE critiques 
        SET note={data['note']}, commentaire='{data['commentaire']}', attraction_id={data['attraction_id']}, user_id={data['user_id']} 
        WHERE critique_id = {data['critique_id']}
      """
      req.insert_in_db(requete)
      id = data['critique_id']
    else:
      requete = """
        INSERT INTO critiques (note, commentaire, attraction_id, user_id) 
        VALUES (?, ?, ?, ?)
      """
      id = req.insert_in_db(requete, (data["note"], data["commentaire"], data["attraction_id"], data["user_id"]))
  except Exception as e:
    print(f"Erreur lors de l'insertion ou de la mise à jour de la critique: {e}", flush=True)
    return False

  return id

def get_all_critiques():
    try:
        cur, conn = req.get_db_connection()
        requete = "SELECT * FROM critiques;"
        cur.execute(requete)
        records = cur.fetchall()
        conn.close()
        return jsonify(records)
    except Exception as e:
        print(e, flush=True)
        return jsonify([])

def get_critiques_by_attraction(attraction_id):
    try:
        cur, conn = req.get_db_connection()
        requete = "SELECT critique_id, note, commentaire, attraction_id, user_id FROM critiques WHERE attraction_id = %s;"
        cur.execute(requete, (attraction_id,))
        records = cur.fetchall()
        conn.close()

        # Format the response as a list of dictionaries
        critiques = [
            {
                "critique_id": row[0],
                "note": row[1],
                "commentaire": row[2],
                "attraction_id": row[3],
                "user_id": row[4]
            }
            for row in records
        ]
        return jsonify(critiques)
    except Exception as e:
        print(e, flush=True)
        return jsonify([])


def get_critique(index):
    try:
        cur, conn = req.get_db_connection()
        requete = "SELECT * FROM critiques WHERE critique_id = %s;"
        cur.execute(requete, (index,))
        records = cur.fetchall()
        conn.close()
        return jsonify(records[0] if records else None)
    except Exception as e:
        print(e, flush=True)
        return jsonify(None)

def delete_critique(index):
    try:
        cur, conn = req.get_db_connection()
        requete = "DELETE FROM critiques WHERE critique_id = %s;"
        cur.execute(requete, (index,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(e, flush=True)
        return False