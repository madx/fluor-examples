// On importe Fluor, classique
import Fluor from "./fluor.js";

// Commme on utilise la version module il faut qu'on spécifie quelles fonctions
// de l'API de Fluor on va utiliser. Ce n'est pas nécessaire si on utilise
// directement des <script type="fluor"> mais j'ai cru comprendre que tu
// voulais foutre ton JS séparément :)
// Le premier paramètre indique pour quels éléments le code Fluor doit
// s'exécuter. Ici j'ai mis form mais bien sur dans un cas réel on aura un
// sélecteur + spécifique.
Fluor("form", ({ bind, on, get, set, variable, $data }) => {
  // On déclare que l'année est une variable extraite automatiquement depuis
  // le contenu textuel de la balise ciblée, et qu'on utilise `Number` pour
  // parser cette valeur.
  let year = variable.fromTextContent("[data-target=year]", Number);
  // De façon similaire, searchFilter est dérivé de la `value` du champ ciblé.
  let searchFilter = variable.fromValue("[data-target=search]");
  // Ici, filteredData est une variable dynamique dépendante à searchFilter.
  // Cela signifique qu'à chaque fois qu'on modifie searchFilter, Fluor
  // recalcule une nouvelle valeur pour filteredData en exécutant de nouveau
  // la fonction passée en premier argument.
  // Dans celle-ci, $data correspond à ce qu'il y a dans l'attribut
  // `data-fluor-data` du composant cible de notre script Fluor (donc ici le form)
  let filteredData = variable(
    (searchFilter) => $data.filter((item) => item.label.includes(searchFilter)),
    [searchFilter]
  );

  // Un petit helper pour changer l'année
  // `set` prend une variable en premier argument et soit une nouvelle valeur
  // soit une fonction permettant de calculer une nouvelle valeur en 2e
  // argument.
  // `set` renvoie une fonction qu'on peut passer à `on`.
  let changeYear = (increment) => set(year, (year) => year + increment);

  // Bindings d'évènement, rien de bien fifou :)
  on("click", "[data-action=prevYear]", changeYear(-1));
  on("click", "[data-action=nextYear]", changeYear(+1));
  // Si on ne passe pas de paramètre à set il se contente de recalculer la valeur
  // de notre variable en réexécutant la fonction qui nous a permis de la déclarer
  // (ou en réinitialisant à la valeur par défaut si on avait utilisé ça)
  // Ici comme on a utilisé `variable.fromValue` il va prendre la nouvelle valeur
  // du champ pour mettre à jour la variable... et déclencher un recalcul de
  // `filteredData` vu que cette dernière dépend de `searchFilter`
  on("input", "[data-target=search]", set(searchFilter));

  // On déclare les variables disponibles dans notre template HTML. Il faut le faire
  // explicitement pour que Fluor soit au courant de ce qui est disponible
  bind({
    filteredData,
    year,
    nextDisabled: variable((year) => year === 2030, [year])
  });
});

// On déclare un nouveau composant correspondant aux éléments de la liste filtrée
// Rien de ouf si ce n'est que $data est automatiquement rempli par Fluor avec
// les différents éléménts successifs de la collection utilisé avec
// `data-fluor-loop` (cf. le HTML)
Fluor("form [data-target=results] li", ({ bind, variable, $data }) => {
  bind({ label: variable($data.label) });
});
