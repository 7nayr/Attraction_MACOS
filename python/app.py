from flask import Flask, jsonify, request
from flask_cors import CORS

import request.request as req
import controller.auth.auth as user
import controller.attraction as attraction
import controller.comments as comments  # Controller pour les critiques

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'

# 🏛 Routes Attraction
@app.post('/attraction')
def addAttraction():
    print("Requête reçue pour ajouter une attraction", flush=True)

    # Vérification du token
    checkToken = user.check_token(request)
    if checkToken is not True:
        return checkToken

    json = request.get_json()
    retour = attraction.add_attraction(json)

    if retour:
        return jsonify({"message": "Element ajouté.", "result": retour}), 200
    return jsonify({"message": "Erreur lors de l'ajout.", "result": retour}), 500

@app.get('/attraction')
def getAllAttraction():
    return attraction.get_all_attraction(), 200

@app.get('/attraction/<int:index>')
def getAttraction(index):
    return attraction.get_attraction(index), 200

@app.delete('/attraction/<int:index>')
def deleteAttraction(index):
    checkToken = user.check_token(request)
    if checkToken is not True:
        return checkToken

    if attraction.delete_attraction(index):
        return "Element supprimé.", 200
    return jsonify({"message": "Erreur lors de la suppression."}), 500

# 🔑 Authentification
@app.post('/login')
def login():
    json = request.get_json()

    if 'name' not in json or 'password' not in json:
        return jsonify({'messages': ["Nom ou/et mot de passe incorrect"]}), 400
    
    cur, conn = req.get_db_connection()
    requete = f"SELECT * FROM users WHERE name = '{json['name']}' AND password = '{json['password']}';"
    
    cur.execute(requete)
    records = cur.fetchall()
    conn.close()

    if not records:
        return jsonify({'messages': ["Utilisateur non trouvé"]}), 400

    return jsonify({
        "token": user.encode_auth_token(list(records[0])[0]),
        "name": json['name']
    }), 200

# 📝 Routes Critiques (Commentaires) - MODIFICATION: suppression de la vérification d'authentification
@app.post('/critique')
def addCritique():
    print("Requête reçue pour ajouter une critique", flush=True)

    # MODIFICATION: Commenté la vérification du token pour permettre l'ajout de commentaires sans authentification
    # checkToken = user.check_token(request)
    # if checkToken is not True:
    #     return checkToken

    json = request.get_json()

    # Vérification des données envoyées
    if not all(k in json for k in ['note', 'commentaire', 'attraction_id', 'user_id']):
        print("Données manquantes dans la requête critique", flush=True)
        return jsonify({"message": "Données incomplètes"}), 400

    retour = comments.add_critique(json)

    if retour:
        return jsonify({"message": "Commentaire ajouté.", "result": retour}), 201
    else:
        print("Erreur lors de l'ajout du commentaire", flush=True)
        return jsonify({"message": "Erreur lors de l'ajout du commentaire."}), 500

@app.get('/critique')
def getAllCritiques():
    return comments.get_all_critiques(), 200

@app.get('/critique/attraction/<int:attraction_id>')
def getCritiquesByAttraction(attraction_id):
    print(f"Requête reçue pour les critiques de l'attraction {attraction_id}", flush=True)
    return comments.get_critiques_by_attraction(attraction_id), 200

@app.get('/critique/<int:index>')
def getCritique(index):
    return comments.get_critique(index), 200

@app.delete('/critique/<int:index>')
def deleteCritique(index):
    checkToken = user.check_token(request)
    if checkToken is not True:
        return checkToken
    
    if comments.delete_critique(index):
        return "Commentaire supprimé.", 200
    return jsonify({"message": "Erreur lors de la suppression du commentaire."}), 500