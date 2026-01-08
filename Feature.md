Sounds
Different sizes for pins
Less stages
Menus to configure
Set boundaries


Rôle
Tu es un architecte logiciel senior spécialisé dans Phaser Framework. Tu dois créer un plan d'implémentation détaillé pour un jeu de Pachinko.

Architecture Existante
Le projet utilise Phaser 3 avec une architecture modulaire :

Scènes : MenuScene, GameScene, UIScene, GameOverScene, PreloadScene, BootScene
Entités : Ball, Pin
Managers : StateManager
Systèmes : AudioSystem
Configuration : gameConfig.js
Fonctionnalités à Planifier
1. Système de Joueur
Saisie et sauvegarde du pseudo
Gestion d'un solde de points (valeur initiale à définir)
Persistance du score et du pseudo
2. Mécanique de Jeu Core
Avant le lancer :
Interface pour choisir le montant du pari
Sélection de la position horizontale de départ de la balle
Pendant le jeu :
Simulation physique réaliste (gravité, collisions avec pins)
Trajectoire de la balle jusqu'aux zones de récompense
Après le lancer :
Attribution des points selon la zone d'atterrissage
Mise à jour du solde
3. Système de Progression par Thèmes
À chaque palier de points atteint, changement de thème visuel :

Football : zones de récompense sous forme de cage de foot
Basket : zones de récompense sous forme de paniers
Rugby : zones de récompense sous forme de poteaux/en-but
Questions à résoudre :

Quels sont les paliers de points pour changer de thème ?
Les thèmes changent-ils la distribution des récompenses ou seulement le visuel ?
4. Système de Bonus Payants
Le joueur peut acheter avec ses points :

Retirer des rangs de pins : réduire les obstacles pour un meilleur contrôle
Multiplicateur de points : augmenter les gains des zones de récompense
À définir :

Coût de chaque bonus
Durée ou nombre d'utilisations
Limite d'empilement des bonus
5. Conditions de Fin de Partie
Le jeu se termine quand :

Le joueur décide de quitter volontairement ("cash out")
Le joueur n'a plus de points (défaite)
6. Système de Classement
Écran de fin affichant le top 10 des meilleurs scores
Persistance locale ou serveur (à définir)
Affichage du pseudo et du score final
Livrables Attendus
Crée un plan d'implémentation incluant :

Architecture détaillée :

Nouvelles scènes nécessaires
Nouvelles entités et managers
Flux de données entre les composants
Structure des données :

Modèle du joueur
État du jeu
Format de sauvegarde du classement
Roadmap d'implémentation :

Ordre des fonctionnalités à développer
Dépendances entre les modules
Points de test intermédiaires
Configuration du jeu :

Valeurs recommandées pour tous les paramètres (points de départ, coûts, paliers, etc.)
Zones de récompense et leurs multiplicateurs
Considérations techniques :

Gestion de la physique Phaser
Système de sauvegarde (localStorage vs backend)
Performance et optimisation